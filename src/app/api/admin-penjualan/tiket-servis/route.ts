import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  tiket_servis_sumber_tiket,
  tiket_servis_status_servis,
  tiket_servis_status_verifikasi,
} from "@/generated/prisma/client";

const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

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

function generateTiketServisId() {
  return `TKS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const statusVerifikasi = searchParams.get("status_verifikasi");
    const statusServis = searchParams.get("status_servis");

    const where = {
      AND: [
        statusVerifikasi
          ? {
              status_verifikasi:
                statusVerifikasi as tiket_servis_status_verifikasi,
            }
          : {},
        statusServis
          ? {
              status_servis: statusServis as tiket_servis_status_servis,
            }
          : {},
        search
          ? {
              OR: [
                { nomor_tiket: { contains: search } },
                { nama_cust: { contains: search } },
                { phone_cust: { contains: search } },
                { jenis_perangkat: { contains: search } },
                { merk_perangkat: { contains: search } },
              ],
            }
          : {},
      ],
    };

    const data = await prisma.tiket_servis.findMany({
      where,
      orderBy: {
        tanggal_masuk: "desc",
      },
      include: {
        drop_point: true,
        diagnosa_ai: true,
        detail_tiket_servis: {
          include: {
            jasa_servis: true,
            sparepart: true,
          },
        },
        diagnosa_lanjutan: {
          include: {
            users: {
              select: {
                id: true,
                nama: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data tiket servis berhasil diambil",
      data: serializeData(data),
    });
  } catch (error) {
    console.error("GET ADMIN PENJUALAN TIKET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data tiket servis",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const namaCust = String(body.nama_cust ?? "").trim();
    const phoneCust = String(body.phone_cust ?? "").trim();
    const alamatCust = String(body.alamat_cust ?? "").trim();
    const jenisPerangkat = String(body.jenis_perangkat ?? "").trim();
    const merkPerangkat = String(body.merk_perangkat ?? "").trim();
    const keluhan = String(body.keluhan ?? "").trim();
    const idDropPoint = body.id_drop_point ? BigInt(body.id_drop_point) : null;

    const tanggalMasukRaw = String(body.tanggal_masuk ?? "").trim();
    const tanggalMasuk = tanggalMasukRaw
      ? parseTicketDate(tanggalMasukRaw)
      : getTodayTicketDate();

    if (!namaCust || !phoneCust || !jenisPerangkat || !keluhan) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama, no HP, jenis perangkat, dan keluhan wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!tanggalMasuk) {
      return NextResponse.json(
        {
          success: false,
          message: "Tanggal masuk tidak valid",
        },
        { status: 400 }
      );
    }

    if (idDropPoint) {
      const dropPoint = await prisma.drop_point.findUnique({
        where: {
          id: idDropPoint,
        },
      });

      if (!dropPoint) {
        return NextResponse.json(
          {
            success: false,
            message: "Drop point tidak ditemukan",
          },
          { status: 404 }
        );
      }
    }

    const nomorTiket = await generateNomorTiket(tanggalMasuk);

    const tiket = await prisma.tiket_servis.create({
      data: {
        id: generateTiketServisId(),
        nomor_tiket: nomorTiket,
        sumber_tiket: tiket_servis_sumber_tiket.Admin_Penjualan,
        id_drop_point: idDropPoint,
        id_diagnosa_ai: null,
        nama_cust: namaCust,
        phone_cust: phoneCust,
        alamat_cust: alamatCust,
        jenis_perangkat: jenisPerangkat,
        merk_perangkat: merkPerangkat || null,
        keluhan,
        status_verifikasi: tiket_servis_status_verifikasi.Menunggu,
        status_servis: tiket_servis_status_servis.Belum_Diproses,
        alasan_penolakan: null,
        tanggal_masuk: tanggalMasuk,
        tanggal_verifikasi: null,
        estimasi_waktu: null,
        estimasi_biaya: 0,
        guest_session_id: null,
      },
      include: {
        drop_point: true,
        diagnosa_ai: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Tiket servis berhasil dibuat",
        data: serializeData(tiket),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST ADMIN PENJUALAN TIKET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat tiket servis",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const nomorTiket = String(body.nomor_tiket ?? "").trim();
    const namaCust = String(body.nama_cust ?? "").trim();
    const phoneCust = String(body.phone_cust ?? "").trim();
    const alamatCust = String(body.alamat_cust ?? "").trim();
    const jenisPerangkat = String(body.jenis_perangkat ?? "").trim();
    const merkPerangkat = String(body.merk_perangkat ?? "").trim();
    const keluhan = String(body.keluhan ?? "").trim();

    const tanggalMasukRaw = String(body.tanggal_masuk ?? "").trim();
    const tanggalMasuk = tanggalMasukRaw ? parseTicketDate(tanggalMasukRaw) : null;

    const rawDropPointId = body.id_drop_point ?? body.drop_point_id ?? null;
    const idDropPoint = rawDropPointId ? BigInt(rawDropPointId) : null;

    if (!nomorTiket) {
      return NextResponse.json(
        {
          success: false,
          message: "Nomor tiket wajib dikirim untuk update tiket servis",
        },
        { status: 400 }
      );
    }

    if (!namaCust || !phoneCust || !jenisPerangkat || !keluhan) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama, no HP, jenis perangkat, dan keluhan wajib diisi",
        },
        { status: 400 }
      );
    }

    if (tanggalMasukRaw && !tanggalMasuk) {
      return NextResponse.json(
        {
          success: false,
          message: "Tanggal masuk tidak valid",
        },
        { status: 400 }
      );
    }

    const existingTicket = await prisma.tiket_servis.findUnique({
      where: {
        nomor_tiket: nomorTiket,
      },
      select: {
        id: true,
        nomor_tiket: true,
      },
    });

    if (!existingTicket) {
      return NextResponse.json(
        {
          success: false,
          message: "Tiket servis tidak ditemukan",
        },
        { status: 404 }
      );
    }

    if (idDropPoint) {
      const dropPoint = await prisma.drop_point.findUnique({
        where: {
          id: idDropPoint,
        },
        select: {
          id: true,
        },
      });

      if (!dropPoint) {
        return NextResponse.json(
          {
            success: false,
            message: "Drop Point tidak ditemukan",
          },
          { status: 404 }
        );
      }
    }

    const updatedTicket = await prisma.tiket_servis.update({
      where: {
        nomor_tiket: nomorTiket,
      },
      data: {
        nama_cust: namaCust,
        phone_cust: phoneCust,
        alamat_cust: alamatCust,
        jenis_perangkat: jenisPerangkat,
        merk_perangkat: merkPerangkat || null,
        keluhan,
        id_drop_point: idDropPoint,
        ...(tanggalMasuk ? { tanggal_masuk: tanggalMasuk } : {}),
      },
      include: {
        drop_point: true,
        diagnosa_ai: true,
        detail_tiket_servis: {
          include: {
            jasa_servis: true,
            sparepart: true,
          },
        },
        diagnosa_lanjutan: {
          include: {
            users: {
              select: {
                id: true,
                nama: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tiket servis berhasil diperbarui",
      data: serializeData(updatedTicket),
    });
  } catch (error) {
    console.error("PUT ADMIN PENJUALAN TIKET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui tiket servis",
      },
      { status: 500 }
    );
  }
}