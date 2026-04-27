import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  pembayaran_servis_status_pembayaran,
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

function getPerangkatDisplay(item: {
  jenis_perangkat: string;
  merk_perangkat: string | null;
}) {
  return item.merk_perangkat
    ? `${item.jenis_perangkat} - ${item.merk_perangkat}`
    : item.jenis_perangkat;
}

export async function GET() {
  try {
    const data = await prisma.tiket_servis.findMany({
      where: {
        status_verifikasi: tiket_servis_status_verifikasi.Diterima,
        pembayaran_servis: {
          some: {
            status_pembayaran: pembayaran_servis_status_pembayaran.Dibayar,
          },
        },
        garansi: {
          none: {},
        },
      },
      orderBy: {
        tanggal_masuk: "desc",
      },
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
      take: 100,
    });

    const mappedData = data.map((item) => {
      const pembayaran = item.pembayaran_servis[0] || null;
      const perangkat = getPerangkatDisplay(item);

      return {
        value: item.nomor_tiket,
        label: `${item.nomor_tiket} - ${item.nama_cust}`,
        id_tiket_servis: item.id,
        nomor_tiket: item.nomor_tiket,
        nama_pelanggan: item.nama_cust,
        namaPelanggan: item.nama_cust,
        no_hp: item.phone_cust,
        perangkat,
        tanggal_servis:
          item.estimasi_waktu ||
          pembayaran?.tanggal_pembayaran ||
          item.tanggal_masuk,
        tanggalServis:
          item.estimasi_waktu ||
          pembayaran?.tanggal_pembayaran ||
          item.tanggal_masuk,
        total_pembayaran: pembayaran?.total_pembayaran || 0,
        metode_pembayaran: pembayaran?.metode_pembayaran || null,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Opsi tiket garansi berhasil diambil",
      data: serializeData(mappedData),
    });
  } catch (error) {
    console.error("GET TIKET OPTIONS GARANSI ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil opsi tiket garansi",
      },
      { status: 500 }
    );
  }
}