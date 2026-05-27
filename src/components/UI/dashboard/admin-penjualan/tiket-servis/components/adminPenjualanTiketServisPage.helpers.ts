import type {
  AdminPenjualanTiketApiItem,
  StatusServis,
  StatusVerifikasi,
} from "@/lib/admin-penjualan/admin-penjualan-tiket-servis.client";
import type { AdminPenjualanTicketRow } from "@/types/admin-penjualan-tiket-servis-form.types";
import type { AdminPenjualanTiketPageRow } from "./AdminPenjualanTiketServisPage.types";

export const filterStatusServisOptions = [
  { value: "Menunggu", label: "Menunggu Verifikasi" },
  { value: "Diterima", label: "Diterima" },
  { value: "Ditolak", label: "Ditolak" },
  { value: "Belum_Diproses", label: "Belum Diproses" },
  { value: "Diproses", label: "Diproses" },
  { value: "Menunggu_Sparepart", label: "Menunggu Sparepart" },
  { value: "Selesai", label: "Selesai" },
  { value: "Diambil", label: "Diambil" },
  { value: "Dibatalkan", label: "Dibatalkan" },
];

export function formatDisplayDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getPerangkatDisplay(row: AdminPenjualanTiketPageRow) {
  if (!row.merkPerangkat) {
    return row.jenisPerangkat;
  }

  return `${row.jenisPerangkat} - ${row.merkPerangkat}`;
}

export function getStatusServisLabel(status: StatusServis) {
  const labels: Record<StatusServis, string> = {
    Belum_Diproses: "Belum Diproses",
    Diproses: "Diproses",
    Menunggu_Sparepart: "Menunggu Sparepart",
    Selesai: "Selesai",
    Diambil: "Diambil",
    Dibatalkan: "Dibatalkan",
  };

  return labels[status] ?? status;
}

export function getStatusServisColor(status: StatusServis) {
  const colors: Record<StatusServis, string> = {
    Belum_Diproses: "gray",
    Diproses: "blue",
    Menunggu_Sparepart: "orange",
    Selesai: "teal",
    Diambil: "indigo",
    Dibatalkan: "red",
  };

  return colors[status] ?? "gray";
}

export function getStatusVerifikasiLabel(status: StatusVerifikasi) {
  const labels: Record<StatusVerifikasi, string> = {
    Menunggu: "Menunggu",
    Diterima: "Diterima",
    Ditolak: "Ditolak",
  };

  return labels[status] ?? status;
}

export function getStatusVerifikasiColor(status: StatusVerifikasi) {
  const colors: Record<StatusVerifikasi, string> = {
    Menunggu: "yellow",
    Diterima: "green",
    Ditolak: "red",
  };

  return colors[status] ?? "gray";
}

export function normalizeStatusServisForForm(
  status: StatusServis
): AdminPenjualanTicketRow["status_servis"] {
  const labels: Record<StatusServis, AdminPenjualanTicketRow["status_servis"]> =
    {
      Belum_Diproses: "Belum Diproses",
      Diproses: "Diproses",
      Menunggu_Sparepart: "Menunggu Sparepart",
      Selesai: "Selesai",
      Diambil: "Diambil",
      Dibatalkan: "Dibatalkan",
    };

  return labels[status] ?? "Belum Diproses";
}

export function mapTiketServis(data: AdminPenjualanTiketApiItem[]) {
  return data.map((item, index): AdminPenjualanTiketPageRow => {
    const rawItem = item as AdminPenjualanTiketApiItem & {
      id_drop_point?: string | null;
      drop_point_id?: string | null;
      drop_point_nama?: string | null;
    };

    return {
      id: item.id,
      no: index + 1,
      nomorTiket: item.nomor_tiket,
      namaPelanggan: item.nama_cust,
      noHp: item.phone_cust,
      alamatCust: item.alamat_cust,
      jenisPerangkat: item.jenis_perangkat,
      merkPerangkat: item.merk_perangkat,
      keluhan: item.keluhan,
      idDropPoint: rawItem.id_drop_point ?? rawItem.drop_point_id ?? null,
      namaDropPoint:
        item.drop_point?.nama_drop_point ?? rawItem.drop_point_nama ?? null,
      statusVerifikasi: item.status_verifikasi,
      statusServis: item.status_servis,
      tanggalMasuk: item.tanggal_masuk,
    };
  });
}

export function mapPageRowToFormRow(
  row: AdminPenjualanTiketPageRow
): AdminPenjualanTicketRow {
  return {
    id: row.id,
    nomor_tiket: row.nomorTiket,
    tanggal_masuk: new Date(row.tanggalMasuk),
    nama_cust: row.namaPelanggan,
    phone_cust: row.noHp,
    alamat_cust: row.alamatCust ?? "",
    jenis_perangkat: row.jenisPerangkat,
    merk_perangkat: row.merkPerangkat ?? "",
    keluhan: row.keluhan,
    gunakan_drop_point: Boolean(row.idDropPoint),
    drop_point_id: row.idDropPoint,
    drop_point_nama: row.namaDropPoint,
    status_verifikasi: row.statusVerifikasi,
    status_servis: normalizeStatusServisForForm(row.statusServis),
  };
}