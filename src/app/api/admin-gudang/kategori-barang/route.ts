import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serializeBigInt(data: unknown) {
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
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            {
              nama_kategori: {
                contains: search,
              },
            },
            {
              deskripsi: {
                contains: search,
              },
            },
          ],
        }
      : {};

    const [kategori, total] = await Promise.all([
      prisma.kategori_barang.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          id: "desc",
        },
        include: {
          _count: {
            select: {
              barang: true,
            },
          },
        },
      }),
      prisma.kategori_barang.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Data kategori barang berhasil diambil",
      data: serializeBigInt(kategori),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET KATEGORI BARANG ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data kategori barang",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const kategoriSudahAda = await prisma.kategori_barang.findFirst({
      where: {
        nama_kategori: namaKategori,
      },
    });

    if (kategoriSudahAda) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama kategori sudah digunakan",
        },
        { status: 409 }
      );
    }

    const kategoriBaru = await prisma.kategori_barang.create({
      data: {
        nama_kategori: namaKategori,
        deskripsi,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Kategori barang berhasil ditambahkan",
        data: serializeBigInt(kategoriBaru),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST KATEGORI BARANG ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan kategori barang",
      },
      { status: 500 }
    );
  }
}