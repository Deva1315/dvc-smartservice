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

async function requireAdminPenjualanSession() {
  const session = await getAuthSession();

  if (!session) {
    throw new Error("Unauthorized. Silakan login terlebih dahulu");
  }

  const normalizedRole = session.roleName.toLowerCase().replace(/\s+/g, "_");

  if (normalizedRole !== "admin_penjualan") {
    throw new Error(
      "Forbidden. Hanya Admin Penjualan yang dapat mengonfirmasi perangkat diambil"
    );
  }

  return session;
}

export async function PUT(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdminPenjualanSession();

    const { nomorTiket } = await params;

    const result = await prisma.$transaction(async (tx) => {
      const tiket = await tx.tiket_servis.findUnique({
        where: {
          nomor_tiket: nomorTiket,
        },
        include: {
          pembayaran_servis: {
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
        throw new Error("Tiket servis belum diterima");
      }

      if (tiket.status_servis === tiket_servis_status_servis.Diambil) {
        throw new Error("Perangkat sudah dikonfirmasi diambil");
      }

      if (tiket.status_servis !== tiket_servis_status_servis.Selesai) {
        throw new Error(
          "Perangkat hanya dapat dikonfirmasi diambil jika status servis sudah Selesai"
        );
      }

      const pembayaranLunas = tiket.pembayaran_servis.find(
        (item) =>
          item.status_pembayaran === pembayaran_servis_status_pembayaran.Dibayar
      );

      if (!pembayaranLunas) {
        throw new Error(
          "Perangkat hanya dapat dikonfirmasi diambil setelah pembayaran lunas"
        );
      }

      return tx.tiket_servis.update({
        where: {
          id: tiket.id,
        },
        data: {
          status_servis: tiket_servis_status_servis.Diambil,
        },
        include: {
          pembayaran_servis: true,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Perangkat berhasil dikonfirmasi diambil",
      data: serializeData(result),
    });
  } catch (error) {
    console.error("PUT KONFIRMASI DIAMBIL ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Gagal mengonfirmasi perangkat diambil";

    const status = message.includes("Unauthorized")
      ? 401
      : message.includes("Forbidden")
      ? 403
      : message.includes("tidak ditemukan")
      ? 404
      : message.includes("belum") ||
        message.includes("hanya dapat") ||
        message.includes("sudah dikonfirmasi")
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