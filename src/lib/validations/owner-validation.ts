import { z } from "zod";
import {
  nullableFileSchema,
  optionalPhone,
  optionalString,
  requiredPhone,
  requiredSelect,
  requiredString,
} from "./shared-validation";

const pegawaiBaseFormSchema = z.object({
  nama: requiredString("Nama", 150),
  email: requiredString("Email", 150)
    .email("Format email tidak valid.")
    .toLowerCase(),
  phone: requiredPhone("No HP"),
  address: optionalString(),
  id_roles: requiredSelect("Jabatan"),
  photoFile: nullableFileSchema,
  photoPreviewUrl: optionalString(),
  removePhoto: z.boolean().optional().default(false),
});

export const pegawaiCreateFormSchema = pegawaiBaseFormSchema.extend({
  password: requiredString("Password", 255).min(
    6,
    "Password minimal 6 karakter."
  ),
});

export const pegawaiEditFormSchema = pegawaiBaseFormSchema.extend({
  password: optionalString(255).refine(
    (value) => !value || value.length >= 6,
    "Password minimal 6 karakter."
  ),
});

export function getPegawaiFormSchema(formType: "create" | "edit") {
  return formType === "create" ? pegawaiCreateFormSchema : pegawaiEditFormSchema;
}

export const dropPointFormSchema = z.object({
  nama_drop_point: requiredString("Nama drop point", 150),
  alamat: requiredString("Alamat"),
  phone: optionalPhone("No HP"),
  jam_operasional: optionalString(100),
});

export const jabatanFormSchema = z.object({
  nama_roles: requiredString("Nama jabatan", 100).refine(
    (value) => value.trim().toLowerCase() !== "owner",
    "Role Owner tidak dapat dikelola dari menu ini."
  ),
});

export type PegawaiCreateFormInput = z.infer<typeof pegawaiCreateFormSchema>;
export type PegawaiEditFormInput = z.infer<typeof pegawaiEditFormSchema>;
export type DropPointFormInput = z.infer<typeof dropPointFormSchema>;
export type JabatanFormInput = z.infer<typeof jabatanFormSchema>;