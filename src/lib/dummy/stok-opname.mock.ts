export type StokOpnameItemType = "Barang" | "Sparepart";

export type StokOpnameUserOption = {
  value: string;
  label: string;
};

export type StokOpnameItemOption = {
  value: string;
  label: string;
  stokSistem: number;
};

export type StokOpnameDetailItem = {
  id: string;
  tipeItem: StokOpnameItemType;
  idBarang: string | null;
  idSparepart: string | null;
  namaItem: string | null;
  stokSistem: number;
  stokFisik: number;
  selisih: number;
  keterangan: string | null;
};

export type StokOpnameRow = {
  id: string;
  no: number;
  idUser: string;
  userName: string;
  tanggalOpname: string;
  selisihStock: number;
  keterangan: string | null;
  items: StokOpnameDetailItem[];
};

export const stokOpnameUserOptions: StokOpnameUserOption[] = [
  { value: "1", label: "Admin Gudang" },
  { value: "2", label: "Kevin" },
  { value: "3", label: "Martinus" },
];

export const stokOpnameBarangOptions: StokOpnameItemOption[] = [
  { value: "barang-1", label: "Laptop", stokSistem: 10 },
  { value: "barang-2", label: "Printer", stokSistem: 5 },
  { value: "barang-3", label: "Monitor Samsung", stokSistem: 7 },
];

export const stokOpnameSparepartOptions: StokOpnameItemOption[] = [
  { value: "sparepart-1", label: "Keyboard", stokSistem: 20 },
  { value: "sparepart-2", label: "SSD 512GB", stokSistem: 14 },
  { value: "sparepart-3", label: "RAM DDR4 8GB", stokSistem: 12 },
];

export function getItemOptionsByType(tipeItem: StokOpnameItemType) {
  return tipeItem === "Barang"
    ? stokOpnameBarangOptions
    : stokOpnameSparepartOptions;
}

export function getSelisih(stokSistem: number, stokFisik: number) {
  return stokFisik - stokSistem;
}

export function getTotalSelisihStock(items: StokOpnameDetailItem[]) {
  return items.reduce((total, item) => total + item.selisih, 0);
}

export function formatDisplayDate(dateString: string) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function createDetailItem(params: {
  id: string;
  tipeItem: StokOpnameItemType;
  idBarang?: string | null;
  idSparepart?: string | null;
  namaItem: string;
  stokSistem: number;
  stokFisik: number;
  keterangan?: string | null;
}): StokOpnameDetailItem {
  const selisih = getSelisih(params.stokSistem, params.stokFisik);

  return {
    id: params.id,
    tipeItem: params.tipeItem,
    idBarang: params.idBarang ?? null,
    idSparepart: params.idSparepart ?? null,
    namaItem: params.namaItem,
    stokSistem: params.stokSistem,
    stokFisik: params.stokFisik,
    selisih,
    keterangan: params.keterangan ?? null,
  };
}

const stokOpnameData1: StokOpnameDetailItem[] = [
  createDetailItem({
    id: "detail-1",
    tipeItem: "Barang",
    idBarang: "barang-1",
    namaItem: "Laptop",
    stokSistem: 10,
    stokFisik: 9,
    keterangan: "1 unit tidak ditemukan di gudang",
  }),
  createDetailItem({
    id: "detail-2",
    tipeItem: "Barang",
    idBarang: "barang-2",
    namaItem: "Printer",
    stokSistem: 5,
    stokFisik: 7,
    keterangan: "Ada 2 unit tambahan di rak belakang",
  }),
  createDetailItem({
    id: "detail-3",
    tipeItem: "Sparepart",
    idSparepart: "sparepart-1",
    namaItem: "Keyboard",
    stokSistem: 20,
    stokFisik: 14,
    keterangan: "Sebagian belum tercatat pengeluaran",
  }),
  createDetailItem({
    id: "detail-4",
    tipeItem: "Sparepart",
    idSparepart: "sparepart-2",
    namaItem: "SSD 512GB",
    stokSistem: 14,
    stokFisik: 14,
    keterangan: null,
  }),
];

const stokOpnameData2: StokOpnameDetailItem[] = [
  createDetailItem({
    id: "detail-5",
    tipeItem: "Sparepart",
    idSparepart: "sparepart-3",
    namaItem: "RAM DDR4 8GB",
    stokSistem: 12,
    stokFisik: 11,
    keterangan: "1 unit rusak",
  }),
  createDetailItem({
    id: "detail-6",
    tipeItem: "Barang",
    idBarang: "barang-3",
    namaItem: "Monitor Samsung",
    stokSistem: 7,
    stokFisik: 7,
    keterangan: null,
  }),
];

export const initialStokOpnameData: StokOpnameRow[] = [
  {
    id: "1",
    no: 1,
    idUser: "1",
    userName: "Admin Gudang",
    tanggalOpname: "2024-04-24",
    selisihStock: getTotalSelisihStock(stokOpnameData1),
    keterangan: "Opname akhir bulan gudang utama",
    items: stokOpnameData1,
  },
  {
    id: "2",
    no: 2,
    idUser: "2",
    userName: "Kevin",
    tanggalOpname: "2024-04-20",
    selisihStock: getTotalSelisihStock(stokOpnameData2),
    keterangan: "Pengecekan stok monitor dan RAM",
    items: stokOpnameData2,
  },
];