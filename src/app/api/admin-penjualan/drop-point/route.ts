import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();

    const dropPoints = await prisma.drop_point.findMany({
      where: search
        ? {
            OR: [
              {
                nama_drop_point: {
                  contains: search,
                },
              },
              {
                alamat: {
                  contains: search,
                },
              },
              {
                phone: {
                  contains: search,
                },
              },
            ],
          }
        : undefined,
      orderBy: {
        nama_drop_point: "asc",
      },
      select: {
        id: true,
        nama_drop_point: true,
        alamat: true,
        phone: true,
        jam_operasional: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data Drop Point berhasil diambil.",
      data: serializeData(dropPoints),
    });
  } catch (error) {
    console.error("GET ADMIN PENJUALAN DROP POINT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data Drop Point.",
      },
      { status: 500 }
    );
  }
}