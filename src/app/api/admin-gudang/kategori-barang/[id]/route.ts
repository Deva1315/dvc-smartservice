import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

function serializeBigInt(data: unknown) {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const kategori = await prisma.kategori_barang.findUnique({
      where: {
        id: BigInt(id),
      },
      include: {
        barang: true,
        _count: {
          select: {
            barang: true,
          },
        },
      },
    });

    if (!kategori) {
      return NextResponse.json(
        {
          success: false,
          message: "Kategori barang tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Detail kategori barang berhasil diambil",
      data: serializeBigInt(kategori),
    });
  } catch (error) {
    console.error("GET DETAIL KATEGORI BARANG ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil detail kategori barang",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const namaKategori = body.nama_kategori?.trim();
    const deskripsi = body.deskripsi?.trim() || null;

    if (!namaKategori) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama kategori wajib diisi",
        },
        { status: 400 }
      );
    }

    const kategori = await prisma.kategori_barang.findUnique({
      where: {
        id: BigInt(id),
      },
    });

    if (!kategori) {
      return NextResponse.json(
        {
          success: false,
          message: "Kategori barang tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const duplicateKategori = await prisma.kategori_barang.findFirst({
      where: {
        nama_kategori: namaKategori,
        NOT: {
          id: BigInt(id),
        },
      },
    });

    if (duplicateKategori) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama kategori sudah digunakan",
        },
        { status: 409 }
      );
    }

    const kategoriUpdate = await prisma.kategori_barang.update({
      where: {
        id: BigInt(id),
      },
      data: {
        nama_kategori: namaKategori,
        deskripsi,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Kategori barang berhasil diperbarui",
      data: serializeBigInt(kategoriUpdate),
    });
  } catch (error) {
    console.error("PUT KATEGORI BARANG ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui kategori barang",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const kategori = await prisma.kategori_barang.findUnique({
      where: {
        id: BigInt(id),
      },
      include: {
        _count: {
          select: {
            barang: true,
          },
        },
      },
    });

    if (!kategori) {
      return NextResponse.json(
        {
          success: false,
          message: "Kategori barang tidak ditemukan",
        },
        { status: 404 }
      );
    }

    if (kategori._count.barang > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Kategori barang tidak dapat dihapus karena masih digunakan oleh data barang",
        },
        { status: 400 }
      );
    }

    await prisma.kategori_barang.delete({
      where: {
        id: BigInt(id),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Kategori barang berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE KATEGORI BARANG ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus kategori barang",
      },
      { status: 500 }
    );
  }
}