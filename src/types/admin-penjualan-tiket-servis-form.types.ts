import type { FormType } from "@/types/form-types";

export type AdminPenjualanTicketStatusVerifikasi =
  | "Menunggu"
  | "Diterima"
  | "Ditolak";

export type AdminPenjualanTicketStatusServis =
  | "Belum Diproses"
  | "Diproses"
  | "Menunggu Sparepart"
  | "Selesai"
  | "Diambil"
  | "Dibatalkan";

export type AdminPenjualanTicketDropPointOption = {
  value: string;
  label: string;
};

export type AdminPenjualanTicketRow = {
  id?: string;
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
  status_verifikasi: AdminPenjualanTicketStatusVerifikasi;
  status_servis: AdminPenjualanTicketStatusServis;
};

export type AdminPenjualanTiketServisFormState = {
  nama_cust: string;
  phone_cust: string;
  alamat_cust: string;
  jenis_perangkat: string | null;
  merk_perangkat: string;
  keluhan: string;
  gunakan_drop_point: "ya" | "tidak";
  drop_point_id: string | null;
};

export const adminPenjualanTiketServisInitialForm: AdminPenjualanTiketServisFormState =
  {
    nama_cust: "",
    phone_cust: "",
    alamat_cust: "",
    jenis_perangkat: null,
    merk_perangkat: "",
    keluhan: "",
    gunakan_drop_point: "tidak",
    drop_point_id: null,
  };

export type AdminPenjualanTiketServisFormFieldChangeHandler = <
  K extends keyof AdminPenjualanTiketServisFormState,
>(
  key: K,
  value: AdminPenjualanTiketServisFormState[K]
) => void;

export interface AdminPenjualanTiketServisFormModalProps {
  opened: boolean;
  onClose: () => void;
  formType: FormType;
  nomorTiket: string;
  tanggalMasuk: Date;
  dropPointOptions: AdminPenjualanTicketDropPointOption[];
  initialData?: AdminPenjualanTicketRow | null;
  onSubmit: (
    ticket: AdminPenjualanTicketRow,
    formType: FormType
  ) => Promise<boolean>;
}