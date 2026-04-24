import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serializeData(data: unknown) {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const jenisMutasi = searchParams.get("jenis_mutasi");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;

    const where = {
      AND: [
        jenisMutasi
          ? {
              jenis_mutasi: jenisMutasi,
            }
          : {},
        search
          ? {
              OR: [
                {
                  jenis_mutasi: {
                    contains: search,
                  },
                },
                {
                  keterangan: {
                    contains: search,
                  },
                },
                {
                  suppliers: {
                    nama_supplier: {
                      contains: search,
                    },
                  },
                },
                {
                  users: {
                    nama: {
                      contains: search,
                    },
                  },
                },
              ],
            }
          : {},
      ],
    };

    const [data, total] = await Promise.all([
      prisma.stock_mutasi.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          id: "desc",
        },
        include: {
          suppliers: true,
          users: {
            select: {
              id: true,
              nama: true,
              email: true,
            },
          },
          detail_stock_mutasi: {
            include: {
              barang: true,
              sparepart: true,
            },
          },
        },
      }),
      prisma.stock_mutasi.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Data inventory berhasil diambil",
      data: serializeData(data),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET INVENTORY MUTASI ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data inventory",
      },
      { status: 500 }
    );
  }
}