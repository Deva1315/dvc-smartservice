import { cookies } from "next/headers";
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

function normalizeTicketResponse(ticket: {
  id: string;
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

type RouteContext = {
  params: Promise<{
    nomorTiket: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const cookieStore = await cookies();
    const guestSessionId = cookieStore.get(GUEST_TICKET_COOKIE_NAME)?.value;

    if (!guestSessionId) {
      return errorJson("Session guest tidak ditemukan", 401);
    }

    const { nomorTiket } = await context.params;
    const nomor_tiket = decodeURIComponent(nomorTiket);

    const existingTicket = await prisma.tiket_servis.findFirst({
      where: {
        nomor_tiket,
        sumber_tiket: "Guest",
        guest_session_id: guestSessionId,
      },
      include: {
        drop_point: true,
      },
    });

    if (!existingTicket) {
      return errorJson("Tiket servis tidak ditemukan", 404);
    }

    const body = await request.json().catch(() => null);

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

    const updatedTicket = await prisma.tiket_servis.update({
      where: {
        id: existingTicket.id,
      },
      data: {
        tanggal_masuk: tanggalMasuk,
        nama_cust,
        phone_cust,
        alamat_cust,
        jenis_perangkat,
        merk_perangkat: merk_perangkat || null,
        keluhan,
        ...(gunakan_drop_point && id_drop_point
          ? {
              drop_point: {
                connect: {
                  id: id_drop_point,
                },
              },
            }
          : {
              drop_point: {
                disconnect: true,
              },
            }),
      },
      include: {
        drop_point: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tiket servis berhasil diperbarui",
      ticket: {
        ...normalizeTicketResponse(updatedTicket),
        drop_point_nama: updatedTicket.drop_point?.nama_drop_point ?? null,
      },
    });
  } catch (error) {
    console.error("PATCH /api/public/tiket-servis/[nomorTiket] error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat memperbarui tiket servis";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}