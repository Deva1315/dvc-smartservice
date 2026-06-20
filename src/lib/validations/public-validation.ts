import { z } from "zod";
import {
  requiredDate,
  requiredPhone,
  requiredSelect,
  requiredString,
} from "./shared-validation";

export const publicTiketServisFormSchema = z
  .object({
    nomor_tiket: requiredString("Nomor tiket", 100),
    id_diagnosa_ai: z.string().trim().nullable().optional(),
    diagnosa_awal_kerusakan: z.string().trim().nullable().optional(),
    tanggal_masuk: requiredDate("Tanggal masuk"),
    nama_cust: requiredString("Nama customer", 150),
    phone_cust: requiredPhone("No HP"),
    alamat_cust: requiredString("Alamat customer", 200),
    jenis_perangkat: requiredSelect("Jenis perangkat"),
    merk_perangkat: requiredString("Merk perangkat", 150),
    keluhan: requiredString("Keluhan"),
    gunakan_drop_point: requiredSelect("Pilihan drop point").refine(
      (value) => value === "ya" || value === "tidak",
      "Pilihan drop point tidak valid."
    ),
    drop_point_id: z.string().trim().nullable().optional(),
  })
  .refine(
    (value) =>
      value.gunakan_drop_point === "tidak" || Boolean(value.alamat_cust),
    {
      message:
        "Alamat customer wajib diisi untuk menghitung jarak drop point terdekat.",
      path: ["alamat_cust"],
    }
  )
  .refine(
    (value) =>
      value.gunakan_drop_point === "tidak" || Boolean(value.drop_point_id),
    {
      message: "Drop point wajib dipilih.",
      path: ["drop_point_id"],
    }
  );

export type PublicTiketServisFormInput = z.infer<
  typeof publicTiketServisFormSchema
>;