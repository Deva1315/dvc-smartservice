import type {
  DetailTiketServisApiItem,
  StatusServis,
  StatusVerifikasi,
} from "@/lib/teknisi/teknisi-tiket-servis.client";
import type { JasaServisApiItem } from "@/lib/admin-penjualan/admin-penjualan-jasa-servis.client";
import type { SparepartApiItem } from "@/lib/admin-gudang/admin-gudang-sparepart.client";
import type { MasterOption } from "@/types/detail-tiket-servis-type";

export const statusServisOptions: {
  value: StatusServis;
  label: string;
}[] = [
  { value: "Belum_Diproses", label: "Belum Diproses" },
  { value: "Diproses", label: "Diproses" },
  { value: "Menunggu_Sparepart", label: "Menunggu Sparepart" },
  { value: "Selesai", label: "Selesai" },
  { value: "Dibatalkan", label: "Dibatalkan" },
];

export const allowedNextStatus: Record<StatusServis, StatusServis[]> = {
  Belum_Diproses: ["Diproses", "Dibatalkan"],
  Diproses: ["Menunggu_Sparepart", "Selesai", "Dibatalkan"],
  Menunggu_Sparepart: ["Diproses", "Selesai", "Dibatalkan"],
  Selesai: [],
  Diambil: [],
  Dibatalkan: [],
};

export function toNumber(value: string | number | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatDisplayDate(dateString: string | null | undefined) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDisplayDateTime(dateString: string | null | undefined) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function toDateValue(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string") {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }

  return null;
}

export function toIsoDateTime(value: Date | null) {
  if (!value) return null;

  if (Number.isNaN(value.getTime())) {
    return null;
  }

  return value.toISOString();
}

export function isSameDateTime(
  nextValue: Date | null,
  currentValue: string | null | undefined
) {
  const currentDate = toDateValue(currentValue);

  if (!nextValue && !currentDate) return true;
  if (!nextValue || !currentDate) return false;

  return nextValue.getTime() === currentDate.getTime();
}

export function getStatusServisLabel(status: StatusServis) {
  switch (status) {
    case "Belum_Diproses":
      return "Belum Diproses";
    case "Diproses":
      return "Diproses";
    case "Menunggu_Sparepart":
      return "Menunggu Sparepart";
    case "Selesai":
      return "Selesai";
    case "Diambil":
      return "Diambil";
    case "Dibatalkan":
      return "Dibatalkan";
    default:
      return status;
  }
}

export function getStatusServisColor(status: StatusServis) {
  switch (status) {
    case "Belum_Diproses":
      return "gray";
    case "Diproses":
      return "blue";
    case "Menunggu_Sparepart":
      return "yellow";
    case "Selesai":
      return "green";
    case "Diambil":
      return "teal";
    case "Dibatalkan":
      return "red";
    default:
      return "gray";
  }
}

export function getStatusVerifikasiLabel(status: StatusVerifikasi) {
  switch (status) {
    case "Menunggu":
      return "Menunggu";
    case "Diterima":
      return "Diterima";
    case "Ditolak":
      return "Ditolak";
    default:
      return status;
  }
}

export function getStatusVerifikasiColor(status: StatusVerifikasi) {
  switch (status) {
    case "Menunggu":
      return "orange";
    case "Diterima":
      return "green";
    case "Ditolak":
      return "red";
    default:
      return "gray";
  }
}

export function getPerangkatDisplay(
  detail: Pick<DetailTiketServisApiItem, "jenis_perangkat" | "merk_perangkat">
) {
  if (!detail.merk_perangkat) {
    return detail.jenis_perangkat;
  }

  return `${detail.jenis_perangkat} - ${detail.merk_perangkat}`;
}

export function getDropPointDisplay(detail: DetailTiketServisApiItem) {
  if (!detail.drop_point) {
    return "Tidak melalui drop point";
  }

  if (detail.id_drop_point) {
    return `${detail.id_drop_point} - ${detail.drop_point.nama_drop_point}`;
  }

  return detail.drop_point.nama_drop_point;
}

export function getReferensiSolusiAwal(detail: DetailTiketServisApiItem) {
  const diagnosaAi = detail.diagnosa_ai;

  if (!diagnosaAi) {
    return "-";
  }

  const items = [
    diagnosaAi.kemungkinan_penyebab
      ? `Kemungkinan penyebab: ${diagnosaAi.kemungkinan_penyebab}`
      : "",
    diagnosaAi.kemungkinan_solusi
      ? `Solusi awal: ${diagnosaAi.kemungkinan_solusi}`
      : "",
    diagnosaAi.saran_tindakan
      ? `Saran tindakan: ${diagnosaAi.saran_tindakan}`
      : "",
  ].filter(Boolean);

  if (items.length > 0) {
    return items.join("\n");
  }

  return diagnosaAi.gejala || "-";
}

export function mapJasaMasterOptions(data: JasaServisApiItem[]): MasterOption[] {
  return data.map((item) => ({
    value: item.id,
    label: item.nama_jasa_servis,
    harga: toNumber(item.harga),
  }));
}

export function mapSparepartMasterOptions(
  data: SparepartApiItem[]
): MasterOption[] {
  return data.map((item) => ({
    value: item.id,
    label: item.nama_sparepart,
    harga: toNumber(item.harga),
    stock: toNumber(item.stock),
  }));
}