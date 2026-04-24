import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function mapDropPointRow(dropPoint: {
  id: bigint;
  nama_drop_point: string;
  alamat: string;
  phone: string | null;
  jam_operasional: string | null;
}) {
  return {
    id: dropPoint.id.toString(),
    nama_drop_point: dropPoint.nama_drop_point,
    alamat: dropPoint.alamat,
    phone: dropPoint.phone,
    jam_operasional: dropPoint.jam_operasional,
  };
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const dropPoint = await prisma.drop_point.findUnique({
      where: {
        id: BigInt(id),
      },
    });

    if (!dropPoint) {
      return NextResponse.json(
        {
          success: false,
          message: "Drop point tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Detail drop point berhasil diambil.",
      dropPoint: mapDropPointRow(dropPoint),
    });
  } catch (error) {
    console.error("GET /api/public/drop-point/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil detail drop point.",
      },
      { status: 500 }
    );
  }
}