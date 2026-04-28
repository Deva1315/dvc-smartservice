import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth/get-auth-session";

export const runtime = "nodejs";

function serializeData(data: unknown) {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (typeof value === "bigint") {
        return value.toString();
      }

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

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

function normalizeRole(roleName: string) {
  return roleName.toLowerCase().replace(/\s+/g, "_");
}

async function requireAdminPenjualanSession() {
  const session = await getAuthSession();

  if (!session) {
    throw new Error("Unauthorized. Silakan login terlebih dahulu.");
  }

  const role = normalizeRole(session.roleName);

  if (role !== "admin_penjualan" && role !== "owner") {
    throw new Error(
      "Forbidden. Hanya Admin Penjualan atau Owner yang dapat mengakses POS."
    );
  }

  return session;
}

function parseBigIntId(value: string) {
  if (!/^\d+$/.test(value)) {
    throw new Error("ID transaksi tidak valid");
  }

  return BigInt(value);
}

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDateCode(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function buildNomorTransaksi(id: bigint | string, tanggal: Date) {
  return `INV-${formatDateCode(tanggal)}-${String(id).padStart(4, "0")}`;
}

type TransaksiWithRelations = Prisma.transaksi_penjualanGetPayload<{
  include: {
    users: {
      select: {
        id: true;
        nama: true;
        email: true;
      };
    };
    detail_transaksi: {
      include: {
        barang: {
          include: {
            kategori_barang: true;
          };
        };
      };
    };
  };
}>;

function buildTransaksiResponse(transaksi: TransaksiWithRelations) {
  const subtotalFromDetail = transaksi.detail_transaksi.reduce((total, item) => {
    return total + toNumber(item.sub_total);
  }, 0);

  const subtotalTransaksi = toNumber(transaksi.subtotal_transaksi);
  const diskonTransaksi = toNumber(transaksi.diskon_transaksi);
  const totalTransaksi = toNumber(transaksi.total_transaksi);
  const nominalBayar = toNumber(transaksi.nominal_bayar);
  const kembalian = toNumber(transaksi.kembalian);

  return {
    id: transaksi.id,
    nomor_transaksi: buildNomorTransaksi(
      transaksi.id,
      transaksi.tanggal_transaksi
    ),
    id_user: transaksi.id_user,
    tanggal_transaksi: transaksi.tanggal_transaksi,

    subtotal_transaksi: transaksi.subtotal_transaksi,
    diskon_transaksi: transaksi.diskon_transaksi,
    total_transaksi: transaksi.total_transaksi,
    nominal_bayar: transaksi.nominal_bayar,
    kembalian: transaksi.kembalian,

    metode_transaksi: transaksi.metode_transaksi,
    status_transaksi: transaksi.status_transaksi,

    subtotal: subtotalTransaksi || subtotalFromDetail,
    diskon: diskonTransaksi,
    total: totalTransaksi,
    nominal_bayar_number: nominalBayar,
    kembalian_number: kembalian,

    admin: {
      id: transaksi.users.id,
      nama: transaksi.users.nama,
      email: transaksi.users.email,
    },

    detail_transaksi: transaksi.detail_transaksi.map((item) => ({
      id: item.id,
      id_transaksi: item.id_transaksi,
      id_barang: item.id_barang,
      jumlah: item.jumlah,
      harga_satuan: item.harga_satuan,
      sub_total: item.sub_total,
      barang: item.barang,
    })),
  };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdminPenjualanSession();

    const { id } = await params;
    const idTransaksi = parseBigIntId(id);

    const transaksi = await prisma.transaksi_penjualan.findUnique({
      where: {
        id: idTransaksi,
      },
      include: {
        users: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
        detail_transaksi: {
          include: {
            barang: {
              include: {
                kategori_barang: true,
              },
            },
          },
        },
      },
    });

    if (!transaksi) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaksi POS tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Detail transaksi POS berhasil diambil",
      data: serializeData(buildTransaksiResponse(transaksi)),
    });
  } catch (error) {
    console.error("GET DETAIL POS TRANSAKSI ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Gagal mengambil detail transaksi POS";

    const status = message.includes("Unauthorized")
      ? 401
      : message.includes("Forbidden")
      ? 403
      : message.includes("tidak valid")
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