import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serializeData(data: unknown) {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

function parseRequiredBigInt(value: unknown, fieldName: string) {
  if (value === undefined || value === null || value === "") {
    throw new Error(`${fieldName} wajib diisi`);
  }

  const stringValue = String(value);

  if (!/^\d+$/.test(stringValue)) {
    throw new Error(`${fieldName} harus berupa angka`);
  }

  return BigInt(stringValue);
}

type RouteParams = {
  params: Promise<{
    nomorTiket: string;
  }>;
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { nomorTiket } = await params;
    const body = await request.json();

    const idUser = parseRequiredBigInt(body.id_user, "User teknisi");
    const hasilDiagnosa = body.hasil_diagnosa?.trim();
    const catatanTeknisi = body.catatan_teknisi?.trim() || null;

    if (!hasilDiagnosa) {
      return NextResponse.json(
        {
          success: false,
          message: "Hasil diagnosa wajib diisi",
        },
        { status: 400 }
      );
    }

    const tiket = await prisma.tiket_servis.findUnique({
      where: {
        nomor_tiket: nomorTiket,
      },
    });

    if (!tiket) {
      return NextResponse.json(
        {
          success: false,
          message: "Tiket servis tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const user = await prisma.users.findUnique({
      where: {
        id: idUser,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User teknisi tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const diagnosa = await prisma.diagnosa_lanjutan.create({
      data: {
        id_tiket_servis: tiket.id,
        id_user: idUser,
        hasil_diagnosa: hasilDiagnosa,
        catatan_teknisi: catatanTeknisi,
      },
      include: {
        users: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Diagnosa lanjutan berhasil disimpan",
        data: serializeData(diagnosa),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST DIAGNOSA LANJUTAN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan diagnosa lanjutan",
      },
      { status: 500 }
    );
  }
}