import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProductSlug } from "@/utils/slug/slug.utils";

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
    const idKategori = searchParams.get("id_kategori")?.trim() || "";
    const page = parsePaginationValue(searchParams.get("page"), 1);
    const limitRaw = parsePaginationValue(searchParams.get("limit"), 100);
    const limit = Math.min(limitRaw, 1000);
    const skip = (page - 1) * limit;

    let kategoriFilter: bigint | null = null;

    if (idKategori) {
      if (!/^\d+$/.test(idKategori)) {
        return NextResponse.json(
          {
            success: false,
            message: "ID kategori tidak valid",
          },
          { status: 400 }
        );
      }

      kategoriFilter = BigInt(idKategori);
    }

    const where = {
      AND: [
        search
          ? {
              OR: [
                {
                  nama_barang: {
                    contains: search,
                  },
                },
                {
                  kode_barang: {
                    contains: search,
                  },
                },
                {
                  merk_barang: {
                    contains: search,
                  },
                },
                {
                  deskripsi: {
                    contains: search,
                  },
                },
                {
                  kategori_barang: {
                    nama_kategori: {
                      contains: search,
                    },
                  },
                },
              ],
            }
          : {},
        kategoriFilter
          ? {
              id_kategori: kategoriFilter,
            }
          : {},
      ],
    };

    const [produk, total, kategoriBarang] = await Promise.all([
      prisma.barang.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          nama_barang: "asc",
        },
        include: {
          kategori_barang: true,
        },
      }),
      prisma.barang.count({
        where,
      }),
      prisma.kategori_barang.findMany({
        orderBy: {
          nama_kategori: "asc",
        },
      }),
    ]);

    const produkDenganSlug = produk.map((item) => ({
      ...item,
      slug: createProductSlug(item.nama_barang, item.kode_barang),
    }));

    return NextResponse.json({
      success: true,
      message: "Data produk berhasil diambil",
      produk: serializeData(produkDenganSlug),
      kategori: serializeData(kategoriBarang),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET PUBLIC PRODUK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data produk",
      },
      { status: 500 }
    );
  }
}