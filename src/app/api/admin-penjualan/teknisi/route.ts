import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serializeData(data: unknown) {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export async function GET() {
  try {
    const data = await prisma.users.findMany({
      where: {
        roles: {
          nama_roles: {
            contains: "Teknisi",
          },
        },
      },
      orderBy: {
        nama: "asc",
      },
      select: {
        id: true,
        nama: true,
        email: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data teknisi berhasil diambil",
      data: serializeData(data),
    });
  } catch (error) {
    console.error("GET TEKNISI ADMIN PENJUALAN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data teknisi",
      },
      { status: 500 }
    );
  }
}