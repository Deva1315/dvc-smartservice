import type { FormType } from "@/types/form-types";

export type TicketStatusVerifikasi = "Menunggu" | "Diterima" | "Ditolak";

export type TicketStatusServis =
  | "Belum Diproses"
  | "Diproses"
  | "Menunggu Sparepart"
  | "Selesai"
  | "Diambil"
  | "Dibatalkan";

export type TicketDropPointOption = {
  value: string;
  label: string;
  originalLabel?: string;
  alamat?: string;
  jarakKm?: number | null;
  jarakLabel?: string | null;
};

export type TicketRow = {
  id?: string;
  id_diagnosa_ai: string | null;
  diagnosa_awal_kerusakan: string | null;
  nomor_tiket: string;
  tanggal_masuk: Date;
  nama_cust: string;
  phone_cust: string;
  alamat_cust: string;
  jenis_perangkat: string;
  merk_perangkat: string;
  keluhan: string;
  gunakan_drop_point: boolean;
  drop_point_id: string | null;
  drop_point_nama: string | null;
  status_verifikasi: TicketStatusVerifikasi;
  status_servis: TicketStatusServis;
};

export type FormState = {
  id_diagnosa_ai: string | null;
  diagnosa_awal_kerusakan: string;
  nama_cust: string;
  phone_cust: string;
  alamat_cust: string;
  jenis_perangkat: string | null;
  merk_perangkat: string;
  keluhan: string;
  gunakan_drop_point: "ya" | "tidak";
  drop_point_id: string | null;
};

export const initialForm: FormState = {
  id_diagnosa_ai: null,
  diagnosa_awal_kerusakan: "",
  nama_cust: "",
  phone_cust: "",
  alamat_cust: "",
  jenis_perangkat: null,
  merk_perangkat: "",
  keluhan: "",
  gunakan_drop_point: "tidak",
  drop_point_id: null,
};

export type FormFieldChangeHandler = <K extends keyof FormState>(
  key: K,
  value: FormState[K]
) => void;

export interface TiketServisFormModalProps {
  opened: boolean;
  onClose: () => void;
  formType: FormType;
  diagnosaAiId?: string | null;
  nomorTiket: string;
  tanggalMasuk: Date;
  dropPointOptions: TicketDropPointOption[];
  initialData?: TicketRow | null;
  onSubmit: (ticket: TicketRow, formType: FormType) => Promise<boolean>;
}