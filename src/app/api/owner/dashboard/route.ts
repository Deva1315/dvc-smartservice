import { NextResponse } from "next/server";
import {
  pembayaran_servis_status_pembayaran,
  transaksi_penjualan_status_transaksi,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth/get-auth-session";

export const runtime = "nodejs";

function serializeData(data: unknown) {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (typeof value === "bigint") {
        return value.toString();
      }

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

async function requireOwnerSession() {
  const session = await getAuthSession();

  if (!session) {
    throw new Error("Unauthorized. Silakan login terlebih dahulu.");
  }

  const role = normalizeRole(session.roleName);

  if (role !== "owner") {
    throw new Error("Forbidden. Hanya Owner yang dapat mengakses dashboard.");
  }

  return session;
}

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: unknown) {
  const numberValue = toNumber(value);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(numberValue)
    .replace(/\u00A0/g, " ")
    .replace(/\u202F/g, " ")
    .replace(/Â/g, "");
}

function getCurrentYearRange() {
  const now = new Date();
  const year = now.getFullYear();

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);

  return {
    year,
    startDate,
    endDate,
  };
}

async function getOwnerDashboardData() {
  const { year, startDate, endDate } = getCurrentYearRange();

  const [penjualan, servis] = await Promise.all([
    prisma.transaksi_penjualan.aggregate({
      where: {
        status_transaksi: transaksi_penjualan_status_transaksi.Dibayar,
        tanggal_transaksi: {
          gte: startDate,
          lt: endDate,
        },
      },
      _count: {
        _all: true,
      },
      _sum: {
        total_transaksi: true,
      },
    }),

    prisma.pembayaran_servis.aggregate({
      where: {
        status_pembayaran: pembayaran_servis_status_pembayaran.Dibayar,
        tanggal_pembayaran: {
          gte: startDate,
          lt: endDate,
        },
      },
      _count: {
        _all: true,
      },
      _sum: {
        total_pembayaran: true,
      },
    }),
  ]);

  const totalPenjualan = penjualan._count._all;
  const totalServis = servis._count._all;

  const totalPendapatanPenjualan = toNumber(penjualan._sum.total_transaksi);
  const totalPendapatanServis = toNumber(servis._sum.total_pembayaran);
  const totalPendapatan =
    totalPendapatanPenjualan + totalPendapatanServis;

  return {
    tahun_berjalan: year,
    range: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    total_penjualan: totalPenjualan,
    total_servis: totalServis,
    total_pendapatan: totalPendapatan,
    total_pendapatan_display: formatCurrency(totalPendapatan),
    detail_pendapatan: {
      penjualan: totalPendapatanPenjualan,
      penjualan_display: formatCurrency(totalPendapatanPenjualan),
      servis: totalPendapatanServis,
      servis_display: formatCurrency(totalPendapatanServis),
    },
  };
}

export async function GET() {
  try {
    await requireOwnerSession();

    const data = await getOwnerDashboardData();

    return NextResponse.json({
      success: true,
      message: "Data dashboard owner berhasil diambil.",
      data: serializeData(data),
    });
  } catch (error) {
    console.error("GET OWNER DASHBOARD ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Gagal mengambil data dashboard owner.";

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