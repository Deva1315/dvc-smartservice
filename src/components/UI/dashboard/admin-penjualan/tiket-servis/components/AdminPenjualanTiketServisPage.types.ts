import type {
  StatusServis,
  StatusVerifikasi,
} from "@/lib/admin-penjualan/admin-penjualan-tiket-servis.client";

export type AdminPenjualanTiketPageRow = {
  id: string;
  no: number;
  nomorTiket: string;
  namaPelanggan: string;
  noHp: string;
  alamatCust: string | null;
  jenisPerangkat: string;
  merkPerangkat: string | null;
  keluhan: string;
  idDropPoint: string | null;
  namaDropPoint: string | null;
  statusVerifikasi: StatusVerifikasi;
  statusServis: StatusServis;
  tanggalMasuk: string;
};