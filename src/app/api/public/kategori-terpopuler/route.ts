import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type PopularCategoryItem = {
  id: string;
  title: string;
  image: string | null;
  totalTerjual: number;
  href: string;
};

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

function parseLimit(value: string | null) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 3;
  }

  return Math.min(Math.floor(parsed), 6);
}

function normalizeImageSource(image: string | null) {
  if (!image) {
    return null;
  }

  if (
    image.startsWith("/") ||
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:image")
  ) {
    return image;
  }

  return `data:image/jpeg;base64,${image}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get("limit"));

    const detailTransaksi = await prisma.detail_transaksi.findMany({
      where: {
        transaksi_penjualan: {
          status_transaksi: "Dibayar",
        },
      },
      select: {
        jumlah: true,
        barang: {
          select: {
            id: true,
            nama_barang: true,
            gambar: true,
            kategori_barang: {
              select: {
                id: true,
                nama_kategori: true,
              },
            },
          },
        },
      },
    });

    const categoryMap = new Map<
      string,
      {
        id: string;
        title: string;
        totalTerjual: number;
        image: string | null;
        bestProductSold: number;
      }
    >();

    for (const detail of detailTransaksi) {
      const kategori = detail.barang.kategori_barang;
      const kategoriId = kategori.id.toString();
      const jumlah = Number(detail.jumlah ?? 0);

      const current = categoryMap.get(kategoriId) ?? {
        id: kategoriId,
        title: kategori.nama_kategori,
        totalTerjual: 0,
        image: null,
        bestProductSold: 0,
      };

      current.totalTerjual += jumlah;

      if (detail.barang.gambar && jumlah >= current.bestProductSold) {
        current.image = normalizeImageSource(detail.barang.gambar);
        current.bestProductSold = jumlah;
      }

      categoryMap.set(kategoriId, current);
    }

    let kategoriTerpopuler: PopularCategoryItem[] = Array.from(
      categoryMap.values()
    )
      .sort((a, b) => b.totalTerjual - a.totalTerjual)
      .slice(0, limit)
      .map((item) => ({
        id: item.id,
        title: item.title,
        image: item.image,
        totalTerjual: item.totalTerjual,
        href: "/produk",
      }));

    if (kategoriTerpopuler.length < limit) {
      const existingIds = new Set(kategoriTerpopuler.map((item) => item.id));

      const fallbackKategori = await prisma.kategori_barang.findMany({
        where: existingIds.size
          ? {
              id: {
                notIn: Array.from(existingIds).map((id) => BigInt(id)),
              },
            }
          : undefined,
        take: limit - kategoriTerpopuler.length,
        orderBy: {
          nama_kategori: "asc",
        },
        include: {
          barang: {
            take: 1,
            orderBy: {
              nama_barang: "asc",
            },
            select: {
              gambar: true,
            },
          },
        },
      });

      kategoriTerpopuler = [
        ...kategoriTerpopuler,
        ...fallbackKategori.map((kategori) => ({
          id: kategori.id.toString(),
          title: kategori.nama_kategori,
          image: normalizeImageSource(kategori.barang[0]?.gambar ?? null),
          totalTerjual: 0,
          href: "/produk",
        })),
      ];
    }

    return NextResponse.json({
      success: true,
      message: "Kategori terpopuler berhasil diambil",
      kategori: serializeData(kategoriTerpopuler),
    });
  } catch (error) {
    console.error("GET PUBLIC KATEGORI TERPOPULER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil kategori terpopuler",
      },
      { status: 500 }
    );
  }
}
