import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  tiket_servis_sumber_tiket,
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

function generateTiketServisId() {
  return `TKS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

async function generateNomorTiket() {
    const now = new Date();
    const year = now.getFullYear();
    const prefix = `TK-${year}-`;

    const totalThisYear = await prisma.tiket_servis.count({
        where: {
            nomor_tiket: {
                startsWith: prefix,
            },
        },
    });

    const nextNumber = totalThisYear + 1;
    return `${prefix}${String(nextNumber).padStart(3, "0")}`;
}


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const statusVerifikasi = searchParams.get("status_verifikasi");
    const statusServis = searchParams.get("status_servis");

    const where = {
      AND: [
        statusVerifikasi
          ? {
              status_verifikasi:
                statusVerifikasi as tiket_servis_status_verifikasi,
            }
          : {},
        statusServis
          ? {
              status_servis: statusServis as tiket_servis_status_servis,
            }
          : {},
        search
          ? {
              OR: [
                { nomor_tiket: { contains: search } },
                { nama_cust: { contains: search } },
                { phone_cust: { contains: search } },
                { jenis_perangkat: { contains: search } },
                { merk_perangkat: { contains: search } },
              ],
            }
          : {},
      ],
    };

    const data = await prisma.tiket_servis.findMany({
      where,
      orderBy: {
        tanggal_masuk: "desc",
      },
      include: {
        drop_point: true,
        diagnosa_ai: true,
        detail_tiket_servis: {
          include: {
            jasa_servis: true,
            sparepart: true,
          },
        },
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
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data tiket servis berhasil diambil",
      data: serializeData(data),
    });
  } catch (error) {
    console.error("GET ADMIN PENJUALAN TIKET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data tiket servis",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const namaCust = body.nama_cust?.trim();
    const phoneCust = body.phone_cust?.trim();
    const alamatCust = body.alamat_cust?.trim() || null;
    const jenisPerangkat = body.jenis_perangkat?.trim();
    const merkPerangkat = body.merk_perangkat?.trim() || null;
    const keluhan = body.keluhan?.trim();
    const idDropPoint = body.id_drop_point ? BigInt(body.id_drop_point) : null;

    if (!namaCust || !phoneCust || !jenisPerangkat || !keluhan) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama, no HP, jenis perangkat, dan keluhan wajib diisi",
        },
        { status: 400 }
      );
    }

    if (idDropPoint) {
      const dropPoint = await prisma.drop_point.findUnique({
        where: {
          id: idDropPoint,
        },
      });

      if (!dropPoint) {
        return NextResponse.json(
          {
            success: false,
            message: "Drop point tidak ditemukan",
          },
          { status: 404 }
        );
      }
    }

    const nomorTiket = await generateNomorTiket();

    const tiket = await prisma.tiket_servis.create({
      data: {
        id: generateTiketServisId(),
        nomor_tiket: nomorTiket,
        sumber_tiket: tiket_servis_sumber_tiket.Admin_Penjualan,
        id_drop_point: idDropPoint,
        id_diagnosa_ai: null,
        nama_cust: namaCust,
        phone_cust: phoneCust,
        alamat_cust: alamatCust,
        jenis_perangkat: jenisPerangkat,
        merk_perangkat: merkPerangkat,
        keluhan,
        status_verifikasi: tiket_servis_status_verifikasi.Menunggu,
        status_servis: tiket_servis_status_servis.Belum_Diproses,
        alasan_penolakan: null,
        tanggal_masuk: new Date(),
        tanggal_verifikasi: null,
        estimasi_waktu: null,
        estimasi_biaya: 0,
        guest_session_id: null,
      },
      include: {
        drop_point: true,
        diagnosa_ai: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Tiket servis berhasil dibuat",
        data: serializeData(tiket),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST ADMIN PENJUALAN TIKET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat tiket servis",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const nomorTiket = body.nomor_tiket?.trim();
    const namaCust = body.nama_cust?.trim();
    const phoneCust = body.phone_cust?.trim();
    const alamatCust = body.alamat_cust?.trim() || null;
    const jenisPerangkat = body.jenis_perangkat?.trim();
    const merkPerangkat = body.merk_perangkat?.trim() || null;
    const keluhan = body.keluhan?.trim();

    const rawDropPointId = body.id_drop_point ?? body.drop_point_id ?? null;
    const idDropPoint = rawDropPointId ? BigInt(rawDropPointId) : null;

    if (!nomorTiket) {
      return NextResponse.json(
        {
          success: false,
          message: "Nomor tiket wajib dikirim untuk update tiket servis.",
        },
        { status: 400 }
      );
    }

    if (!namaCust || !phoneCust || !jenisPerangkat || !keluhan) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama, no HP, jenis perangkat, dan keluhan wajib diisi.",
        },
        { status: 400 }
      );
    }

    const existingTicket = await prisma.tiket_servis.findUnique({
      where: {
        nomor_tiket: nomorTiket,
      },
      select: {
        id: true,
        nomor_tiket: true,
      },
    });

    if (!existingTicket) {
      return NextResponse.json(
        {
          success: false,
          message: "Tiket servis tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    if (idDropPoint) {
      const dropPoint = await prisma.drop_point.findUnique({
        where: {
          id: idDropPoint,
        },
        select: {
          id: true,
        },
      });

      if (!dropPoint) {
        return NextResponse.json(
          {
            success: false,
            message: "Drop Point tidak ditemukan.",
          },
          { status: 404 }
        );
      }
    }

    const updatedTicket = await prisma.tiket_servis.update({
      where: {
        nomor_tiket: nomorTiket,
      },
      data: {
        nama_cust: namaCust,
        phone_cust: phoneCust,
        alamat_cust: alamatCust,
        jenis_perangkat: jenisPerangkat,
        merk_perangkat: merkPerangkat,
        keluhan,
        id_drop_point: idDropPoint,
      },
      include: {
        drop_point: true,
        diagnosa_ai: true,
        detail_tiket_servis: {
          include: {
            jasa_servis: true,
            sparepart: true,
          },
        },
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
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tiket servis berhasil diperbarui.",
      data: serializeData(updatedTicket),
    });
  } catch (error) {
    console.error("PUT ADMIN PENJUALAN TIKET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui tiket servis.",
      },
      { status: 500 }
    );
  }
}