import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth/get-auth-session";
import {
  pembayaran_servis_status_pembayaran,
  tiket_servis_status_servis,
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

type RouteParams = {
  params: Promise<{
    nomorTiket: string;
  }>;
};

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeMetodePembayaran(value: unknown) {
  const metode = typeof value === "string" ? value.trim() : "";

  if (!metode) {
    throw new Error("Metode pembayaran wajib dipilih");
  }

  const allowed = ["Cash", "Transfer", "QRIS", "Debit"];

  if (!allowed.includes(metode)) {
    throw new Error("Metode pembayaran tidak valid");
  }

  return metode;
}

async function requireAdminPenjualanSession() {
  const session = await getAuthSession();

  if (!session) {
    throw new Error("Unauthorized. Silakan login terlebih dahulu.");
  }

  const normalizedRole = session.roleName.toLowerCase().replace(/\s+/g, "_");

  if (
    normalizedRole !== "admin_penjualan"
  ) {
    throw new Error("Forbidden. Hanya Admin Penjualan yang dapat melakukan pembayaran servis.");
  }

  return session;
}

function buildPembayaranServisData(tiket: {
  id: string;
  nomor_tiket: string;
  nama_cust: string;
  phone_cust: string;
  jenis_perangkat: string;
  merk_perangkat: string | null;
  keluhan: string;
  status_verifikasi: tiket_servis_status_verifikasi;
  status_servis: tiket_servis_status_servis;
  tanggal_masuk: Date;
  estimasi_waktu: Date | null;
  estimasi_biaya: unknown;
  detail_tiket_servis: {
    id: string;
    id_jasa_servis: bigint | null;
    id_sparepart: bigint | null;
    jumlah: bigint;
    harga: unknown;
    subtotal: unknown;
    jasa_servis: {
      id: bigint;
      nama_jasa_servis: string;
      harga: unknown;
    } | null;
    sparepart: {
      id: bigint;
      nama_sparepart: string;
      kode_sparepart: string;
      harga: unknown;
    } | null;
  }[];
  pembayaran_servis: {
    id: bigint;
    tanggal_pembayaran: Date;
    total_pembayaran: unknown;
    metode_pembayaran: string;
    status_pembayaran: pembayaran_servis_status_pembayaran;
    users: {
      id: bigint;
      nama: string;
      email: string;
    };
  }[];
}) {
  const rincianJasa = tiket.detail_tiket_servis
    .filter((item) => item.id_jasa_servis)
    .map((item) => {
      const jumlah = toNumber(item.jumlah);
      const harga = toNumber(item.harga);
      const subtotal = toNumber(item.subtotal) || jumlah * harga;

      return {
        id: item.id,
        id_jasa_servis: item.id_jasa_servis,
        nama: item.jasa_servis?.nama_jasa_servis || "Jasa Servis",
        jumlah,
        harga,
        subtotal,
      };
    });

  const rincianSparepart = tiket.detail_tiket_servis
    .filter((item) => item.id_sparepart)
    .map((item) => {
      const jumlah = toNumber(item.jumlah);
      const harga = toNumber(item.harga);
      const subtotal = toNumber(item.subtotal) || jumlah * harga;

      return {
        id: item.id,
        id_sparepart: item.id_sparepart,
        nama: item.sparepart?.nama_sparepart || "Sparepart",
        kode_sparepart: item.sparepart?.kode_sparepart || "-",
        jumlah,
        harga,
        subtotal,
      };
    });

  const subtotalJasa = rincianJasa.reduce(
    (total, item) => total + item.subtotal,
    0
  );

  const subtotalSparepart = rincianSparepart.reduce(
    (total, item) => total + item.subtotal,
    0
  );

  const totalPembayaran = subtotalJasa + subtotalSparepart;

  const pembayaranAktif =
    tiket.pembayaran_servis.find(
      (item) =>
        item.status_pembayaran === pembayaran_servis_status_pembayaran.Dibayar
    ) || null;

  return {
    tiket: {
      id: tiket.id,
      nomor_tiket: tiket.nomor_tiket,
      nama_cust: tiket.nama_cust,
      phone_cust: tiket.phone_cust,
      jenis_perangkat: tiket.jenis_perangkat,
      merk_perangkat: tiket.merk_perangkat,
      keluhan: tiket.keluhan,
      status_verifikasi: tiket.status_verifikasi,
      status_servis: tiket.status_servis,
      tanggal_masuk: tiket.tanggal_masuk,
      estimasi_waktu: tiket.estimasi_waktu,
      estimasi_biaya: tiket.estimasi_biaya,
    },
    rincian_jasa: rincianJasa,
    rincian_sparepart: rincianSparepart,
    subtotal_jasa: subtotalJasa,
    subtotal_sparepart: subtotalSparepart,
    total_pembayaran: totalPembayaran,
    pembayaran: pembayaranAktif,
  };
}

async function getTiketPembayaran(nomorTiket: string) {
  return prisma.tiket_servis.findUnique({
    where: {
      nomor_tiket: nomorTiket,
    },
    include: {
      detail_tiket_servis: {
        include: {
          jasa_servis: true,
          sparepart: true,
        },
      },
      pembayaran_servis: {
        include: {
          users: {
            select: {
              id: true,
              nama: true,
              email: true,
            },
          },
        },
        orderBy: {
          tanggal_pembayaran: "desc",
        },
      },
    },
  });
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { nomorTiket } = await params;

    const tiket = await getTiketPembayaran(nomorTiket);

    if (!tiket) {
      return NextResponse.json(
        {
          success: false,
          message: "Tiket servis tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data pembayaran servis berhasil diambil",
      data: serializeData(buildPembayaranServisData(tiket)),
    });
  } catch (error) {
    console.error("GET PEMBAYARAN SERVIS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data pembayaran servis",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { nomorTiket } = await params;
    const body = await request.json();

    const session = await requireAdminPenjualanSession();
    const metodePembayaran = normalizeMetodePembayaran(body.metode_pembayaran);

    const result = await prisma.$transaction(async (tx) => {
      const tiket = await tx.tiket_servis.findUnique({
        where: {
          nomor_tiket: nomorTiket,
        },
        include: {
          detail_tiket_servis: {
            include: {
              jasa_servis: true,
              sparepart: true,
            },
          },
          pembayaran_servis: {
            include: {
              users: {
                select: {
                  id: true,
                  nama: true,
                  email: true,
                },
              },
            },
            orderBy: {
              tanggal_pembayaran: "desc",
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

      if (tiket.status_servis !== tiket_servis_status_servis.Selesai) {
        throw new Error("Pembayaran hanya bisa dilakukan jika status servis sudah Selesai");
      }

      const pembayaranSudahAda = tiket.pembayaran_servis.find(
        (item) =>
          item.status_pembayaran === pembayaran_servis_status_pembayaran.Dibayar
      );

      if (pembayaranSudahAda) {
        throw new Error("Tiket servis ini sudah dibayar");
      }

      const rincian = buildPembayaranServisData(tiket);
      const totalPembayaran = rincian.total_pembayaran;

      if (totalPembayaran <= 0) {
        throw new Error("Total pembayaran masih 0. Pastikan tiket memiliki jasa atau sparepart");
      }

      await tx.pembayaran_servis.create({
        data: {
          id_tiket_servis: tiket.id,
          id_user: BigInt(session.id),
          tanggal_pembayaran: new Date(),
          total_pembayaran: totalPembayaran,
          metode_pembayaran: metodePembayaran,
          status_pembayaran: pembayaran_servis_status_pembayaran.Dibayar,
        },
      });

      await tx.tiket_servis.update({
        where: {
          id: tiket.id,
        },
        data: {
          status_servis: tiket_servis_status_servis.Diambil,
        },
      });

      const updatedTiket = await tx.tiket_servis.findUnique({
        where: {
          nomor_tiket: nomorTiket,
        },
        include: {
          detail_tiket_servis: {
            include: {
              jasa_servis: true,
              sparepart: true,
            },
          },
          pembayaran_servis: {
            include: {
              users: {
                select: {
                  id: true,
                  nama: true,
                  email: true,
                },
              },
            },
            orderBy: {
              tanggal_pembayaran: "desc",
            },
          },
        },
      });

      if (!updatedTiket) {
        throw new Error("Gagal mengambil data pembayaran terbaru");
      }

      return buildPembayaranServisData(updatedTiket);
    });

    return NextResponse.json(
      {
        success: true,
        message: "Pembayaran servis berhasil disimpan",
        data: serializeData(result),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST PEMBAYARAN SERVIS ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Gagal menyimpan pembayaran servis";

    const status =
      message.includes("Unauthorized")
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