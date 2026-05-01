import { z } from "zod";
import {
  nonNegativeNumber,
  optionalString,
  positiveInteger,
  positiveNumber,
  requiredDate,
  requiredPhone,
  requiredSelect,
  requiredString,
} from "./shared-validation";

export const adminPenjualanTiketServisFormSchema = z
  .object({
    nomor_tiket: requiredString("Nomor tiket", 100),
    tanggal_masuk: requiredDate("Tanggal masuk"),
    nama_cust: requiredString("Nama customer", 150),
    phone_cust: requiredPhone("No HP"),
    alamat_cust: optionalString(),
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

export const tiketVerifikasiTerimaFormSchema = z.object({
  id_teknisi: requiredSelect("Teknisi"),
});

export const tiketVerifikasiTolakFormSchema = z.object({
  alasan_penolakan: requiredString("Alasan penolakan"),
});

export const jasaServisFormSchema = z.object({
  nama: requiredString("Nama jasa servis", 150),
  harga: positiveNumber("Harga"),
  deskripsi: optionalString(),
  jamOperasional: optionalString(100),
});

export const garansiFormSchema = z
  .object({
    nomorTiket: requiredSelect("No tiket"),
    periodeHari: positiveInteger("Periode garansi"),
    tanggalMulai: requiredDate("Tanggal mulai"),
    tanggalBerakhir: requiredDate("Tanggal berakhir"),
  })
  .refine(
    (value) => {
      const mulai =
        value.tanggalMulai instanceof Date
          ? value.tanggalMulai.getTime()
          : new Date(value.tanggalMulai).getTime();

      const akhir =
        value.tanggalBerakhir instanceof Date
          ? value.tanggalBerakhir.getTime()
          : new Date(value.tanggalBerakhir).getTime();

      return akhir >= mulai;
    },
    {
      message: "Tanggal berakhir tidak boleh lebih awal dari tanggal mulai.",
      path: ["tanggalBerakhir"],
    }
  );

export const posCheckoutFormSchema = z
  .object({
    namaCustomer: requiredString("Nama customer", 150),
    metodePembayaran: requiredSelect("Metode pembayaran"),
    diskon: nonNegativeNumber("Diskon"),
    nominalBayar: positiveNumber("Nominal bayar"),
    total: nonNegativeNumber("Total transaksi"),
    cartLength: positiveInteger("Jumlah item"),
  })
  .refine((value) => value.nominalBayar >= value.total, {
    message: "Nominal bayar tidak boleh kurang dari total transaksi.",
    path: ["nominalBayar"],
  });

export type AdminPenjualanTiketServisFormInput = z.infer<
  typeof adminPenjualanTiketServisFormSchema
>;
export type TiketVerifikasiTerimaFormInput = z.infer<
  typeof tiketVerifikasiTerimaFormSchema
>;
export type TiketVerifikasiTolakFormInput = z.infer<
  typeof tiketVerifikasiTolakFormSchema
>;
export type JasaServisFormInput = z.infer<typeof jasaServisFormSchema>;
export type GaransiFormInput = z.infer<typeof garansiFormSchema>;
export type PosCheckoutFormInput = z.infer<typeof posCheckoutFormSchema>;