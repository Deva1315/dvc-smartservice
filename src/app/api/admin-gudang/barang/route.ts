import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

function parsePositiveBigInt(value: unknown, fieldName: string) {
  if (value === undefined || value === null || value === "") {
    throw new Error(`${fieldName} wajib diisi`);
  }

  const stringValue = String(value);

  if (!/^\d+$/.test(stringValue)) {
    throw new Error(`${fieldName} harus berupa angka`);
  }

  const parsed = BigInt(stringValue);

  if (parsed <= BigInt(0)) {
    throw new Error(`${fieldName} tidak valid`);
  }

  return parsed;
}

function parseDecimalNumber(value: unknown, fieldName: string) {
  if (value === undefined || value === null || value === "") {
    throw new Error(`${fieldName} wajib diisi`);
  }

  const numberValue = Number(value);

  if (Number.isNaN(numberValue) || numberValue < 0) {
    throw new Error(`${fieldName} harus berupa angka valid dan tidak boleh negatif`);
  }

  return numberValue;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const idKategori = searchParams.get("id_kategori");
    const idSupplier = searchParams.get("id_supplier");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;

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
                  suppliers: {
                    nama_supplier: {
                      contains: search,
                    },
                  },
                },
              ],
            }
          : {},
        idKategori
          ? {
              id_kategori: BigInt(idKategori),
            }
          : {},
        idSupplier
          ? {
              id_supplier: BigInt(idSupplier),
            }
          : {},
      ],
    };

    const [barang, total] = await Promise.all([
      prisma.barang.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          id: "desc",
        },
        include: {
          kategori_barang: true,
          suppliers: true,
          _count: {
            select: {
              detail_stock_mutasi: true,
              detail_stock_opname: true,
              detail_transaksi: true,
            },
          },
        },
      }),
      prisma.barang.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Data barang berhasil diambil",
      data: serializeData(barang),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET BARANG ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data barang",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const idKategori = parsePositiveBigInt(body.id_kategori, "Kategori barang");
    const idSupplier = parsePositiveBigInt(body.id_supplier, "Supplier");
    const namaBarang = body.nama_barang?.trim();
    const kodeBarang = body.kode_barang?.trim();
    const merkBarang = body.merk_barang?.trim() || null;
    const deskripsi = body.deskripsi?.trim() || null;
    const harga = parseDecimalNumber(body.harga, "Harga");
    const stock = body.stock === undefined || body.stock === null || body.stock === ""
      ? BigInt(0)
      : parsePositiveBigInt(body.stock, "Stock");
    const gambar = body.gambar || null;

    if (!namaBarang) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama barang wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!kodeBarang) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode barang wajib diisi",
        },
        { status: 400 }
      );
    }

    const [kategori, supplier] = await Promise.all([
      prisma.kategori_barang.findUnique({
        where: {
          id: idKategori,
        },
      }),
      prisma.suppliers.findUnique({
        where: {
          id: idSupplier,
        },
      }),
    ]);

    if (!kategori) {
      return NextResponse.json(
        {
          success: false,
          message: "Kategori barang tidak ditemukan",
        },
        { status: 404 }
      );
    }

    if (!supplier) {
      return NextResponse.json(
        {
          success: false,
          message: "Supplier tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const kodeSudahAda = await prisma.barang.findUnique({
      where: {
        kode_barang: kodeBarang,
      },
    });

    if (kodeSudahAda) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode barang sudah digunakan",
        },
        { status: 409 }
      );
    }

    const barangBaru = await prisma.barang.create({
      data: {
        id_kategori: idKategori,
        id_supplier: idSupplier,
        nama_barang: namaBarang,
        kode_barang: kodeBarang,
        merk_barang: merkBarang,
        deskripsi,
        harga,
        stock,
        gambar,
      },
      include: {
        kategori_barang: true,
        suppliers: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Barang berhasil ditambahkan",
        data: serializeData(barangBaru),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST BARANG ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Gagal menambahkan barang",
      },
      { status: 500 }
    );
  }
}
