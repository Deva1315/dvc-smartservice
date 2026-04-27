import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth/get-auth-session";
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
    nomorTiket: string;
  }>;
};

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
      "Forbidden. Hanya Admin Penjualan atau Owner yang dapat mengakses klaim garansi."
    );
  }

  return session;
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

function isExpired(tanggalAkhir: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(tanggalAkhir);
  endDate.setHours(0, 0, 0, 0);

  return endDate < today;
}

function mapKlaimGaransi(item: {
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
  const pembayaran = item.tiket_servis.pembayaran_servis[0] || null;

  const tanggalServis =
    item.tiket_servis.estimasi_waktu ||
    pembayaran?.tanggal_pembayaran ||
    item.tiket_servis.tanggal_masuk;

  return {
    id: item.id,
    nomor_tiket: item.tiket_servis.nomor_tiket,
    nama_pelanggan: item.tiket_servis.nama_cust,
    no_hp: item.tiket_servis.phone_cust,
    perangkat: getPerangkatDisplay(item.tiket_servis),
    tanggal_servis: tanggalServis,
    tanggal_mulai: item.tanggal_mulai,
    tanggal_akhir: item.tanggal_akhir,
    tanggal_klaim: item.tanggal_klaim,
    periode_hari: calculateDiffDays(item.tanggal_mulai, item.tanggal_akhir),
    status_garansi: item.status_garansi,
    status_display: getStatusDisplay(item.status_garansi),
    keterangan_garansi: item.keterangan_garansi,
    total_pembayaran: pembayaran?.total_pembayaran || 0,
    metode_pembayaran: pembayaran?.metode_pembayaran || null,
    admin_pembuat: {
      id: item.users.id,
      nama: item.users.nama,
      email: item.users.email,
    },
    can_claim: item.status_garansi === garansi_status_garansi.Aktif,
  };
}

async function findGaransiByNomorTiket(nomorTiket: string) {
  return prisma.garansi.findFirst({
    where: {
      tiket_servis: {
        nomor_tiket: nomorTiket,
      },
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

async function refreshGaransiStatusIfExpired(idGaransi: bigint) {
  const garansi = await prisma.garansi.findUnique({
    where: {
      id: idGaransi,
    },
  });

  if (!garansi) {
    return null;
  }

  if (
    garansi.status_garansi === garansi_status_garansi.Aktif &&
    isExpired(garansi.tanggal_akhir)
  ) {
    await prisma.garansi.update({
      where: {
        id: idGaransi,
      },
      data: {
        status_garansi: garansi_status_garansi.Expired,
      },
    });
  }

  return true;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdminPenjualanSession();

    const { nomorTiket } = await params;
    const decodedNomorTiket = decodeURIComponent(nomorTiket).trim();

    if (!decodedNomorTiket) {
      return NextResponse.json(
        {
          success: false,
          message: "Nomor tiket wajib diisi",
        },
        { status: 400 }
      );
    }

    const garansi = await findGaransiByNomorTiket(decodedNomorTiket);

    if (!garansi) {
      return NextResponse.json(
        {
          success: false,
          message: "Data garansi dengan nomor tiket tersebut tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    await refreshGaransiStatusIfExpired(garansi.id);

    const refreshedGaransi = await findGaransiByNomorTiket(decodedNomorTiket);

    if (!refreshedGaransi) {
      return NextResponse.json(
        {
          success: false,
          message: "Data garansi tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data garansi berhasil ditemukan.",
      data: serializeData(mapKlaimGaransi(refreshedGaransi)),
    });
  } catch (error) {
    console.error("GET KLAIM GARANSI ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Gagal mengecek garansi.";

    const status = message.includes("Unauthorized")
      ? 401
      : message.includes("Forbidden")
      ? 403
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

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdminPenjualanSession();

    const { nomorTiket } = await params;
    const decodedNomorTiket = decodeURIComponent(nomorTiket).trim();

    if (!decodedNomorTiket) {
      return NextResponse.json(
        {
          success: false,
          message: "Nomor tiket wajib diisi",
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const garansi = await tx.garansi.findFirst({
        where: {
          tiket_servis: {
            nomor_tiket: decodedNomorTiket,
          },
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

      if (!garansi) {
        throw new Error(
          "Data garansi dengan nomor tiket tersebut tidak ditemukan."
        );
      }

      if (
        garansi.status_garansi === garansi_status_garansi.Aktif &&
        isExpired(garansi.tanggal_akhir)
      ) {
        const expiredGaransi = await tx.garansi.update({
          where: {
            id: garansi.id,
          },
          data: {
            status_garansi: garansi_status_garansi.Expired,
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

        return {
          claimed: false,
          garansi: expiredGaransi,
          message:
            "Garansi sudah melewati tanggal akhir sehingga tidak dapat diklaim.",
        };
      }

      if (garansi.status_garansi === garansi_status_garansi.Expired) {
        return {
          claimed: false,
          garansi,
          message: "Garansi sudah habis dan tidak dapat diklaim.",
        };
      }

      if (garansi.status_garansi === garansi_status_garansi.Diklaim) {
        return {
          claimed: false,
          garansi,
          message: "Garansi ini sudah pernah diklaim.",
        };
      }

      const updatedGaransi = await tx.garansi.update({
        where: {
          id: garansi.id,
        },
        data: {
          status_garansi: garansi_status_garansi.Diklaim,
          tanggal_diklaim: new Date(),
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

      return {
        claimed: true,
        garansi: updatedGaransi,
        message: "Garansi berhasil diklaim.",
      };
    });

    return NextResponse.json({
      success: result.claimed,
      message: result.message,
      data: serializeData(mapKlaimGaransi(result.garansi)),
    });
  } catch (error) {
    console.error("POST KLAIM GARANSI ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Gagal melakukan klaim garansi.";

    const status = message.includes("Unauthorized")
      ? 401
      : message.includes("Forbidden")
      ? 403
      : message.includes("tidak ditemukan")
      ? 404
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