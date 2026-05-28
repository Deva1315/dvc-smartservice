export const IMAGE_UPLOAD_LIMITS = {
  BARANG_MB: 2,
  SPAREPART_MB: 2,
  PEGAWAI_MB: 5,
  PROFILE_OWNER_MB: 0.5,
  DIAGNOSA_AI_MB: 5,
} as const;

const DEFAULT_ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

type ValidateImageFileParams = {
  file: File;
  maxSizeMb: number;
  allowedTypes?: string[];
};

type ValidateImageFileResult =
  | {
      valid: true;
      message: null;
    }
  | {
      valid: false;
      message: string;
    };

export function formatMaxImageSize(maxSizeMb: number) {
  if (maxSizeMb < 1) {
    return `${Math.round(maxSizeMb * 1024)} KB`;
  }

  return `${maxSizeMb} MB`;
}

export function validateImageFile({
  file,
  maxSizeMb,
  allowedTypes = DEFAULT_ALLOWED_IMAGE_TYPES,
}: ValidateImageFileParams): ValidateImageFileResult {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: "Format gambar tidak valid. Gunakan JPG, JPEG, PNG, atau WEBP.",
    };
  }

  const maxSizeBytes = maxSizeMb * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      message: `Ukuran gambar melebihi maksimal ${formatMaxImageSize(maxSizeMb)}.`,
    };
  }

  return {
    valid: true,
    message: null,
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

      reject(new Error("Gagal membaca file gambar."));
    };

    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}