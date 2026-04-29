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

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    const produkList = await prisma.barang.findMany({
      include: {
        kategori_barang: true,
      },
      orderBy: {
        nama_barang: "asc",
      },
    });

    const produk = produkList.find((item) => {
      const productSlug = createProductSlug(item.nama_barang, item.kode_barang);
      return productSlug === decodedSlug;
    });

    if (!produk) {
      return NextResponse.json(
        {
          success: false,
          message: "Produk tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Detail produk berhasil diambil",
      produk: serializeData({
        ...produk,
        slug: createProductSlug(produk.nama_barang, produk.kode_barang),
      }),
    });
  } catch (error) {
    console.error("GET PUBLIC DETAIL PRODUK BY SLUG ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil detail produk",
      },
      { status: 500 }
    );
  }
}