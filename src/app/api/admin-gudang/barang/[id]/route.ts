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

const MAX_BARANG_IMAGE_SIZE_MB = 2;
const MAX_BARANG_IMAGE_SIZE_BYTES = MAX_BARANG_IMAGE_SIZE_MB * 1024 * 1024;

function getBase64SizeBytes(value: string) {
  const base64 = value.includes(",") ? value.split(",")[1] : value;
  return Math.ceil((base64.length * 3) / 4);
}

function validateBarangImageSize(gambar: string | null) {
  if (!gambar) {
    return null;
  }

  const sizeBytes = getBase64SizeBytes(gambar);

  if (sizeBytes > MAX_BARANG_IMAGE_SIZE_BYTES) {
    return `Ukuran gambar melebihi maksimal ${MAX_BARANG_IMAGE_SIZE_MB} MB.`;
  }

  return null;
}

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const barang = await prisma.barang.findUnique({
      where: {
        id: BigInt(id),
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
    });

    if (!barang) {
      return NextResponse.json(
        {
          success: false,
          message: "Barang tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Detail barang berhasil diambil",
      data: serializeData(barang),
    });
  } catch (error) {
    console.error("GET DETAIL BARANG ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil detail barang",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const idBarang = BigInt(id);
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

    const gambarError = validateBarangImageSize(gambar);

if (gambarError) {
  return NextResponse.json(
    {
      success: false,
      message: gambarError,
    },
    { status: 413 }
  );
}

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

    const barang = await prisma.barang.findUnique({
      where: {
        id: idBarang,
      },
    });

    if (!barang) {
      return NextResponse.json(
        {
          success: false,
          message: "Barang tidak ditemukan",
        },
        { status: 404 }
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

    const kodeDipakaiBarangLain = await prisma.barang.findFirst({
      where: {
        kode_barang: kodeBarang,
        NOT: {
          id: idBarang,
        },
      },
    });

    if (kodeDipakaiBarangLain) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode barang sudah digunakan oleh barang lain",
        },
        { status: 409 }
      );
    }

    const barangUpdate = await prisma.barang.update({
      where: {
        id: idBarang,
      },
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

    return NextResponse.json({
      success: true,
      message: "Barang berhasil diperbarui",
      data: serializeData(barangUpdate),
    });
  } catch (error) {
    console.error("PUT BARANG ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Gagal memperbarui barang",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idBarang = BigInt(id);

    const barang = await prisma.barang.findUnique({
      where: {
        id: idBarang,
      },
      include: {
        _count: {
          select: {
            detail_stock_mutasi: true,
            detail_stock_opname: true,
            detail_transaksi: true,
          },
        },
      },
    });

    if (!barang) {
      return NextResponse.json(
        {
          success: false,
          message: "Barang tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const sudahDigunakan =
      barang._count.detail_stock_mutasi > 0 ||
      barang._count.detail_stock_opname > 0 ||
      barang._count.detail_transaksi > 0;

    if (sudahDigunakan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Barang tidak dapat dihapus karena sudah digunakan pada transaksi atau inventory",
        },
        { status: 400 }
      );
    }

    await prisma.barang.delete({
      where: {
        id: idBarang,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Barang berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE BARANG ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus barang",
      },
      { status: 500 }
    );
  }
}
