import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
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
  params: Promise<{ nomorTiket: string }>;
};

function parseBigInt(value: unknown, fieldName: string) {
  if (!value) {
    throw new Error(`${fieldName} wajib diisi`);
  }

  const stringValue = String(value);

  if (!/^\d+$/.test(stringValue)) {
    throw new Error(`${fieldName} tidak valid`);
  }

  return BigInt(stringValue);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { nomorTiket } = await params;
    const body = await request.json();

    const statusVerifikasi = body.status_verifikasi as "Diterima" | "Ditolak";

    if (statusVerifikasi !== "Diterima" && statusVerifikasi !== "Ditolak") {
      return NextResponse.json(
        {
          success: false,
          message: "Status verifikasi tidak valid",
        },
        { status: 400 }
      );
    }

    const tiket = await prisma.tiket_servis.findUnique({
      where: {
        nomor_tiket: nomorTiket,
      },
    });

    if (!tiket) {
      return NextResponse.json(
        {
          success: false,
          message: "Tiket servis tidak ditemukan",
        },
        { status: 404 }
      );
    }

    if (tiket.status_verifikasi !== tiket_servis_status_verifikasi.Menunggu) {
      return NextResponse.json(
        {
          success: false,
          message: "Tiket sudah pernah diverifikasi",
        },
        { status: 400 }
      );
    }

    if (statusVerifikasi === "Diterima") {
      const idUser = parseBigInt(body.id_user, "Teknisi");

      const teknisi = await prisma.users.findUnique({
        where: {
          id: idUser,
        },
        include: {
          roles: true,
        },
      });

      if (!teknisi) {
        return NextResponse.json(
          {
            success: false,
            message: "Teknisi tidak ditemukan",
          },
          { status: 404 }
        );
      }

      const namaRole = teknisi.roles.nama_roles.toLowerCase();

      if (!namaRole.includes("teknisi")) {
        return NextResponse.json(
          {
            success: false,
            message: "User yang dipilih bukan teknisi",
          },
          { status: 400 }
        );
      }

      const updated = await prisma.tiket_servis.update({
        where: {
          nomor_tiket: nomorTiket,
        },
        data: {
          status_verifikasi: tiket_servis_status_verifikasi.Diterima,
          status_servis: tiket_servis_status_servis.Belum_Diproses,
          tanggal_verifikasi: new Date(),
          alasan_penolakan: null,
          id_user: idUser,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Tiket servis berhasil diterima dan ditugaskan ke teknisi",
        data: serializeData(updated),
      });
    }

    const alasanPenolakan = body.alasan_penolakan?.trim();

    if (!alasanPenolakan) {
      return NextResponse.json(
        {
          success: false,
          message: "Alasan penolakan wajib diisi",
        },
        { status: 400 }
      );
    }

    const updated = await prisma.tiket_servis.update({
      where: {
        nomor_tiket: nomorTiket,
      },
      data: {
        status_verifikasi: tiket_servis_status_verifikasi.Ditolak,
        status_servis: tiket_servis_status_servis.Dibatalkan,
        tanggal_verifikasi: new Date(),
        alasan_penolakan: alasanPenolakan,
        id_user: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tiket servis berhasil ditolak",
      data: serializeData(updated),
    });
  } catch (error) {
    console.error("PUT VERIFIKASI ADMIN PENJUALAN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal memverifikasi tiket servis",
      },
      { status: 500 }
    );
  }
}