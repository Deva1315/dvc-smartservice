import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serializeData(data: unknown) {
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

    const supplier = await prisma.suppliers.findUnique({
      where: {
        id: BigInt(id),
      },
      include: {
        sparepart: true,
        _count: {
          select: {
            sparepart: true,
            stock_mutasi: true,
          },
        },
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

    return NextResponse.json({
      success: true,
      message: "Detail supplier berhasil diambil",
      data: serializeData(supplier),
    });
  } catch (error) {
    console.error("GET DETAIL SUPPLIER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil detail supplier",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const idSupplier = BigInt(id);
    const namaSupplier = body.nama_supplier?.trim();
    const alamat = body.alamat?.trim() || null;
    const phone = body.phone?.trim() || null;

    if (!namaSupplier) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama supplier wajib diisi",
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

    const duplicateSupplier = await prisma.suppliers.findFirst({
      where: {
        nama_supplier: namaSupplier,
        NOT: {
          id: idSupplier,
        },
      },
    });

    if (duplicateSupplier) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama supplier sudah digunakan",
        },
        { status: 409 }
      );
    }

    const supplierUpdate = await prisma.suppliers.update({
      where: {
        id: idSupplier,
      },
      data: {
        nama_supplier: namaSupplier,
        alamat,
        phone,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Supplier berhasil diperbarui",
      data: serializeData(supplierUpdate),
    });
  } catch (error) {
    console.error("PUT SUPPLIER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui supplier",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idSupplier = BigInt(id);

    const supplier = await prisma.suppliers.findUnique({
      where: {
        id: idSupplier,
      },
      include: {
        _count: {
          select: {
            sparepart: true,
            stock_mutasi: true,
          },
        },
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

    const sudahDigunakan =
      supplier._count.sparepart > 0 || supplier._count.stock_mutasi > 0;

    if (sudahDigunakan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Supplier tidak dapat dihapus karena sudah digunakan oleh sparepart atau stock mutasi",
        },
        { status: 400 }
      );
    }

    await prisma.suppliers.delete({
      where: {
        id: idSupplier,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Supplier berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE SUPPLIER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus supplier",
      },
      { status: 500 }
    );
  }
}