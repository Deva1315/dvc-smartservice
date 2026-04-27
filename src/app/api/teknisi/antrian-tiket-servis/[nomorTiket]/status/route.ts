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
  Belum_Diproses: [
    tiket_servis_status_servis.Diproses,
    tiket_servis_status_servis.Dibatalkan,
  ],
  Diproses: [
    tiket_servis_status_servis.Menunggu_Sparepart,
    tiket_servis_status_servis.Selesai,
    tiket_servis_status_servis.Dibatalkan,
  ],
  Menunggu_Sparepart: [
    tiket_servis_status_servis.Diproses,
    tiket_servis_status_servis.Selesai,
    tiket_servis_status_servis.Dibatalkan,
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

let estimasiWaktu: Date | null = null;

if (typeof body.estimasi_waktu === "string" && body.estimasi_waktu.trim() !== "") {
  const parsedEstimasiWaktu = new Date(body.estimasi_waktu.trim());

  if (Number.isNaN(parsedEstimasiWaktu.getTime())) {
    return NextResponse.json(
      {
        success: false,
        message: "Estimasi waktu harus berupa tanggal dan waktu yang valid",
      },
      { status: 400 }
    );
  }

  estimasiWaktu = parsedEstimasiWaktu;
}

    if (!statusBaru) {
      return NextResponse.json(
        {
          success: false,
          message: "Status servis tidak valid",
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const tiket = await tx.tiket_servis.findUnique({
        where: {
          nomor_tiket: nomorTiket,
        },
      });

      if (!tiket) {
        throw new Error("Tiket servis tidak ditemukan");
      }

      if (tiket.status_verifikasi !== "Diterima") {
        throw new Error("Tiket belum diterima oleh admin penjualan");
      }

      const currentStatus = tiket.status_servis;
      const isSameStatus = statusBaru === currentStatus;

      if (!isSameStatus) {
        const allowedNextStatus = allowedTransitions[currentStatus];

        if (!allowedNextStatus.includes(statusBaru)) {
          throw new Error(
            `Status tidak boleh diubah dari ${currentStatus} ke ${statusBaru}`
          );
        }
      }

      if (statusBaru === tiket_servis_status_servis.Dibatalkan) {
        const detailSparepartList = await tx.detail_tiket_servis.findMany({
          where: {
            id_tiket_servis: tiket.id,
            id_sparepart: {
              not: null,
            },
          },
        });

        for (const detail of detailSparepartList) {
          if (detail.id_sparepart) {
            await tx.sparepart.update({
              where: {
                id: detail.id_sparepart,
              },
              data: {
                stock: {
                  increment: detail.jumlah,
                },
              },
            });
          }
        }
      }

      const updatedTiket = await tx.tiket_servis.update({
        where: {
          id: tiket.id,
        },
        data: {
          status_servis: statusBaru,
          estimasi_waktu:
            statusBaru === tiket_servis_status_servis.Dibatalkan
              ? null
              : estimasiWaktu,
          estimasi_biaya:
            statusBaru === tiket_servis_status_servis.Dibatalkan
              ? 0
              : tiket.estimasi_biaya,
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
            orderBy: {
              id: "desc",
            },
          },
          detail_tiket_servis: {
            include: {
              jasa_servis: true,
              sparepart: {
                include: {
                  suppliers: true,
                },
              },
            },
          },
          pembayaran_servis: true,
          garansi: true,
        },
      });

      return updatedTiket;
    });

    return NextResponse.json({
      success: true,
      message:
        statusBaru === tiket_servis_status_servis.Dibatalkan
          ? "Tiket servis berhasil dibatalkan dan stok sparepart dikembalikan"
          : "Status dan estimasi waktu servis berhasil diperbarui",
      data: serializeData(result),
    });
  } catch (error) {
    console.error("PUT STATUS TEKNISI ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal memperbarui status servis",
      },
      { status: 500 }
    );
  }
}