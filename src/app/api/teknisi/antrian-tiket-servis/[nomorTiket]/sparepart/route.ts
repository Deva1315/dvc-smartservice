import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth/get-auth-session";

function serializeData(data: unknown) {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (typeof value === "bigint") return value.toString();

      if (
        value &&
        typeof value === "object" &&
        value.constructor?.name === "Decimal"
      ) {
        return value.toString();
      }

      return value;
    })
  );
}

function normalizeRole(roleName: string) {
  return roleName.toLowerCase().replace(/\s+/g, "_");
}

async function requireTeknisiSession() {
  const session = await getAuthSession();

  if (!session) {
    throw new Error("Unauthorized. Silakan login terlebih dahulu.");
  }

  const role = normalizeRole(session.roleName);

  if (role !== "teknisi" && role !== "owner") {
    throw new Error(
      "Forbidden. Hanya Teknisi atau Owner yang dapat menambahkan sparepart servis."
    );
  }

  return session;
}

function parseRequiredBigInt(value: unknown, fieldName: string) {
  if (value === undefined || value === null || value === "") {
    throw new Error(`${fieldName} wajib diisi`);
  }

  const stringValue = String(value);

  if (!/^\d+$/.test(stringValue)) {
    throw new Error(`${fieldName} harus berupa angka`);
  }

  return BigInt(stringValue);
}

function generateDetailTiketId() {
  return `DTS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

type RouteParams = {
  params: Promise<{
    nomorTiket: string;
  }>;
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireTeknisiSession();

    const { nomorTiket } = await params;
    const body = await request.json();

    const idSparepart = parseRequiredBigInt(body.id_sparepart, "Sparepart");

    const jumlah =
      body.jumlah === undefined || body.jumlah === null || body.jumlah === ""
        ? BigInt(1)
        : parseRequiredBigInt(body.jumlah, "Jumlah");

    if (jumlah <= BigInt(0)) {
      return NextResponse.json(
        {
          success: false,
          message: "Jumlah harus lebih dari 0",
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const tiket = await tx.tiket_servis.findUnique({
        where: {
          nomor_tiket: nomorTiket,
        },
      });

      if (!tiket) {
        throw new Error("Tiket servis tidak ditemukan");
      }

      if (tiket.status_servis === "Dibatalkan") {
        throw new Error("Tiket servis yang sudah dibatalkan tidak dapat ditambah sparepart.");
      }

      if (tiket.status_servis === "Diambil") {
        throw new Error("Tiket servis yang sudah diambil tidak dapat ditambah sparepart.");
      }

      const sparepart = await tx.sparepart.findUnique({
        where: {
          id: idSparepart,
        },
      });

      if (!sparepart) {
        throw new Error("Sparepart tidak ditemukan");
      }

      if (sparepart.stock < jumlah) {
        throw new Error(
          `Stok sparepart ${sparepart.nama_sparepart} tidak mencukupi`
        );
      }

      const subtotal = Number(sparepart.harga) * Number(jumlah);

      const detail = await tx.detail_tiket_servis.create({
        data: {
          id: generateDetailTiketId(),
          id_tiket_servis: tiket.id,
          id_jasa_servis: null,
          id_sparepart: idSparepart,
          jumlah,
          harga: sparepart.harga,
          subtotal,
        },
        include: {
          jasa_servis: true,
          sparepart: true,
        },
      });

      await tx.sparepart.update({
        where: {
          id: idSparepart,
        },
        data: {
          stock: {
            decrement: jumlah,
          },
        },
      });

      const stockMutasi = await tx.stock_mutasi.create({
        data: {
          id_user: BigInt(session.id),
          id_supplier: null,
          jenis_mutasi: "Barang Keluar",
          tanggal_mutasi: new Date(),
          keterangan: [
            "Sumber: Servis",
            `No. Tiket: ${tiket.nomor_tiket}`,
            `Pelanggan: ${tiket.nama_cust}`,
            `Sparepart: ${sparepart.nama_sparepart}`,
            "Keterangan: Sparepart digunakan untuk pengerjaan servis",
          ].join("\n"),
        },
      });

      await tx.detail_stock_mutasi.create({
        data: {
          id_stock_mutasi: stockMutasi.id,
          id_barang: null,
          id_sparepart: idSparepart,
          jumlah,
        },
      });

      const aggregate = await tx.detail_tiket_servis.aggregate({
        where: {
          id_tiket_servis: tiket.id,
        },
        _sum: {
          subtotal: true,
        },
      });

      await tx.tiket_servis.update({
        where: {
          id: tiket.id,
        },
        data: {
          estimasi_biaya: aggregate._sum.subtotal || 0,
        },
      });

      return detail;
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Sparepart berhasil ditambahkan ke tiket, stok dikurangi, dan tercatat sebagai Barang Keluar",
        data: serializeData(result),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST SPAREPART TEKNISI ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Gagal menambahkan sparepart";

    const status = message.includes("Unauthorized")
      ? 401
      : message.includes("Forbidden")
      ? 403
      : message.includes("tidak ditemukan")
      ? 404
      : message.includes("wajib") ||
        message.includes("harus") ||
        message.includes("tidak mencukupi") ||
        message.includes("tidak dapat")
      ? 400
      : 500;

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status }
    );
  }
}