export type DummyJasaServis = {
  id: bigint;
  nama_jasa_servis: string;
  deskripsi: string | null;
  harga: number;
  jam_operasional: string | null;
};

export const dummyJasaServis: DummyJasaServis[] = [
  {
    id: BigInt(1),
    nama_jasa_servis: "Perbaikan Laptop",
    deskripsi: "Perbaikan berbagai masalah pada laptop",
    harga: 150000,
    jam_operasional: "09:00 - 17:00",
  },
  {
    id: BigInt(2),
    nama_jasa_servis: "Instalasi Ulang OS",
    deskripsi: "Instalasi ulang sistem operasi, driver, dan aplikasi",
    harga: 100000,
    jam_operasional: "08:00 - 16:00",
  },
  {
    id: BigInt(3),
    nama_jasa_servis: "Pembersihan Komputer",
    deskripsi: "Pembersihan komputer dari debu dan kotoran",
    harga: 75000,
    jam_operasional: "09:00 - 15:00",
  },
  {
    id: BigInt(4),
    nama_jasa_servis: "Upgrade Hardware",
    deskripsi: "Upgrade RAM, SSD, atau hardware lain",
    harga: 200000,
    jam_operasional: "10:00 - 18:00",
  },
];