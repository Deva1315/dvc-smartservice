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

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const sparepart = await prisma.sparepart.findUnique({
      where: {
        id: BigInt(id),
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
    });

    if (!sparepart) {
      return NextResponse.json(
        {
          success: false,
          message: "Sparepart tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Detail sparepart berhasil diambil",
      data: serializeData(sparepart),
    });
  } catch (error) {
    console.error("GET DETAIL SPAREPART ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil detail sparepart",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const idSparepart = BigInt(id);
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

    const sparepart = await prisma.sparepart.findUnique({
      where: {
        id: idSparepart,
      },
    });

    if (!sparepart) {
      return NextResponse.json(
        {
          success: false,
          message: "Sparepart tidak ditemukan",
        },
        { status: 404 }
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

    const kodeDipakaiSparepartLain = await prisma.sparepart.findFirst({
      where: {
        kode_sparepart: kodeSparepart,
        NOT: {
          id: idSparepart,
        },
      },
    });

    if (kodeDipakaiSparepartLain) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode sparepart sudah digunakan oleh sparepart lain",
        },
        { status: 409 }
      );
    }

    const sparepartUpdate = await prisma.sparepart.update({
      where: {
        id: idSparepart,
      },
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

    return NextResponse.json({
      success: true,
      message: "Sparepart berhasil diperbarui",
      data: serializeData(sparepartUpdate),
    });
  } catch (error) {
    console.error("PUT SPAREPART ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal memperbarui sparepart",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idSparepart = BigInt(id);

    const sparepart = await prisma.sparepart.findUnique({
      where: {
        id: idSparepart,
      },
      include: {
        _count: {
          select: {
            detail_stock_mutasi: true,
            detail_stock_opname: true,
            detail_tiket_servis: true,
          },
        },
      },
    });

    if (!sparepart) {
      return NextResponse.json(
        {
          success: false,
          message: "Sparepart tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const sudahDigunakan =
      sparepart._count.detail_stock_mutasi > 0 ||
      sparepart._count.detail_stock_opname > 0 ||
      sparepart._count.detail_tiket_servis > 0;

    if (sudahDigunakan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Sparepart tidak dapat dihapus karena sudah digunakan pada tiket servis atau inventory",
        },
        { status: 400 }
      );
    }

    await prisma.sparepart.delete({
      where: {
        id: idSparepart,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Sparepart berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE SPAREPART ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus sparepart",
      },
      { status: 500 }
    );
  }
}