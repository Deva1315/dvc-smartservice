import type { FormType } from "@/types/form-types";

export type PegawaiRoleOption = {
  value: string;
  label: string;
};

export type PegawaiFormInitialData = {
  id?: string;
  nama: string;
  email: string;
  phone: string;
  address: string | null;
  id_roles: string;
  photo_profile_path: string | null;
};

export type PegawaiFormPayload = {
  nama: string;
  email: string;
  password: string | null;
  phone: string;
  address: string | null;
  id_roles: string;
  photoFile: File | null;
  photoPreviewUrl: string | null;
  removePhoto: boolean;
};

export type PegawaiFormState = {
  nama: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  id_roles: string | null;
  photoFile: File | null;
  photoPreviewUrl: string | null;
  removePhoto: boolean;
};

export type PegawaiFormFieldChangeHandler = <
  K extends keyof PegawaiFormState,
>(
  key: K,
  value: PegawaiFormState[K]
) => void;

export type PegawaiFormModalProps = {
  opened: boolean;
  onClose: () => void;
  formType: FormType;
  roleOptions: PegawaiRoleOption[];
  initialData?: PegawaiFormInitialData | null;
  onSubmit: (
    payload: PegawaiFormPayload,
    formType: FormType
  ) => Promise<boolean>;
};

export const initialPegawaiFormState: PegawaiFormState = {
  nama: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  id_roles: null,
  photoFile: null,
  photoPreviewUrl: null,
  removePhoto: false,
};