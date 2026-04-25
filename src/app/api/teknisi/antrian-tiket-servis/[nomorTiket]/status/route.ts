import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tiket_servis_status_servis } from "@/generated/prisma/client";

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

const allowedTransitions: Record<
  tiket_servis_status_servis,
  tiket_servis_status_servis[]
> = {
  Belum_Diproses: [tiket_servis_status_servis.Diproses],
  Diproses: [
    tiket_servis_status_servis.Menunggu_Sparepart,
    tiket_servis_status_servis.Selesai,
  ],
  Menunggu_Sparepart: [
    tiket_servis_status_servis.Diproses,
    tiket_servis_status_servis.Selesai,
  ],
  Selesai: [],
  Diambil: [],
  Dibatalkan: [],
};

function parseStatus(value: unknown) {
  const status = String(value || "").replaceAll(" ", "_");

  if (
    status === "Belum_Diproses" ||
    status === "Diproses" ||
    status === "Menunggu_Sparepart" ||
    status === "Selesai" ||
    status === "Diambil" ||
    status === "Dibatalkan"
  ) {
    return status as tiket_servis_status_servis;
  }

  return null;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { nomorTiket } = await params;
    const body = await request.json();

    const statusBaru = parseStatus(body.status_servis);

    if (!statusBaru) {
      return NextResponse.json(
        {
          success: false,
          message: "Status servis tidak valid",
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

    if (tiket.status_verifikasi !== "Diterima") {
      return NextResponse.json(
        {
          success: false,
          message: "Tiket belum diterima oleh admin penjualan",
        },
        { status: 400 }
      );
    }

    const currentStatus = tiket.status_servis;
    const allowedNextStatus = allowedTransitions[currentStatus];

    if (!allowedNextStatus.includes(statusBaru)) {
      return NextResponse.json(
        {
          success: false,
          message: `Status tidak boleh diubah dari ${currentStatus} ke ${statusBaru}`,
        },
        { status: 400 }
      );
    }

    const updatedTiket = await prisma.tiket_servis.update({
      where: {
        nomor_tiket: nomorTiket,
      },
      data: {
        status_servis: statusBaru,
      },
      include: {
        drop_point: true,
        diagnosa_ai: true,
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
        detail_tiket_servis: {
          include: {
            jasa_servis: true,
            sparepart: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Status servis berhasil diperbarui",
      data: serializeData(updatedTiket),
    });
  } catch (error) {
    console.error("PUT STATUS TEKNISI ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui status servis",
      },
      { status: 500 }
    );
  }
}