import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

function isValidDateParts(year: number, month: number, day: number) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function buildLocalDate(year: number, month: number, day: number) {
  return new Date(year, month - 1, day);
}

function getTodayTicketDate() {
  const jakartaNow = new Date(Date.now() + JAKARTA_OFFSET_MS);

  return buildLocalDate(
    jakartaNow.getUTCFullYear(),
    jakartaNow.getUTCMonth() + 1,
    jakartaNow.getUTCDate()
  );
}

function parseTicketDate(value: string | null | undefined) {
  const rawValue = String(value ?? "").trim();

  if (!rawValue) {
    return getTodayTicketDate();
  }

  const dateOnlyMatch = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);

    if (!isValidDateParts(year, month, day)) {
      return getTodayTicketDate();
    }

    return buildLocalDate(year, month, day);
  }

  const parsedDate = new Date(rawValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return getTodayTicketDate();
  }

  const jakartaDate = new Date(parsedDate.getTime() + JAKARTA_OFFSET_MS);
  const year = jakartaDate.getUTCFullYear();
  const month = jakartaDate.getUTCMonth() + 1;
  const day = jakartaDate.getUTCDate();

  if (!isValidDateParts(year, month, day)) {
    return getTodayTicketDate();
  }

  return buildLocalDate(year, month, day);
}

function formatTicketDateCode(date: Date) {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

async function generateNomorTiket(tanggalMasuk: Date) {
  const dateCode = formatTicketDateCode(tanggalMasuk);
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
    const nomorTiket = `${prefix}${String(nextNumber).padStart(3, "0")}`;

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
    const tanggalMasuk = parseTicketDate(searchParams.get("tanggal_masuk"));
    const nomorTiket = await generateNomorTiket(tanggalMasuk);

    return NextResponse.json({
      success: true,
      message: "Nomor tiket berhasil dibuat",
      nomor_tiket: nomorTiket,
    });
  } catch (error) {
    console.error("GET /api/admin-penjualan/tiket-servis/nomor error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat nomor tiket",
      },
      { status: 500 }
    );
  }
}