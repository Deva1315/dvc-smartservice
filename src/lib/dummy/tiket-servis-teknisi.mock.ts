export type TeknisiStatusVerifikasi = "Menunggu" | "Diterima" | "Ditolak";

export type TeknisiStatusServis =
  | "Belum_Diproses"
  | "Diproses"
  | "Menunggu_Sparepart"
  | "Selesai";

export type TeknisiRiwayatStatusItem = {
  id: string;
  label: string;
  date: string;
  highlighted?: boolean;
};

export type TeknisiJasaServisItem = {
  id: string;
  idJasaServis: string;
  nama: string;
  qty: number;
  harga: number;
};

export type TeknisiSparepartItem = {
  id: string;
  idSparepart: string;
  nama: string;
  qty: number;
  harga: number;
};

export type TeknisiTicketServisRecord = {
  id: string;
  idDropPoint: string | null;
  dropPointNama: string | null;
  idDiagnosaAi: string | null;
  idDiagnosaLanjutan: string | null;
  sumberTiket: string;
  guestSessionId: string | null;
  nomorTiket: string;
  alamatCust: string;
  namaCust: string;
  phoneCust: string;
  jenisPerangkat: string;
  merkPerangkat: string;
  keluhan: string;
  statusVerifikasi: TeknisiStatusVerifikasi;
  statusServis: TeknisiStatusServis;
  tanggalMasuk: string;
  estimasiWaktu: string | null;
  estimasiBiaya: number | null;

  referensiSolusiAwal: string | null;
  diagnosaLanjutan: string | null;
  catatanTeknisi: string | null;

  riwayatStatus: TeknisiRiwayatStatusItem[];
  jasaServis: TeknisiJasaServisItem[];
  sparepartDigunakan: TeknisiSparepartItem[];
};

export const statusServisOptions: {
  value: TeknisiStatusServis;
  label: string;
}[] = [
  { value: "Belum_Diproses", label: "Belum Diproses" },
  { value: "Diproses", label: "Diproses" },
  { value: "Menunggu_Sparepart", label: "Menunggu Sparepart" },
  { value: "Selesai", label: "Selesai" },
];

export const filterStatusServisOptions: {
  value: string;
  label: string;
}[] = statusServisOptions.map((item) => ({
  value: item.value,
  label: item.label,
}));

export const jasaServisMasterOptions: {
  value: string;
  label: string;
  harga: number;
}[] = [
  {
    value: "jasa-servis-1",
    label: "Servis pengecekan motherboard",
    harga: 150000,
  },
  {
    value: "jasa-servis-2",
    label: "Instal ulang sistem operasi",
    harga: 100000,
  },
  {
    value: "jasa-servis-3",
    label: "Pembersihan dan maintenance",
    harga: 80000,
  },
];

export const sparepartMasterOptions: {
  value: string;
  label: string;
  harga: number;
}[] = [
  {
    value: "sparepart-1",
    label: "IC Power",
    harga: 85000,
  },
  {
    value: "sparepart-2",
    label: "SSD 512GB",
    harga: 650000,
  },
  {
    value: "sparepart-3",
    label: "RAM DDR4 8GB",
    harga: 350000,
  },
];

export function getStatusServisLabel(status: TeknisiStatusServis) {
  switch (status) {
    case "Belum_Diproses":
      return "Belum Diproses";
    case "Diproses":
      return "Diproses";
    case "Menunggu_Sparepart":
      return "Menunggu Sparepart";
    case "Selesai":
      return "Selesai";
    default:
      return status;
  }
}

export function getStatusVerifikasiLabel(status: TeknisiStatusVerifikasi) {
  switch (status) {
    case "Menunggu":
      return "Menunggu";
    case "Diterima":
      return "Diterima";
    case "Ditolak":
      return "Ditolak";
    default:
      return status;
  }
}

export function getStatusServisColor(status: TeknisiStatusServis) {
  switch (status) {
    case "Belum_Diproses":
      return "gray";
    case "Diproses":
      return "yellow";
    case "Menunggu_Sparepart":
      return "blue";
    case "Selesai":
      return "green";
    default:
      return "gray";
  }
}

export function getStatusVerifikasiColor(status: TeknisiStatusVerifikasi) {
  switch (status) {
    case "Menunggu":
      return "orange";
    case "Diterima":
      return "green";
    case "Ditolak":
      return "red";
    default:
      return "gray";
  }
}

