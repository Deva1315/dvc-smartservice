import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const { nomorTiket } = await params;
    const body = await request.json();

    const idJasaServis = parseRequiredBigInt(
      body.id_jasa_servis,
      "Jasa servis"
    );

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

    const tiket = await prisma.tiket_servis.findUnique({
      where: {
        nomor_tiket: nomorTiket,
      },
    });

    if (!tiket) {
      return NextResponse.json(
        {
          success: false,
          message: "Tiket servis tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const jasaServis = await prisma.jasa_servis.findUnique({
      where: {
        id: idJasaServis,
      },
    });

    if (!jasaServis) {
      return NextResponse.json(
        {
          success: false,
          message: "Jasa servis tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const subtotal = Number(jasaServis.harga) * Number(jumlah);

    const result = await prisma.$transaction(async (tx) => {
      const detail = await tx.detail_tiket_servis.create({
        data: {
          id: generateDetailTiketId(),
          id_tiket_servis: tiket.id,
          id_jasa_servis: idJasaServis,
          id_sparepart: null,
          jumlah,
          harga: jasaServis.harga,
          subtotal,
        },
        include: {
          jasa_servis: true,
          sparepart: true,
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
        message: "Jasa servis berhasil ditambahkan ke tiket",
        data: serializeData(result),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST JASA TEKNISI ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal menambahkan jasa servis",
      },
      { status: 500 }
    );
  }
}