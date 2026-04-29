import type { DetailTiketServisApiItem } from "@/lib/teknisi/teknisi-tiket-servis.client";

export type MasterOption = {
  value: string;
  label: string;
  harga: number;
  stock?: number;
};

export type LoadingAction =
  | "fetch"
  | "status"
  | "diagnosa"
  | "tambah-jasa"
  | "hapus-jasa"
  | "tambah-sparepart"
  | "hapus-sparepart"
  | null;

export type DetailTiketServisDetailItem =
  DetailTiketServisApiItem["detail_tiket_servis"][number];

export type LatestDiagnosa =
  DetailTiketServisApiItem["diagnosa_lanjutan"][number] | null;