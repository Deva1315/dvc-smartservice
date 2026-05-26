import type { FormType } from "@/types/form-types";

export type BarangFormInitialData = {
  id: string;
  nama: string;
  kode: string;
  merk: string;
  stok: number;
  harga: number;
  kategori: string;
  supplier: string;
  deskripsi: string | null;
  foto: string | null;
};

export type BarangFormPayload = {
  nama: string;
  kode: string;
  merk: string;
  stok: number;
  harga: number;
  kategori: string;
  supplier: string;
  deskripsi: string | null;
  fotoBase64: string | null;
};

export type BarangSelectOption = {
  value: string;
  label: string;
};

export type BarangFormState = {
  nama: string;
  kode: string;
  merk: string;
  stok: number;
  harga: number;
  kategori: string | null;
  supplier: string | null;
  deskripsi: string;
  fotoBase64: string | null;
};

export type BarangFormFieldChangeHandler = <K extends keyof BarangFormState>(
  key: K,
  value: BarangFormState[K]
) => void;

export type BarangFormModalProps = {
  opened: boolean;
  onClose: () => void;
  formType: FormType;
  initialData: BarangFormInitialData | null;
  kategoriOptions: BarangSelectOption[];
  supplierOptions: BarangSelectOption[];
  onSubmit: (
    payload: BarangFormPayload,
    formType: FormType
  ) => Promise<boolean>;
  isSubmitting?: boolean;
};

export const initialBarangFormState: BarangFormState = {
  nama: "",
  kode: "",
  merk: "",
  stok: 0,
  harga: 0,
  kategori: null,
  supplier: null,
  deskripsi: "",
  fotoBase64: null,
};