export function getPerangkatDisplay(
  ticket: Pick<TeknisiTicketServisRecord, "jenisPerangkat" | "merkPerangkat">
) {
  return `${ticket.jenisPerangkat} - ${ticket.merkPerangkat}`;
}

export function getDropPointDisplay(
  ticket: Pick<TeknisiTicketServisRecord, "idDropPoint" | "dropPointNama">
) {
  if (!ticket.idDropPoint) {
    return null;
  }

  if (!ticket.dropPointNama) {
    return ticket.idDropPoint;
  }

  return `${ticket.idDropPoint} - ${ticket.dropPointNama}`;
}

export function formatDisplayDate(dateString: string) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function getTotalJasa(items: TeknisiJasaServisItem[]) {
  return items.reduce((total, item) => total + item.qty * item.harga, 0);
}

export function getTotalSparepart(items: TeknisiSparepartItem[]) {
  return items.reduce((total, item) => total + item.qty * item.harga, 0);
}

export function getTotalEstimasi(
  jasaItems: TeknisiJasaServisItem[],
  sparepartItems: TeknisiSparepartItem[]
) {
  return getTotalJasa(jasaItems) + getTotalSparepart(sparepartItems);
}

export const teknisiTicketServisData: TeknisiTicketServisRecord[] = [
  {
    id: "1",
    idDropPoint: null,
    dropPointNama: null,
    idDiagnosaAi: "DAI-001",
    idDiagnosaLanjutan: "DL-001",
    sumberTiket: "Guest",
    guestSessionId: "guest-session-001",
    nomorTiket: "TSK-20240423-001",
    alamatCust: "Jl. Imam Bonjol No. 10, Denpasar",
    namaCust: "Anton Wijaya",
    phoneCust: "08123456789",
    jenisPerangkat: "Laptop",
    merkPerangkat: "Asus VivoBook A412U",
    keluhan: "Laptop mati total, tidak bisa dinyalakan sama sekali",
    statusVerifikasi: "Diterima",
    statusServis: "Diproses",
    tanggalMasuk: "2024-04-23",
    estimasiWaktu: "2-3 hari",
    estimasiBiaya: 255000,
    referensiSolusiAwal:
      "Berdasarkan gejala perangkat mati total, kemungkinan masalah terdapat pada adaptor, baterai, atau jalur power motherboard.",
    diagnosaLanjutan:
      "Setelah dilakukan pemeriksaan teknisi, ditemukan indikasi kerusakan pada bagian IC power motherboard.",
    catatanTeknisi:
      "Perlu penggantian IC power dan pengecekan ulang jalur charging setelah pemasangan.",
    riwayatStatus: [
      { id: "rs-1", label: "Servis Dibuat", date: "2024-04-23" },
      { id: "rs-2", label: "Menunggu Verifikasi", date: "2024-04-23" },
      { id: "rs-3", label: "Menunggu Teknisi", date: "2024-04-23" },
      {
        id: "rs-4",
        label: "Sedang Diproses",
        date: "2024-04-23",
        highlighted: true,
      },
    ],
    jasaServis: [
      {
        id: "jt-1",
        idJasaServis: "jasa-servis-1",
        nama: "Servis pengecekan motherboard",
        qty: 1,
        harga: 150000,
      },
    ],
    sparepartDigunakan: [
      {
        id: "st-1",
        idSparepart: "sparepart-1",
        nama: "IC Power",
        qty: 1,
        harga: 85000,
      },
    ],
  },
  {
    id: "2",
    idDropPoint: "DP-001",
    dropPointNama: "Drop Point Jimbaran",
    idDiagnosaAi: "DAI-002",
    idDiagnosaLanjutan: null,
    sumberTiket: "Admin Penjualan",
    guestSessionId: null,
    nomorTiket: "TSK-20240422-002",
    alamatCust: "Jl. Gatot Subroto No. 20, Denpasar",
    namaCust: "Bagus Raharja",
    phoneCust: "08134567890",
    jenisPerangkat: "CPU",
    merkPerangkat: "Dell Vostro 260",
    keluhan: "Komputer sering restart sendiri saat dipakai",
    statusVerifikasi: "Diterima",
    statusServis: "Menunggu_Sparepart",
    tanggalMasuk: "2024-04-22",
    estimasiWaktu: "3 hari",
    estimasiBiaya: 450000,
    referensiSolusiAwal:
      "Kemungkinan terjadi masalah pada power supply, RAM, atau suhu prosesor yang terlalu tinggi.",
    diagnosaLanjutan: null,
    catatanTeknisi: null,
    riwayatStatus: [
      { id: "rs-5", label: "Servis Dibuat", date: "2024-04-22" },
      { id: "rs-6", label: "Menunggu Verifikasi", date: "2024-04-22" },
      { id: "rs-7", label: "Menunggu Teknisi", date: "2024-04-22" },
      {
        id: "rs-8",
        label: "Menunggu Sparepart",
        date: "2024-04-22",
        highlighted: true,
      },
    ],
    jasaServis: [],
    sparepartDigunakan: [],
  },
  {
    id: "3",
    idDropPoint: null,
    dropPointNama: null,
    idDiagnosaAi: null,
    idDiagnosaLanjutan: null,
    sumberTiket: "Guest",
    guestSessionId: "guest-session-003",
    nomorTiket: "TSK-20240421-003",
    alamatCust: "Jl. Hayam Wuruk No. 5, Denpasar",
    namaCust: "Siti Andika",
    phoneCust: "08212345678",
    jenisPerangkat: "CPU",
    merkPerangkat: "Dell Vostro 260",
    keluhan: "CPU tidak tampil gambar di monitor",
    statusVerifikasi: "Diterima",
    statusServis: "Menunggu_Sparepart",
    tanggalMasuk: "2024-04-21",
    estimasiWaktu: "2 hari",
    estimasiBiaya: 350000,
    referensiSolusiAwal:
      "Kemungkinan ada masalah pada RAM, VGA onboard, kabel display, atau monitor.",
    diagnosaLanjutan: null,
    catatanTeknisi: null,
    riwayatStatus: [
      { id: "rs-9", label: "Servis Dibuat", date: "2024-04-21" },
      {
        id: "rs-10",
        label: "Menunggu Sparepart",
        date: "2024-04-21",
        highlighted: true,
      },
    ],
    jasaServis: [],
    sparepartDigunakan: [],
  },
  {
    id: "4",
    idDropPoint: null,
    dropPointNama: null,
    idDiagnosaAi: "DAI-004",
    idDiagnosaLanjutan: "DL-004",
    sumberTiket: "Guest",
    guestSessionId: "guest-session-004",
    nomorTiket: "TSK-20240420-004",
    alamatCust: "Jl. Tukad Yeh Aya No. 11, Denpasar",
    namaCust: "Andi Saputra",
    phoneCust: "08223456789",
    jenisPerangkat: "Laptop",
    merkPerangkat: "Lenovo IdeaPad 3",
    keluhan: "Laptop lemot dan sering hang",
    statusVerifikasi: "Diterima",
    statusServis: "Selesai",
    tanggalMasuk: "2024-04-20",
    estimasiWaktu: "1 hari",
    estimasiBiaya: 180000,
    referensiSolusiAwal:
      "Kemungkinan terdapat masalah pada storage, suhu perangkat, atau sistem operasi.",
    diagnosaLanjutan:
      "Hasil pemeriksaan menunjukkan sistem operasi mengalami corrupt file dan storage memerlukan optimasi ulang.",
    catatanTeknisi: "Sudah dilakukan instal ulang dan pengujian normal.",
    riwayatStatus: [
      { id: "rs-11", label: "Servis Dibuat", date: "2024-04-20" },
      { id: "rs-12", label: "Diproses", date: "2024-04-20" },
      {
        id: "rs-13",
        label: "Selesai",
        date: "2024-04-20",
        highlighted: true,
      },
    ],
    jasaServis: [
      {
        id: "jt-2",
        idJasaServis: "jasa-servis-2",
        nama: "Instal ulang sistem operasi",
        qty: 1,
        harga: 100000,
      },
      {
        id: "jt-3",
        idJasaServis: "jasa-servis-3",
        nama: "Pembersihan dan maintenance",
        qty: 1,
        harga: 80000,
      },
    ],
    sparepartDigunakan: [],
  },
];

export function findTeknisiTicketById(id: string) {
  return teknisiTicketServisData.find((item) => item.id === id) ?? null;
}

export function findTeknisiTicketByNomorTiket(nomorTiket: string) {
  return (
    teknisiTicketServisData.find(
      (item) => item.nomorTiket === nomorTiket
    ) ?? null
  );
}