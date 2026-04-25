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

type RouteParams = {
  params: Promise<{
    nomorTiket: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { nomorTiket } = await params;

    const tiket = await prisma.tiket_servis.findUnique({
      where: {
        nomor_tiket: nomorTiket,
      },
      include: {
        drop_point: true,
        diagnosa_ai: true,
        diagnosa_lanjutan: {
          include: {
            users: {
              select: {
                id: true,
                nama: true,
                email: true,
              },
            },
          },
          orderBy: {
            id: "desc",
          },
        },
        detail_tiket_servis: {
          include: {
            jasa_servis: true,
            sparepart: {
              include: {
                suppliers: true,
              },
            },
          },
        },
        pembayaran_servis: true,
        garansi: true,
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

    return NextResponse.json({
      success: true,
      message: "Detail tiket servis berhasil diambil",
      data: serializeData(tiket),
    });
  } catch (error) {
    console.error("GET DETAIL TEKNISI TIKET SERVIS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil detail tiket servis",
      },
      { status: 500 }
    );
  }
}