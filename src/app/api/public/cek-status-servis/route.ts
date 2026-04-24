import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function mapStatusVerifikasiToUi(status: string) {
  if (status === "Menunggu") {
    return "Menunggu Verifikasi";
  }

  if (status === "Diterima") {
    return "Terverifikasi";
  }

  if (status === "Ditolak") {
    return "Ditolak";
  }

  return status;
}

function mapStatusServisToUi(status: string) {
  if (status === "Belum_Diproses") {
    return "Belum Diproses";
  }

  if (status === "Diproses") {
    return "Diproses";
  }

  if (status === "Menunggu_Sparepart") {
    return "Menunggu Sparepart";
  }

  if (status === "Selesai") {
    return "Selesai";
  }

  if (status === "Diambil") {
    return "Diambil";
  }

  if (status === "Dibatalkan") {
    return "Dibatalkan";
  }

  return status;
}
function formatEstimasiWaktu(date: Date | null) {
  if (!date) {
    return null;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nomor_tiket = (searchParams.get("nomor_tiket") ?? "").trim().toUpperCase();

    if (!nomor_tiket) {
      return NextResponse.json(
        {
          success: false,
          message: "Nomor tiket servis wajib diisi.",
        },
        { status: 400 }
      );
    }

    const ticket = await prisma.tiket_servis.findFirst({
      where: {
        nomor_tiket,
      },
      include: {
        drop_point: true,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          message: "Nomor tiket tidak ditemukan. Silakan periksa kembali.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Status servis berhasil diambil.",
      ticket: {
        id: ticket.id,
        nomorTiket: ticket.nomor_tiket,
        sumberTiket: ticket.sumber_tiket,
        addressCust: ticket.alamat_cust ?? "",
        namaCust: ticket.nama_cust,
        phoneCust: ticket.phone_cust,
        jenisPerangkat: ticket.jenis_perangkat,
        merkPerangkat: ticket.merk_perangkat ?? "",
        keluhan: ticket.keluhan,
        statusVerifikasi: mapStatusVerifikasiToUi(ticket.status_verifikasi),
        statusServis: mapStatusServisToUi(ticket.status_servis),
        tanggalMasuk: ticket.tanggal_masuk,
        estimasiWaktu: formatEstimasiWaktu(ticket.estimasi_waktu),
        estimasiBiaya:
          ticket.estimasi_biaya === null || ticket.estimasi_biaya === undefined
            ? null
            : Number(ticket.estimasi_biaya),
        dropPointNama: ticket.drop_point?.nama_drop_point ?? null,
      },
    });
  } catch (error) {
    console.error("GET /api/public/cek-status-servis error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil status servis.",
      },
      { status: 500 }
    );
  }
}