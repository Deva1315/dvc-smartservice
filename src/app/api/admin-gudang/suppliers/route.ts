import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serializeData(data: unknown) {
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
            { nama_supplier: { contains: search } },
            { alamat: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {};

    const [suppliers, total] = await Promise.all([
      prisma.suppliers.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          id: "desc",
        },
        include: {
          _count: {
            select: {
              sparepart: true,
              stock_mutasi: true,
            },
          },
        },
      }),
      prisma.suppliers.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Data supplier berhasil diambil",
      data: serializeData(suppliers),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET SUPPLIERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data supplier",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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

    const supplierSudahAda = await prisma.suppliers.findFirst({
      where: {
        nama_supplier: namaSupplier,
      },
    });

    if (supplierSudahAda) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama supplier sudah digunakan",
        },
        { status: 409 }
      );
    }

    const supplierBaru = await prisma.suppliers.create({
      data: {
        nama_supplier: namaSupplier,
        alamat,
        phone,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Supplier berhasil ditambahkan",
        data: serializeData(supplierBaru),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST SUPPLIERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan supplier",
      },
      { status: 500 }
    );
  }
}