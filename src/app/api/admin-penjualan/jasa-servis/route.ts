import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serializeData(data: unknown) {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (typeof value === "bigint") return value.toString();

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

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseHarga(value: unknown) {
  if (value === undefined || value === null || value === "") {
    throw new Error("Harga wajib diisi");
  }

  const numberValue = Number(value);

  if (Number.isNaN(numberValue) || numberValue < 0) {
    throw new Error("Harga harus berupa angka valid dan tidak boleh negatif");
  }

  return numberValue;
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
              nama_jasa_servis: {
                contains: search,
              },
            },
            {
              deskripsi: {
                contains: search,
              },
            },
            {
              jam_operasional: {
                contains: search,
              },
            },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.jasa_servis.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          id: "desc",
        },
        include: {
          _count: {
            select: {
              detail_tiket_servis: true,
            },
          },
        },
      }),
      prisma.jasa_servis.count({
        where,
      }),
    ]);

    const mappedData = data.map((item) => ({
      ...item,
      slug: createSlug(item.nama_jasa_servis),
    }));

    return NextResponse.json({
      success: true,
      message: "Data jasa servis berhasil diambil",
      data: serializeData(mappedData),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET ADMIN PENJUALAN JASA SERVIS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data jasa servis",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const namaJasaServis = body.nama_jasa_servis?.trim();
    const deskripsi = body.deskripsi?.trim() || null;
    const harga = parseHarga(body.harga);
    const jamOperasional = body.jam_operasional?.trim();

    if (!namaJasaServis) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama jasa servis wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!jamOperasional) {
      return NextResponse.json(
        {
          success: false,
          message: "Jam operasional wajib diisi",
        },
        { status: 400 }
      );
    }

    const duplicate = await prisma.jasa_servis.findFirst({
      where: {
        nama_jasa_servis: namaJasaServis,
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama jasa servis sudah digunakan",
        },
        { status: 409 }
      );
    }

    const jasaServis = await prisma.jasa_servis.create({
      data: {
        nama_jasa_servis: namaJasaServis,
        deskripsi,
        harga,
        jam_operasional: jamOperasional,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Jasa servis berhasil ditambahkan",
        data: serializeData({
          ...jasaServis,
          slug: createSlug(jasaServis.nama_jasa_servis),
        }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST ADMIN PENJUALAN JASA SERVIS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal menambahkan jasa servis",
      },
      { status: 500 }
    );
  }
}