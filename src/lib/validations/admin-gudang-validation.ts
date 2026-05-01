import { z } from "zod";
import {
  nonNegativeInteger,
  optionalString,
  positiveInteger,
  positiveNumber,
  requiredDate,
  requiredSelect,
  requiredString,
} from "./shared-validation";

export const barangFormSchema = z.object({
  nama: requiredString("Nama barang", 150),
  kode: requiredString("Kode barang", 100),
  merk: requiredString("Merk barang", 150),
  stok: positiveInteger("Stok"),
  harga: positiveNumber("Harga"),
  kategori: requiredSelect("Kategori"),
  deskripsi: optionalString(),
  fotoBase64: optionalString(),
});

export const sparepartFormSchema = z.object({
  nama: requiredString("Nama sparepart", 150),
  kode: requiredString("Kode sparepart", 100),
  merk: requiredString("Merk sparepart", 150),
  stok: positiveInteger("Stok"),
  harga: positiveNumber("Harga"),
  supplier: requiredSelect("Supplier"),
  deskripsi: optionalString(),
  fotoBase64: optionalString(),
});

export const kategoriBarangFormSchema = z.object({
  nama: requiredString("Nama kategori", 150),
  deskripsi: optionalString(),
});

export const suppliersFormSchema = z.object({
  nama: requiredString("Nama supplier", 150),
  address: requiredString("Alamat", 200),
  phone: requiredString("No HP"),
});

export const inventoryDetailItemSchema = z.object({
  id: requiredString("ID item"),
  tipeItem: requiredSelect("Tipe item").refine(
    (value) => value === "Barang" || value === "Sparepart",
    "Tipe item tidak valid."
  ),
  namaItem: requiredSelect("Nama item"),
  jumlah: positiveInteger("Jumlah"),
});

export const barangMasukFormSchema = z.object({
  tanggalMutasi: requiredDate("Tanggal mutasi"),
  supplier: requiredSelect("Supplier"),
  keterangan: optionalString(),
  detailItems: z
    .array(inventoryDetailItemSchema)
    .min(1, "Detail barang masuk wajib diisi minimal 1 item."),
});

export const barangKeluarFormSchema = z.object({
  tanggalKeluar: requiredDate("Tanggal keluar"),
  tujuan: requiredSelect("Tujuan"),
  keterangan: optionalString(),
  detailItems: z
    .array(inventoryDetailItemSchema)
    .min(1, "Detail barang keluar wajib diisi minimal 1 item."),
});

export const stokOpnameDetailItemSchema = z
  .object({
    id: requiredString("ID item"),
    tipeItem: requiredSelect("Tipe item").refine(
      (value) => value === "Barang" || value === "Sparepart",
      "Tipe item tidak valid."
    ),
    idBarang: z.string().trim().nullable().optional(),
    idSparepart: z.string().trim().nullable().optional(),
    namaItem: z.string().trim().nullable().optional(),
    stokSistem: nonNegativeInteger("Stok sistem"),
    stokFisik: nonNegativeInteger("Stok fisik"),
    selisih: nonNegativeInteger("Selisih"),
    keterangan: optionalString(),
  })
  .refine(
    (value) => {
      if (value.tipeItem === "Barang") {
        return Boolean(value.idBarang);
      }

      if (value.tipeItem === "Sparepart") {
        return Boolean(value.idSparepart);
      }

      return false;
    },
    {
      message: "Barang atau sparepart wajib dipilih.",
      path: ["namaItem"],
    }
  );

export const stokOpnameFormSchema = z.object({
  tanggalOpname: requiredDate("Tanggal opname"),
  keteranganHeader: optionalString(),
  detailItems: z
    .array(stokOpnameDetailItemSchema)
    .min(1, "Detail stok opname wajib diisi minimal 1 item."),
});

export type BarangFormInput = z.infer<typeof barangFormSchema>;
export type SparepartFormInput = z.infer<typeof sparepartFormSchema>;
export type KategoriBarangFormInput = z.infer<typeof kategoriBarangFormSchema>;
export type SuppliersFormInput = z.infer<typeof suppliersFormSchema>;
export type BarangMasukFormInput = z.infer<typeof barangMasukFormSchema>;
export type BarangKeluarFormInput = z.infer<typeof barangKeluarFormSchema>;
export type StokOpnameFormInput = z.infer<typeof stokOpnameFormSchema>;