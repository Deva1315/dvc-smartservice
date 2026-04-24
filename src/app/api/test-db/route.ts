import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export async function GET() {
  try {
    const users = await prisma.users.findMany({
      orderBy: {
        id: "asc",
      },
      take: 10,
      select: {
        id: true,
        id_roles: true,
        nama: true,
        email: true,
        address: true,
        phone: true,
        photo_profile_path: true,
        roles: {
          select: {
            id: true,
            nama_roles: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Koneksi database berhasil",
      data: serializeBigInt(users),
    });
  } catch (error) {
    console.error("TEST DB ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal akses database",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}