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

  return BigInt(stringValue);
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

const MAX_SPAREPART_IMAGE_SIZE_MB = 2;
const MAX_SPAREPART_IMAGE_SIZE_BYTES = MAX_SPAREPART_IMAGE_SIZE_MB * 1024 * 1024;

function getBase64SizeBytes(value: string) {
  const base64 = value.includes(",") ? value.split(",")[1] : value;
  return Math.ceil((base64.length * 3) / 4);
}

function validateSparepartImageSize(gambar: string | null) {
  if (!gambar) {
    return null;
  }

  const sizeBytes = getBase64SizeBytes(gambar);

  if (sizeBytes > MAX_SPAREPART_IMAGE_SIZE_BYTES) {
    return `Ukuran gambar melebihi maksimal ${MAX_SPAREPART_IMAGE_SIZE_MB} MB.`;
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const idSupplier = searchParams.get("id_supplier");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search
          ? {
              OR: [
                { nama_sparepart: { contains: search } },
                { kode_sparepart: { contains: search } },
                { merk_sparepart: { contains: search } },
                { deskripsi: { contains: search } },
              ],
            }
          : {},
        idSupplier
          ? {
              id_supplier: BigInt(idSupplier),
            }
          : {},
      ],
    };

    const [sparepart, total] = await Promise.all([
      prisma.sparepart.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          id: "desc",
        },
        include: {
          suppliers: true,
          _count: {
            select: {
              detail_stock_mutasi: true,
              detail_stock_opname: true,
              detail_tiket_servis: true,
            },
          },
        },
      }),
      prisma.sparepart.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Data sparepart berhasil diambil",
      data: serializeData(sparepart),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET SPAREPART ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data sparepart",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const idSupplier = parsePositiveBigInt(body.id_supplier, "Supplier");
    const namaSparepart = body.nama_sparepart?.trim();
    const kodeSparepart = body.kode_sparepart?.trim();
    const merkSparepart = body.merk_sparepart?.trim() || null;
    const deskripsi = body.deskripsi?.trim() || null;
    const harga = parseDecimalNumber(body.harga, "Harga");
    const stock =
      body.stock === undefined || body.stock === null || body.stock === ""
        ? BigInt(0)
        : parsePositiveBigInt(body.stock, "Stock");
    const gambar = body.gambar || null;

    const gambarError = validateSparepartImageSize(gambar);

if (gambarError) {
  return NextResponse.json(
    {
      success: false,
      message: gambarError,
    },
    { status: 413 }
  );
}

    if (!namaSparepart) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama sparepart wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!kodeSparepart) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode sparepart wajib diisi",
        },
        { status: 400 }
      );
    }

    const supplier = await prisma.suppliers.findUnique({
      where: {
        id: idSupplier,
      },
    });

    if (!supplier) {
      return NextResponse.json(
        {
          success: false,
          message: "Supplier tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const kodeSudahAda = await prisma.sparepart.findUnique({
      where: {
        kode_sparepart: kodeSparepart,
      },
    });

    if (kodeSudahAda) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode sparepart sudah digunakan",
        },
        { status: 409 }
      );
    }

    const sparepartBaru = await prisma.sparepart.create({
      data: {
        id_supplier: idSupplier,
        nama_sparepart: namaSparepart,
        kode_sparepart: kodeSparepart,
        merk_sparepart: merkSparepart,
        deskripsi,
        harga,
        stock,
        gambar,
      },
      include: {
        suppliers: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Sparepart berhasil ditambahkan",
        data: serializeData(sparepartBaru),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST SPAREPART ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal menambahkan sparepart",
      },
      { status: 500 }
    );
  }
}