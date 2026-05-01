import { z } from "zod";
import {
  optionalDate,
  optionalString,
  requiredSelect,
  requiredString,
} from "./shared-validation";

export const diagnosaLanjutanFormSchema = z.object({
  diagnosaLanjutan: requiredString("Diagnosa lanjutan"),
  catatanTeknisi: optionalString(),
});

export const teknisiTambahJasaFormSchema = z.object({
  id_jasa_servis: requiredSelect("Jasa servis"),
});

export const teknisiTambahSparepartFormSchema = z.object({
  id_sparepart: requiredSelect("Sparepart"),
});

export const teknisiUpdateStatusFormSchema = z.object({
  status_servis: requiredSelect("Status servis"),
  estimasi_waktu: optionalDate("Estimasi waktu"),
});

export type DiagnosaLanjutanFormInput = z.infer<
  typeof diagnosaLanjutanFormSchema
>;

export type TeknisiTambahJasaFormInput = z.infer<
  typeof teknisiTambahJasaFormSchema
>;

export type TeknisiTambahSparepartFormInput = z.infer<
  typeof teknisiTambahSparepartFormSchema
>;

export type TeknisiUpdateStatusFormInput = z.infer<
  typeof teknisiUpdateStatusFormSchema
>;