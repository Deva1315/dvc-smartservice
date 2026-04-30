import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tiket_servis_status_servis } from "@/generated/prisma/client";
import { getAuthSession } from "@/lib/auth/get-auth-session";

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

async function requireTeknisiSession() {
  const session = await getAuthSession();

  if (!session) {
    throw new Error("Unauthorized. Silakan login terlebih dahulu.");
  }

  const role = normalizeRole(session.roleName);

  if (role !== "teknisi" && role !== "owner") {
    throw new Error(
      "Forbidden. Hanya Teknisi atau Owner yang dapat memperbarui status servis."
    );
  }

  return session;
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

function parseEstimasiWaktu(value: unknown) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsedEstimasiWaktu = new Date(value.trim());

  if (Number.isNaN(parsedEstimasiWaktu.getTime())) {
    throw new Error("Estimasi waktu harus berupa tanggal dan waktu yang valid");
  }

  return parsedEstimasiWaktu;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireTeknisiSession();

    const { nomorTiket } = await params;
    const body = await request.json();

    const statusBaru = parseStatus(body.status_servis);
    const estimasiWaktu = parseEstimasiWaktu(body.estimasi_waktu);

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
          include: {
            sparepart: true,
          },
        });

        if (detailSparepartList.length > 0) {
          const stockMutasi = await tx.stock_mutasi.create({
            data: {
              id_user: BigInt(session.id),
              id_supplier: null,
              jenis_mutasi: "Barang Masuk",
              tanggal_mutasi: new Date(),
              keterangan: [
                "Sumber: Pembatalan Tiket Servis",
                `No. Tiket: ${tiket.nomor_tiket}`,
                `Pelanggan: ${tiket.nama_cust}`,
                "Keterangan: Tiket dibatalkan sehingga sparepart yang sudah keluar dikembalikan ke stok",
              ].join("\n"),
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

              await tx.detail_stock_mutasi.create({
                data: {
                  id_stock_mutasi: stockMutasi.id,
                  id_barang: null,
                  id_sparepart: detail.id_sparepart,
                  jumlah: detail.jumlah,
                },
              });
            }
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
          ? "Tiket servis berhasil dibatalkan, stok sparepart dikembalikan, dan tercatat sebagai Barang Masuk"
          : "Status dan estimasi waktu servis berhasil diperbarui",
      data: serializeData(result),
    });
  } catch (error) {
    console.error("PUT STATUS TEKNISI ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Gagal memperbarui status servis";

    const status = message.includes("Unauthorized")
      ? 401
      : message.includes("Forbidden")
      ? 403
      : message.includes("tidak ditemukan")
      ? 404
      : message.includes("tidak valid") ||
        message.includes("belum diterima") ||
        message.includes("tidak boleh") ||
        message.includes("Estimasi waktu")
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