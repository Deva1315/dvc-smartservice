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

const allowedQueueStatuses: tiket_servis_status_servis[] = [
  tiket_servis_status_servis.Belum_Diproses,
  tiket_servis_status_servis.Diproses,
  tiket_servis_status_servis.Menunggu_Sparepart,
];

function parseStatus(status: string | null) {
  if (!status) return null;

  const normalizedStatus = status.replaceAll(" ", "_");

  if (
    normalizedStatus === "Belum_Diproses" ||
    normalizedStatus === "Diproses" ||
    normalizedStatus === "Menunggu_Sparepart" ||
    normalizedStatus === "Selesai" ||
    normalizedStatus === "Diambil" ||
    normalizedStatus === "Dibatalkan"
  ) {
    return normalizedStatus as tiket_servis_status_servis;
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const statusParam = searchParams.get("status");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;

    const parsedStatus = parseStatus(statusParam);

    const statusFilter =
      parsedStatus && allowedQueueStatuses.includes(parsedStatus)
        ? [parsedStatus]
        : allowedQueueStatuses;

    const where = {
      AND: [
        {
          status_verifikasi: "Diterima" as const,
        },
        {
          status_servis: {
            in: statusFilter,
          },
        },
        search
          ? {
              OR: [
                {
                  nomor_tiket: {
                    contains: search,
                  },
                },
                {
                  nama_cust: {
                    contains: search,
                  },
                },
                {
                  phone_cust: {
                    contains: search,
                  },
                },
                {
                  jenis_perangkat: {
                    contains: search,
                  },
                },
                {
                  merk_perangkat: {
                    contains: search,
                  },
                },
              ],
            }
          : {},
      ],
    };

    const [data, total] = await Promise.all([
      prisma.tiket_servis.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          tanggal_masuk: "desc",
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
              sparepart: true,
            },
          },
        },
      }),
      prisma.tiket_servis.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Data antrian tiket servis berhasil diambil",
      data: serializeData(data),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET TEKNISI TIKET SERVIS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data antrian tiket servis",
      },
      { status: 500 }
    );
  }
}