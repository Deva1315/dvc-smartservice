import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const GUEST_TICKET_COOKIE_NAME = "dvc_guest_ticket_session";

function errorJson(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
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

function normalizeTicketResponse(ticket: {
  id: string;
  nomor_tiket: string;
  tanggal_masuk: Date;
  nama_cust: string;
  phone_cust: string;
  alamat_cust: string | null;
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
  drop_point?: {
    nama_drop_point: string;
  } | null;
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
    drop_point_nama: ticket.drop_point?.nama_drop_point ?? null,
    sumber_tiket: ticket.sumber_tiket,
    status_verifikasi: ticket.status_verifikasi,
    status_servis: ticket.status_servis,
    guest_session_id: ticket.guest_session_id,
  };
}

export async function POST(request: Request) {
  try {
    const { guestSessionId, isNew } = await getOrCreateGuestSessionId();
    const body = await request.json().catch(() => null);

    const nomorTiket = String(body?.nomor_tiket ?? "").trim();
    const namaCust = String(body?.nama_cust ?? "").trim();
    const phoneCust = String(body?.phone_cust ?? "").trim();

    const normalizedPhoneInput = normalizePhone(phoneCust);

    if (!phoneCust || normalizedPhoneInput.length < 8) {
      return errorJson("Nomor HP wajib diisi dengan benar", 400);
    }

    if (!nomorTiket && !namaCust) {
      return errorJson(
        "Isi nomor tiket atau nama pelanggan untuk memulihkan tiket",
        400
      );
    }

    if (!nomorTiket && namaCust.length < 3) {
      return errorJson("Nama pelanggan minimal 3 karakter", 400);
    }

    const matchedTickets = [];

    if (nomorTiket) {
      const ticket = await prisma.tiket_servis.findFirst({
        where: {
          nomor_tiket: nomorTiket,
          sumber_tiket: "Guest",
        },
        include: {
          drop_point: true,
        },
      });

      if (
        ticket &&
        normalizePhone(ticket.phone_cust) === normalizedPhoneInput
      ) {
        matchedTickets.push(ticket);
      }
    } else {
      const normalizedNameInput = normalizeText(namaCust);

      const candidates = await prisma.tiket_servis.findMany({
        where: {
          sumber_tiket: "Guest",
          nama_cust: {
            contains: namaCust,
          },
        },
        include: {
          drop_point: true,
        },
        orderBy: {
          tanggal_masuk: "desc",
        },
        take: 25,
      });

      const filteredTickets = candidates.filter((ticket) => {
        const ticketName = normalizeText(ticket.nama_cust);
        const ticketPhone = normalizePhone(ticket.phone_cust);

        return (
          ticketName.includes(normalizedNameInput) &&
          ticketPhone === normalizedPhoneInput
        );
      });

      matchedTickets.push(...filteredTickets);
    }

    if (matchedTickets.length === 0) {
      return errorJson("Nomor tiket, nama, atau nomor HP tidak sesuai", 404);
    }

    const matchedTicketIds = matchedTickets.map((ticket) => ticket.id);

    await prisma.tiket_servis.updateMany({
      where: {
        id: {
          in: matchedTicketIds,
        },
      },
      data: {
        guest_session_id: guestSessionId,
      },
    });

    const restoredTickets = await prisma.tiket_servis.findMany({
      where: {
        id: {
          in: matchedTicketIds,
        },
      },
      include: {
        drop_point: true,
      },
      orderBy: {
        tanggal_masuk: "desc",
      },
    });

    const response = NextResponse.json({
      success: true,
      message: "Tiket servis berhasil dipulihkan",
      tickets: restoredTickets.map(normalizeTicketResponse),
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
    console.error("POST /api/public/tiket-servis/restore error:", error);

    return errorJson("Terjadi kesalahan saat memulihkan tiket servis", 500);
  }
}