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

function parsePaginationValue(value: string | null, fallback: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const page = parsePaginationValue(searchParams.get("page"), 1);
    const limitRaw = parsePaginationValue(searchParams.get("limit"), 100);
    const limit = Math.min(limitRaw, 1000);
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            {
              nama_jasa_servis: {
                contains: search,
              },
            },
            {
              deskripsi: {
                contains: search,
              },
            },
            {
              jam_operasional: {
                contains: search,
              },
            },
          ],
        }
      : {};

    const [jasaServis, total] = await Promise.all([
      prisma.jasa_servis.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          nama_jasa_servis: "asc",
        },
      }),
      prisma.jasa_servis.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Data layanan servis berhasil diambil",
      jasaServis: serializeData(jasaServis),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET PUBLIC JASA SERVIS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data layanan servis",
      },
      { status: 500 }
    );
  }
}