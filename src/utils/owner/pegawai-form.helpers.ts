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

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Gagal membaca file"));
    };

    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}