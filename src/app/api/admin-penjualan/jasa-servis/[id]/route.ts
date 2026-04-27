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

function parseBigIntId(value: string) {
  if (!/^\d+$/.test(value)) {
    throw new Error("ID jasa servis tidak valid");
  }

  return BigInt(value);
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

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idJasaServis = parseBigIntId(id);

    const jasaServis = await prisma.jasa_servis.findUnique({
      where: {
        id: idJasaServis,
      },
      include: {
        _count: {
          select: {
            detail_tiket_servis: true,
          },
        },
      },
    });

    if (!jasaServis) {
      return NextResponse.json(
        {
          success: false,
          message: "Jasa servis tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Detail jasa servis berhasil diambil",
      data: serializeData({
        ...jasaServis,
        slug: createSlug(jasaServis.nama_jasa_servis),
      }),
    });
  } catch (error) {
    console.error("GET DETAIL JASA SERVIS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil detail jasa servis",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idJasaServis = parseBigIntId(id);
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

    const existing = await prisma.jasa_servis.findUnique({
      where: {
        id: idJasaServis,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Jasa servis tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const duplicate = await prisma.jasa_servis.findFirst({
      where: {
        nama_jasa_servis: namaJasaServis,
        NOT: {
          id: idJasaServis,
        },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama jasa servis sudah digunakan oleh jasa lain",
        },
        { status: 409 }
      );
    }

    const updated = await prisma.jasa_servis.update({
      where: {
        id: idJasaServis,
      },
      data: {
        nama_jasa_servis: namaJasaServis,
        deskripsi,
        harga,
        jam_operasional: jamOperasional,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Jasa servis berhasil diperbarui",
      data: serializeData({
        ...updated,
        slug: createSlug(updated.nama_jasa_servis),
      }),
    });
  } catch (error) {
    console.error("PUT JASA SERVIS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal memperbarui jasa servis",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idJasaServis = parseBigIntId(id);

    const jasaServis = await prisma.jasa_servis.findUnique({
      where: {
        id: idJasaServis,
      },
      include: {
        _count: {
          select: {
            detail_tiket_servis: true,
          },
        },
      },
    });

    if (!jasaServis) {
      return NextResponse.json(
        {
          success: false,
          message: "Jasa servis tidak ditemukan",
        },
        { status: 404 }
      );
    }

    if (jasaServis._count.detail_tiket_servis > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Jasa servis tidak dapat dihapus karena sudah digunakan pada tiket servis",
        },
        { status: 400 }
      );
    }

    await prisma.jasa_servis.delete({
      where: {
        id: idJasaServis,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Jasa servis berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE JASA SERVIS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal menghapus jasa servis",
      },
      { status: 500 }
    );
  }
}