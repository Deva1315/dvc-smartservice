import type { FormType } from "@/types/form-types";

export type SparepartFormInitialData = {
  id: string;
  nama: string;
  kode: string;
  merk: string;
  stok: number;
  harga: number;
  supplier: string;
  deskripsi: string | null;
  foto: string | null;
};

export type SparepartFormPayload = {
  nama: string;
  kode: string;
  merk: string;
  stok: number;
  harga: number;
  supplier: string;
  deskripsi: string | null;
  fotoBase64: string | null;
};

export type SparepartSelectOption = {
  value: string;
  label: string;
};

export type SparepartFormState = {
  nama: string;
  kode: string;
  merk: string;
  stok: number;
  harga: number;
  supplier: string | null;
  deskripsi: string;
  fotoBase64: string | null;
};

export type SparepartFormFieldChangeHandler = <
  K extends keyof SparepartFormState,
>(
  key: K,
  value: SparepartFormState[K]
) => void;

export type SparepartFormModalProps = {
  opened: boolean;
  onClose: () => void;
  formType: FormType;
  initialData: SparepartFormInitialData | null;
  supplierOptions: SparepartSelectOption[];
  onSubmit: (
    payload: SparepartFormPayload,
    formType: FormType
  ) => Promise<boolean>;
  isSubmitting?: boolean;
};

export const initialSparepartFormState: SparepartFormState = {
  nama: "",
  kode: "",
  merk: "",
  stok: 0,
  harga: 0,
  supplier: null,
  deskripsi: "",
  fotoBase64: null,
};