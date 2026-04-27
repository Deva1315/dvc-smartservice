import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  garansi_status_garansi,
  pembayaran_servis_status_pembayaran,
} from "@/generated/prisma/client";

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

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

function parseBigIntId(value: string) {
  if (!/^\d+$/.test(value)) {
    throw new Error("ID garansi tidak valid");
  }

  return BigInt(value);
}

function parseDateOnlyOptional(value: unknown, fieldName: string) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`${fieldName} tidak valid`);
  }

  const date = new Date(`${value.trim()}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} tidak valid`);
  }

  return date;
}

function parseStatusGaransi(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const status = String(value).trim();

  if (
    status === garansi_status_garansi.Aktif ||
    status === garansi_status_garansi.Diklaim ||
    status === garansi_status_garansi.Expired
  ) {
    return status as garansi_status_garansi;
  }

  if (status === "Habis") {
    return garansi_status_garansi.Expired;
  }

  throw new Error("Status garansi tidak valid");
}

function calculateDiffDays(startDate: Date, endDate: Date) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffMs = end.getTime() - start.getTime();

  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function getPerangkatDisplay(item: {
  jenis_perangkat: string;
  merk_perangkat: string | null;
}) {
  return item.merk_perangkat
    ? `${item.jenis_perangkat} - ${item.merk_perangkat}`
    : item.jenis_perangkat;
}

function getStatusDisplay(status: garansi_status_garansi) {
  if (status === garansi_status_garansi.Expired) return "Habis";
  return status;
}

function mapGaransi(item: {
  id: bigint;
  id_tiket_servis: string;
  id_user: bigint;
  tanggal_mulai: Date;
  tanggal_akhir: Date;
  tanggal_klaim: Date | null;
  keterangan_garansi: string | null;
  status_garansi: garansi_status_garansi;
  tiket_servis: {
    id: string;
    nomor_tiket: string;
    nama_cust: string;
    phone_cust: string;
    jenis_perangkat: string;
    merk_perangkat: string | null;
    tanggal_masuk: Date;
    estimasi_waktu: Date | null;
    status_servis: string;
    pembayaran_servis: {
      id: bigint;
      tanggal_pembayaran: Date;
      total_pembayaran: unknown;
      metode_pembayaran: string;
      status_pembayaran: string;
    }[];
  };
  users: {
    id: bigint;
    nama: string;
    email: string;
  };
}) {
  const tanggalServis =
    item.tiket_servis.estimasi_waktu ||
    item.tiket_servis.pembayaran_servis[0]?.tanggal_pembayaran ||
    item.tiket_servis.tanggal_masuk;

  return {
    id: item.id,
    id_tiket_servis: item.id_tiket_servis,
    id_user: item.id_user,
    nomor_tiket: item.tiket_servis.nomor_tiket,
    nama_pelanggan: item.tiket_servis.nama_cust,
    no_hp: item.tiket_servis.phone_cust,
    perangkat: getPerangkatDisplay(item.tiket_servis),
    tanggal_servis: tanggalServis,
    tanggal_mulai: item.tanggal_mulai,
    tanggal_akhir: item.tanggal_akhir,
    tanggal_klaim: item.tanggal_klaim,
    periode_hari: calculateDiffDays(item.tanggal_mulai, item.tanggal_akhir),
    keterangan_garansi: item.keterangan_garansi,
    status_garansi: item.status_garansi,
    status_display: getStatusDisplay(item.status_garansi),
    total_pembayaran:
      item.tiket_servis.pembayaran_servis[0]?.total_pembayaran || 0,
    admin: {
      id: item.users.id,
      nama: item.users.nama,
      email: item.users.email,
    },
    tiket_servis: item.tiket_servis,
  };
}

async function getGaransiById(id: bigint) {
  return prisma.garansi.findUnique({
    where: {
      id,
    },
    include: {
      users: {
        select: {
          id: true,
          nama: true,
          email: true,
        },
      },
      tiket_servis: {
        include: {
          pembayaran_servis: {
            where: {
              status_pembayaran: pembayaran_servis_status_pembayaran.Dibayar,
            },
            orderBy: {
              tanggal_pembayaran: "desc",
            },
          },
        },
      },
    },
  });
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idGaransi = parseBigIntId(id);

    const garansi = await getGaransiById(idGaransi);

    if (!garansi) {
      return NextResponse.json(
        {
          success: false,
          message: "Garansi servis tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Detail garansi servis berhasil diambil",
      data: serializeData(mapGaransi(garansi)),
    });
  } catch (error) {
    console.error("GET DETAIL GARANSI SERVIS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil detail garansi servis",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idGaransi = parseBigIntId(id);
    const body = await request.json();

    const existing = await prisma.garansi.findUnique({
      where: {
        id: idGaransi,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Garansi servis tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const tanggalMulai = parseDateOnlyOptional(
      body.tanggal_mulai || body.tanggalMulai,
      "Tanggal mulai"
    );

    const tanggalAkhir = parseDateOnlyOptional(
      body.tanggal_akhir || body.tanggalBerakhir,
      "Tanggal akhir"
    );

    const nextTanggalMulai = tanggalMulai || existing.tanggal_mulai;
    const nextTanggalAkhir = tanggalAkhir || existing.tanggal_akhir;

    if (nextTanggalAkhir <= nextTanggalMulai) {
      return NextResponse.json(
        {
          success: false,
          message: "Tanggal akhir garansi harus lebih besar dari tanggal mulai",
        },
        { status: 400 }
      );
    }

    const statusGaransi = parseStatusGaransi(
      body.status_garansi || body.status
    );

    const keteranganGaransi =
      body.keterangan_garansi === undefined &&
      body.keteranganGaransi === undefined
        ? undefined
        : typeof body.keterangan_garansi === "string"
        ? body.keterangan_garansi.trim() || null
        : typeof body.keteranganGaransi === "string"
        ? body.keteranganGaransi.trim() || null
        : null;

    const updated = await prisma.garansi.update({
      where: {
        id: idGaransi,
      },
data: {
  ...(tanggalMulai ? { tanggal_mulai: tanggalMulai } : {}),
  ...(tanggalAkhir ? { tanggal_akhir: tanggalAkhir } : {}),
  ...(statusGaransi ? { status_garansi: statusGaransi } : {}),
  ...(statusGaransi === garansi_status_garansi.Diklaim &&
  existing.tanggal_klaim === null
    ? { tanggal_klaim: new Date() }
    : {}),
  ...(statusGaransi === garansi_status_garansi.Aktif
    ? { tanggal_klaim: null }
    : {}),
  ...(keteranganGaransi !== undefined
    ? { keterangan_garansi: keteranganGaransi }
    : {}),
},
      include: {
        users: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
        tiket_servis: {
          include: {
            pembayaran_servis: {
              where: {
                status_pembayaran:
                  pembayaran_servis_status_pembayaran.Dibayar,
              },
              orderBy: {
                tanggal_pembayaran: "desc",
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Garansi servis berhasil diperbarui",
      data: serializeData(mapGaransi(updated)),
    });
  } catch (error) {
    console.error("PUT GARANSI SERVIS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal memperbarui garansi servis",
      },
      { status: 500 }
    );
  }
}