import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function formatDateCode(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function parseDate(value: string | null) {
  if (!value) {
    return new Date();
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
}

async function generateNomorTiket(tanggalMasuk: Date) {
  const dateCode = formatDateCode(tanggalMasuk);
  const prefix = `TK-${dateCode}-`;

  const existingTickets = await prisma.tiket_servis.findMany({
    where: {
      nomor_tiket: {
        startsWith: prefix,
      },
    },
    select: {
      nomor_tiket: true,
    },
  });

  const usedNumbers = existingTickets
    .map((ticket) => {
      const suffix = ticket.nomor_tiket.replace(prefix, "");
      const number = Number(suffix);

      return Number.isInteger(number) ? number : 0;
    })
    .filter((value) => value > 0);

  let nextNumber = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 1;

  while (true) {
    const nomorTiket = `${prefix}${String(nextNumber).padStart(4, "0")}`;

    const existing = await prisma.tiket_servis.findUnique({
      where: {
        nomor_tiket: nomorTiket,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return nomorTiket;
    }

    nextNumber += 1;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggalMasuk = parseDate(searchParams.get("tanggal_masuk"));

    const nomorTiket = await generateNomorTiket(tanggalMasuk);

    return NextResponse.json({
      success: true,
      message: "Nomor tiket berhasil dibuat.",
      nomor_tiket: nomorTiket,
    });
  } catch (error) {
    console.error("GET /api/tiket-servis/nomor error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat nomor tiket.",
      },
      { status: 500 }
    );
  }
}