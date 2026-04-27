import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth/get-auth-session";
import {
  garansi_status_garansi,
  pembayaran_servis_status_pembayaran,
  tiket_servis_status_verifikasi,
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

function normalizeRole(roleName: string) {
  return roleName.toLowerCase().replace(/\s+/g, "_");
}

async function requireAdminPenjualanSession() {
  const session = await getAuthSession();

  if (!session) {
    throw new Error("Unauthorized. Silakan login terlebih dahulu.");
  }

  const role = normalizeRole(session.roleName);

  if (role !== "admin_penjualan" && role !== "owner") {
    throw new Error(
      "Forbidden. Hanya Admin Penjualan atau Owner yang dapat mengakses garansi servis."
    );
  }

  return session;
}

function parseDateOnly(value: unknown, fieldName: string) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${fieldName} wajib diisi`);
  }

  const date = new Date(`${value.trim()}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} tidak valid`);
  }

  return date;
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

async function updateExpiredGaransi() {
  await prisma.garansi.updateMany({
    where: {
      status_garansi: garansi_status_garansi.Aktif,
      tanggal_akhir: {
        lt: new Date(),
      },
    },
    data: {
      status_garansi: garansi_status_garansi.Expired,
    },
  });
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

export async function GET(request: NextRequest) {
  try {
    await updateExpiredGaransi();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;

    const where = {
      ...(status
        ? {
            status_garansi: status as garansi_status_garansi,
          }
        : {}),
      ...(search
        ? {
            OR: [
              {
                tiket_servis: {
                  nomor_tiket: {
                    contains: search,
                  },
                },
              },
              {
                tiket_servis: {
                  nama_cust: {
                    contains: search,
                  },
                },
              },
              {
                tiket_servis: {
                  jenis_perangkat: {
                    contains: search,
                  },
                },
              },
              {
                tiket_servis: {
                  merk_perangkat: {
                    contains: search,
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.garansi.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          id: "desc",
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
      }),
      prisma.garansi.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Data garansi servis berhasil diambil",
      data: serializeData(data.map(mapGaransi)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET GARANSI SERVIS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data garansi servis",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminPenjualanSession();
    const body = await request.json();

    const nomorTiket =
      typeof body.nomor_tiket === "string"
        ? body.nomor_tiket.trim()
        : typeof body.nomorTiket === "string"
        ? body.nomorTiket.trim()
        : "";

    if (!nomorTiket) {
      return NextResponse.json(
        {
          success: false,
          message: "Nomor tiket wajib dipilih",
        },
        { status: 400 }
      );
    }

    const tanggalMulai = parseDateOnly(
      body.tanggal_mulai || body.tanggalMulai,
      "Tanggal mulai"
    );

    const tanggalAkhir = parseDateOnly(
      body.tanggal_akhir || body.tanggalBerakhir,
      "Tanggal akhir"
    );

    if (tanggalAkhir <= tanggalMulai) {
      return NextResponse.json(
        {
          success: false,
          message: "Tanggal akhir garansi harus lebih besar dari tanggal mulai",
        },
        { status: 400 }
      );
    }

    const keteranganGaransi =
      typeof body.keterangan_garansi === "string" &&
      body.keterangan_garansi.trim() !== ""
        ? body.keterangan_garansi.trim()
        : typeof body.keteranganGaransi === "string" &&
          body.keteranganGaransi.trim() !== ""
        ? body.keteranganGaransi.trim()
        : null;

    const result = await prisma.$transaction(async (tx) => {
      const tiket = await tx.tiket_servis.findUnique({
        where: {
          nomor_tiket: nomorTiket,
        },
        include: {
          garansi: true,
          pembayaran_servis: {
            where: {
              status_pembayaran: pembayaran_servis_status_pembayaran.Dibayar,
            },
          },
        },
      });

      if (!tiket) {
        throw new Error("Tiket servis tidak ditemukan");
      }

      if (tiket.status_verifikasi !== tiket_servis_status_verifikasi.Diterima) {
        throw new Error("Tiket servis belum diverifikasi atau belum diterima");
      }

      if (tiket.pembayaran_servis.length === 0) {
        throw new Error(
          "Garansi hanya dapat dibuat untuk tiket servis yang sudah dibayar"
        );
      }

      if (tiket.garansi.length > 0) {
        throw new Error("Tiket servis ini sudah memiliki garansi");
      }

      const garansi = await tx.garansi.create({
        data: {
          id_tiket_servis: tiket.id,
          id_user: BigInt(session.id),
          tanggal_mulai: tanggalMulai,
          tanggal_akhir: tanggalAkhir,
          keterangan_garansi: keteranganGaransi,
          status_garansi: garansi_status_garansi.Aktif,
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

      return garansi;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Garansi servis berhasil dibuat",
        data: serializeData(mapGaransi(result)),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST GARANSI SERVIS ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Gagal membuat garansi servis";

    const status = message.includes("Unauthorized")
      ? 401
      : message.includes("Forbidden")
      ? 403
      : message.includes("tidak ditemukan")
      ? 404
      : message.includes("sudah") ||
        message.includes("belum") ||
        message.includes("wajib") ||
        message.includes("Tanggal")
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