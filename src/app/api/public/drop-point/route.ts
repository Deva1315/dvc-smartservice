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

export async function GET() {
  try {
    const dropPoints = await prisma.drop_point.findMany({
      orderBy: {
        nama_drop_point: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data drop point berhasil diambil.",
      dropPoints: dropPoints.map(mapDropPointRow),
    });
  } catch (error) {
    console.error("GET /api/public/drop-point error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil data drop point.",
      },
      { status: 500 }
    );
  }
}