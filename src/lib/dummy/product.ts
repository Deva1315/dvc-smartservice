export type DummyKategoriBarang = {
  id: bigint;
  nama_kategori: string;
  deskripsi: string | null;
};

export type DummyBarang = {
  id: bigint;
  id_kategori: bigint;
  nama_barang: string;
  kode_barang: string;
  merk_barang: string | null;
  deskripsi: string | null;
  harga: number; // representasi decimal di frontend
  stock: bigint;
  gambar: string | null;
};

export const dummyKategoriBarang: DummyKategoriBarang[] = [
  {
    id: BigInt(1),
    nama_kategori: "Laptop",
    deskripsi: "Kategori laptop",
  },
  {
    id: BigInt(2),
    nama_kategori: "PC",
    deskripsi: "Kategori PC",
  },
  {
    id: BigInt(3),
    nama_kategori: "Monitor",
    deskripsi: "Kategori monitor",
  },
  {
    id: BigInt(4),
    nama_kategori: "Printer",
    deskripsi: "Kategori printer",
  },
  {
    id: BigInt(5),
    nama_kategori: "Aksesoris",
    deskripsi: "Kategori aksesoris",
  },
];

export const dummyBarang: DummyBarang[] = [
  {
    id: BigInt(1),
    id_kategori: BigInt(1),
    nama_barang: "Laptop Acer Nitro 5",
    kode_barang: "BRG-LAP-001",
    merk_barang: "Acer",
    deskripsi: "Laptop gaming performa tinggi untuk kebutuhan kerja dan gaming.",
    harga: 13000000,
    stock: BigInt(5),
    gambar: "/images/laptop.png",
  },
  {
    id: BigInt(2),
    id_kategori: BigInt(2),
    nama_barang: "CPU Asus Gaming",
    kode_barang: "BRG-PC-001",
    merk_barang: "Asus",
    deskripsi: "PC gaming dengan performa tinggi untuk desain, editing, dan gaming.",
    harga: 40000000,
    stock: BigInt(3),
    gambar: "/images/cpu.png",
  },
  {
    id: BigInt(3),
    id_kategori: BigInt(3),
    nama_barang: "Monitor MSI 24 Inch",
    kode_barang: "BRG-MON-001",
    merk_barang: "MSI",
    deskripsi: "Monitor full HD dengan tampilan jernih untuk kerja dan hiburan.",
    harga: 3500000,
    stock: BigInt(7),
    gambar: "/images/monitor.png",
  },
  {
    id: BigInt(4),
    id_kategori: BigInt(4),
    nama_barang: "Printer Epson Scanner",
    kode_barang: "BRG-PRN-001",
    merk_barang: "Epson",
    deskripsi: "Printer multifungsi untuk kebutuhan cetak dan scan.",
    harga: 5000000,
    stock: BigInt(4),
    gambar: "/images/printer.png",
  },
  {
    id: BigInt(5),
    id_kategori: BigInt(5),
    nama_barang: "Mouse Razer Lancehead",
    kode_barang: "BRG-AKS-001",
    merk_barang: "Razer",
    deskripsi: "Mouse gaming ergonomis dan responsif.",
    harga: 5000000,
    stock: BigInt(10),
    gambar: "/images/mouse.png",
  },
  {
    id: BigInt(6),
    id_kategori: BigInt(1),
    nama_barang: "Laptop Asus Vivobook",
    kode_barang: "BRG-LAP-002",
    merk_barang: "Asus",
    deskripsi: "Laptop ringan untuk kerja, kuliah, dan penggunaan harian.",
    harga: 11500000,
    stock: BigInt(6),
    gambar: "/images/laptop.png",
  },
  {
    id: BigInt(7),
    id_kategori: BigInt(2),
    nama_barang: "PC MSI Creator",
    kode_barang: "BRG-PC-002",
    merk_barang: "MSI",
    deskripsi: "PC untuk editing, desain, dan produktivitas profesional.",
    harga: 32000000,
    stock: BigInt(2),
    gambar: "/images/desktop.png",
  },
  {
    id: BigInt(8),
    id_kategori: BigInt(3),
    nama_barang: "Monitor LG Ultrawide",
    kode_barang: "BRG-MON-002",
    merk_barang: "LG",
    deskripsi: "Monitor ultrawide untuk multitasking lebih nyaman.",
    harga: 4800000,
    stock: BigInt(5),
    gambar: "/images/monitor.png",
  },
  {
    id: BigInt(9),
    id_kategori: BigInt(4),
    nama_barang: "Printer Canon Pixma",
    kode_barang: "BRG-PRN-002",
    merk_barang: "Canon",
    deskripsi: "Printer rumah dan kantor dengan kualitas cetak yang baik.",
    harga: 4200000,
    stock: BigInt(8),
    gambar: "/images/printer.png",
  },
  {
    id: BigInt(10),
    id_kategori: BigInt(5),
    nama_barang: "Keyboard Logitech Mechanical",
    kode_barang: "BRG-AKS-002",
    merk_barang: "Logitech",
    deskripsi: "Keyboard mekanikal nyaman untuk kerja dan gaming.",
    harga: 1800000,
    stock: BigInt(12),
    gambar: "/images/keyboard.png",
  },
];