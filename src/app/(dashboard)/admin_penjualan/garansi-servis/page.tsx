import AdminPenjualanGaransiServisPage from "@/components/UI/dashboard/admin-penjualan/garansi-servis/AdminPenjualanGaransiServisPage";
import { prisma } from "@/lib/prisma";
import {
  garansi_status_garansi,
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

function calculateDiffDays(startDate: Date, endDate: Date) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffMs = end.getTime() - start.getTime();

  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function getPerangkatDisplay(item: {
  jenis_perangkat: string;
  merk_perangkat: string | null;
}) {
  return item.merk_perangkat
    ? `${item.jenis_perangkat} - ${item.merk_perangkat}`
    : item.jenis_perangkat;
}

function getStatusDisplay(status: garansi_status_garansi) {
  if (status === garansi_status_garansi.Expired) return "Habis";
  return status;
}

async function updateExpiredGaransi() {
  await prisma.garansi.updateMany({
    where: {
      status_garansi: garansi_status_garansi.Aktif,
      tanggal_akhir: {
        lt: new Date(),
      },
    },
    data: {
      status_garansi: garansi_status_garansi.Expired,
    },
  });
}

function mapGaransi(item: {
  id: bigint;
  id_tiket_servis: string;
  id_user: bigint;
  tanggal_mulai: Date;
  tanggal_akhir: Date;
  tanggal_klaim: Date | null;
  keterangan_garansi: string | null;
  status_garansi: garansi_status_garansi;
  tiket_servis: {
    id: string;
    nomor_tiket: string;
    nama_cust: string;
    phone_cust: string;
    jenis_perangkat: string;
    merk_perangkat: string | null;
    tanggal_masuk: Date;
    estimasi_waktu: Date | null;
    status_servis: string;
    pembayaran_servis: {
      id: bigint;
      tanggal_pembayaran: Date;
      total_pembayaran: unknown;
      metode_pembayaran: string;
      status_pembayaran: string;
    }[];
  };
  users: {
    id: bigint;
    nama: string;
    email: string;
  };
}) {
  const tanggalServis =
    item.tiket_servis.estimasi_waktu ||
    item.tiket_servis.pembayaran_servis[0]?.tanggal_pembayaran ||
    item.tiket_servis.tanggal_masuk;

  return {
    id: item.id,
    id_tiket_servis: item.id_tiket_servis,
    id_user: item.id_user,
    nomor_tiket: item.tiket_servis.nomor_tiket,
    nama_pelanggan: item.tiket_servis.nama_cust,
    no_hp: item.tiket_servis.phone_cust,
    perangkat: getPerangkatDisplay(item.tiket_servis),
    tanggal_servis: tanggalServis,
    tanggal_mulai: item.tanggal_mulai,
    tanggal_akhir: item.tanggal_akhir,
    tanggal_klaim: item.tanggal_klaim,
    periode_hari: calculateDiffDays(item.tanggal_mulai, item.tanggal_akhir),
    keterangan_garansi: item.keterangan_garansi,
    status_garansi: item.status_garansi,
    status_display: getStatusDisplay(item.status_garansi),
    total_pembayaran:
      item.tiket_servis.pembayaran_servis[0]?.total_pembayaran || 0,
    admin: {
      id: item.users.id,
      nama: item.users.nama,
      email: item.users.email,
    },
    tiket_servis: item.tiket_servis,
  };
}

export default async function Page() {
  await updateExpiredGaransi();

  const [garansiData, tiketOptionsData] = await Promise.all([
    prisma.garansi.findMany({
      take: 100,
      orderBy: {
        id: "desc",
      },
      include: {
        users: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
        tiket_servis: {
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
        },
      },
    }),

    prisma.tiket_servis.findMany({
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
    }),
  ]);

  const initialGaransi = garansiData.map(mapGaransi);

  const initialTiketOptions = tiketOptionsData.map((item) => {
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

  return (
    <AdminPenjualanGaransiServisPage
      initialGaransi={serializeData(initialGaransi)}
      initialTiketOptions={serializeData(initialTiketOptions)}
    />
  );
}