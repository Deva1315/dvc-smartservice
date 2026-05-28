import type { FormType } from "@/types/form-types";
import type {
  PegawaiFormInitialData,
  PegawaiFormState,
} from "@/types/pegawai-form.types";

export function getPegawaiModalTitle(formType: FormType) {
  return formType === "create" ? "Kelola Pegawai" : "Edit Pegawai";
}

export function getPegawaiSubmitLabel(formType: FormType) {
  return formType === "create" ? "Simpan Pegawai" : "Update Pegawai";
}

export function buildPegawaiEditFormState(
  initialData: PegawaiFormInitialData
): PegawaiFormState {
  return {
    nama: initialData.nama,
    email: initialData.email,
    password: "",
    phone: initialData.phone,
    address: initialData.address ?? "",
    id_roles: initialData.id_roles,
    photoFile: null,
    photoPreviewUrl: initialData.photo_profile_path ?? null,
    removePhoto: false,
  };
}