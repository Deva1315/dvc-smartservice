import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const GUEST_TICKET_COOKIE_NAME = "dvc_guest_ticket_session";
const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

function errorJson(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

function isValidDateParts(year: number, month: number, day: number) {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
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

function parseTicketDate(value: string | null | undefined) {
  const rawValue = String(value ?? "").trim();

  if (!rawValue) {
    return null;
  }

  const dateOnlyMatch = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);

    if (!isValidDateParts(year, month, day)) {
      return null;
    }

    return buildLocalDate(year, month, day);
  }

  const parsedDate = new Date(rawValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  const jakartaDate = new Date(parsedDate.getTime() + JAKARTA_OFFSET_MS);
  const year = jakartaDate.getUTCFullYear();
  const month = jakartaDate.getUTCMonth() + 1;
  const day = jakartaDate.getUTCDate();

  if (!isValidDateParts(year, month, day)) {
    return null;
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

function splitAiListText(value: string | null | undefined) {
  return String(value ?? "")
    .split("\n")
    .map((item) =>
      item
        .replace(/^[-•]\s*/, "")
        .replace(/^\d+[.)]\s*/, "")
        .trim()
    )
    .filter(Boolean);
}

function pilihSolusiTerbaik(diagnosaAi?: {
  kemungkinan_solusi: string | null;
  saran_tindakan: string | null;
} | null) {
  if (!diagnosaAi) {
    return null;
  }

  const solusi = splitAiListText(diagnosaAi.kemungkinan_solusi);
  const saran = splitAiListText(diagnosaAi.saran_tindakan);

  return solusi[0] || saran[0] || null;
}

async function validateDiagnosaAiId(value: unknown) {
  const rawValue = String(value ?? "").trim();

  if (!rawValue) {
    return null;
  }

  if (!/^\d+$/.test(rawValue)) {
    throw new Error("ID Diagnosa AI tidak valid");
  }

  const diagnosaAi = await prisma.diagnosa_ai.findUnique({
    where: {
      id: BigInt(rawValue),
    },
    select: {
      id: true,
    },
  });

  if (!diagnosaAi) {
    throw new Error("Data Diagnosa AI tidak ditemukan");
  }

  const linkedTicket = await prisma.tiket_servis.findFirst({
    where: {
      id_diagnosa_ai: diagnosaAi.id,
    },
    select: {
      nomor_tiket: true,
    },
  });

  if (linkedTicket) {
    throw new Error(
      `Diagnosa AI ini sudah digunakan pada tiket ${linkedTicket.nomor_tiket}`
    );
  }

  return diagnosaAi.id;
}

function normalizeTicketResponse(ticket: {
  id: string;
  id_diagnosa_ai: bigint | null;
  diagnosa_ai?: {
    kemungkinan_solusi: string | null;
    saran_tindakan: string | null;
  } | null;
  nomor_tiket: string;
  tanggal_masuk: Date;
  nama_cust: string;
  phone_cust: string;
  alamat_cust: string;
  jenis_perangkat: string;
  merk_perangkat: string | null;
  keluhan: string;
  id_drop_point: bigint | null;
  sumber_tiket: "Guest" | "Admin_Penjualan";
  status_verifikasi: "Menunggu" | "Diterima" | "Ditolak";
  status_servis:
    | "Belum_Diproses"
    | "Diproses"
    | "Menunggu_Sparepart"
    | "Selesai"
    | "Diambil"
    | "Dibatalkan";
  guest_session_id: string | null;
}) {
  return {
    id: ticket.id,
    id_diagnosa_ai: ticket.id_diagnosa_ai
      ? ticket.id_diagnosa_ai.toString()
      : null,
    diagnosa_awal_kerusakan: pilihSolusiTerbaik(ticket.diagnosa_ai),
    nomor_tiket: ticket.nomor_tiket,
    tanggal_masuk: ticket.tanggal_masuk.toISOString(),
    nama_cust: ticket.nama_cust,
    phone_cust: ticket.phone_cust,
    alamat_cust: ticket.alamat_cust,
    jenis_perangkat: ticket.jenis_perangkat,
    merk_perangkat: ticket.merk_perangkat,
    keluhan: ticket.keluhan,
    gunakan_drop_point: ticket.id_drop_point !== null,
    drop_point_id: ticket.id_drop_point ? ticket.id_drop_point.toString() : null,
    sumber_tiket: ticket.sumber_tiket,
    status_verifikasi: ticket.status_verifikasi,
    status_servis: ticket.status_servis,
    guest_session_id: ticket.guest_session_id,
  };
}

async function getOrCreateGuestSessionId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(GUEST_TICKET_COOKIE_NAME)?.value;

  if (existing) {
    return {
      guestSessionId: existing,
      isNew: false,
    };
  }

  return {
    guestSessionId: randomUUID(),
    isNew: true,
  };
}

function generateTiketServisId() {
  return `TS-${Date.now()}-${randomUUID().slice(0, 8)}`;
}

export async function GET() {
  try {
    const { guestSessionId, isNew } = await getOrCreateGuestSessionId();

    const tickets = await prisma.tiket_servis.findMany({
      where: {
        sumber_tiket: "Guest",
        guest_session_id: guestSessionId,
      },
      include: {
        drop_point: true,
        diagnosa_ai: {
          select: {
            kemungkinan_solusi: true,
            saran_tindakan: true,
          },
        },
      },
      orderBy: {
        tanggal_masuk: "desc",
      },
    });

    const response = NextResponse.json({
      success: true,
      message: "Data tiket servis guest berhasil diambil",
      tickets: tickets.map((ticket) => ({
        ...normalizeTicketResponse(ticket),
        drop_point_nama: ticket.drop_point?.nama_drop_point ?? null,
      })),
    });

    if (isNew) {
      response.cookies.set(GUEST_TICKET_COOKIE_NAME, guestSessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error) {
    console.error("GET /api/public/tiket-servis error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil tiket servis",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { guestSessionId, isNew } = await getOrCreateGuestSessionId();
    const body = await request.json().catch(() => null);

    const id_diagnosa_ai = await validateDiagnosaAiId(body?.id_diagnosa_ai);

    const tanggalMasukRaw = String(body?.tanggal_masuk ?? "").trim();
    const nama_cust = String(body?.nama_cust ?? "").trim();
    const phone_cust = String(body?.phone_cust ?? "").trim();
    const alamat_cust = String(body?.alamat_cust ?? "").trim();
    const jenis_perangkat = String(body?.jenis_perangkat ?? "").trim();
    const merk_perangkat = String(body?.merk_perangkat ?? "").trim();
    const keluhan = String(body?.keluhan ?? "").trim();
    const gunakan_drop_point = Boolean(body?.gunakan_drop_point);
    const drop_point_id_raw = body?.drop_point_id
      ? String(body.drop_point_id).trim()
      : "";

    if (
      !tanggalMasukRaw ||
      !nama_cust ||
      !phone_cust ||
      !alamat_cust ||
      !jenis_perangkat ||
      !keluhan
    ) {
      return errorJson("Mohon lengkapi field yang wajib diisi", 400);
    }

    const tanggalMasuk = parseTicketDate(tanggalMasukRaw);

    if (!tanggalMasuk) {
      return errorJson("Tanggal masuk tidak valid", 400);
    }

    let id_drop_point: bigint | null = null;

    if (gunakan_drop_point) {
      if (!drop_point_id_raw) {
        return errorJson("Mohon pilih drop point terlebih dahulu", 400);
      }

      if (!/^\d+$/.test(drop_point_id_raw)) {
        return errorJson("Drop point tidak valid", 400);
      }

      const selectedDropPoint = await prisma.drop_point.findUnique({
        where: {
          id: BigInt(drop_point_id_raw),
        },
      });

      if (!selectedDropPoint) {
        return errorJson("Drop point tidak ditemukan", 404);
      }

      id_drop_point = selectedDropPoint.id;
    }

    const nomor_tiket = await generateNomorTiket(tanggalMasuk);
    const id = generateTiketServisId();

const createdTicket = await prisma.tiket_servis.create({
  data: {
    id,
    id_drop_point,
    id_diagnosa_ai,
    nomor_tiket,
    tanggal_masuk: tanggalMasuk,
    nama_cust,
    phone_cust,
    alamat_cust,
    jenis_perangkat,
    merk_perangkat: merk_perangkat || null,
    keluhan,
    sumber_tiket: "Guest",
    guest_session_id: guestSessionId,
    status_verifikasi: "Menunggu",
    status_servis: "Belum_Diproses",
    estimasi_biaya: 0,
  },
  include: {
    drop_point: true,
    diagnosa_ai: {
      select: {
        kemungkinan_solusi: true,
        saran_tindakan: true,
      },
    },
  },
});

    const response = NextResponse.json({
      success: true,
      message: "Tiket servis berhasil dibuat",
      ticket: {
        ...normalizeTicketResponse(createdTicket),
        drop_point_nama: createdTicket.drop_point?.nama_drop_point ?? null,
      },
    });

    if (isNew) {
      response.cookies.set(GUEST_TICKET_COOKIE_NAME, guestSessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error) {
    console.error("POST /api/public/tiket-servis error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat membuat tiket servis";

    const status = message.includes("ID Diagnosa AI tidak valid")
      ? 400
      : message.includes("Data Diagnosa AI tidak ditemukan")
      ? 404
      : message.includes("sudah digunakan")
      ? 400
      : 500;

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status }
    );
  }
}