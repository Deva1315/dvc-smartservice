export type TicketServisStatusVerifikasi =
  | "Menunggu Verifikasi"
  | "Terverifikasi"
  | "Ditolak"
  | string;

export type TicketServisStatusServis =
  | "Diterima"
  | "Diproses"
  | "Menunggu Sparepart"
  | "Selesai"
  | "Diambil"
  | "Dibatalkan"
  | string;

export type TicketServisPublicRow = {
  id: string;
  nomorTiket: string;
  sumberTiket: string;
  addressCust: string;
  namaCust: string;
  phoneCust: string;
  jenisPerangkat: string;
  merkPerangkat: string;
  keluhan: string;
  statusVerifikasi: TicketServisStatusVerifikasi;
  statusServis: TicketServisStatusServis;
  tanggalMasuk: Date;
  estimasiWaktu?: string | null;
  estimasiBiaya?: number | null;
};

export function formatStatusServisLabel(statusServis: string) {
  if (!statusServis) return "-";
  return statusServis;
}

export function buildNamaPerangkat(
  ticket: Pick<TicketServisPublicRow, "jenisPerangkat" | "merkPerangkat">
) {
  const jenis = ticket.jenisPerangkat?.trim();
  const merk = ticket.merkPerangkat?.trim();

  if (jenis && merk) {
    return `${jenis} - ${merk}`;
  }

  if (jenis) {
    return jenis;
  }

  if (merk) {
    return merk;
  }

  return "-";
}

export function formatRupiah(value?: number | null) {
  if (value === null || value === undefined) return null;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getStatusPillColors(status: string) {
  const normalizedStatus = status.trim().toLowerCase();

  if (normalizedStatus === "menunggu verifikasi") {
    return {
      bg: "#FFF3BF",
      text: "#E67700",
    };
  }

  if (normalizedStatus === "terverifikasi") {
    return {
      bg: "#D3F9D8",
      text: "#2B8A3E",
    };
  }

  if (normalizedStatus === "ditolak") {
    return {
      bg: "#FFE3E3",
      text: "#E03131",
    };
  }

  if (normalizedStatus === "diterima") {
    return {
      bg: "#E3FAFC",
      text: "#0C8599",
    };
  }

  if (normalizedStatus === "diproses") {
    return {
      bg: "#DCEEFF",
      text: "#1971C2",
    };
  }

  if (normalizedStatus === "menunggu sparepart") {
    return {
      bg: "#FFF3BF",
      text: "#E67700",
    };
  }

  if (normalizedStatus === "selesai") {
    return {
      bg: "#D3F9D8",
      text: "#2B8A3E",
    };
  }

  if (normalizedStatus === "diambil") {
    return {
      bg: "#E7F5FF",
      text: "#1864AB",
    };
  }

  if (normalizedStatus === "dibatalkan") {
    return {
      bg: "#FFE3E3",
      text: "#E03131",
    };
  }

  return {
    bg: "#E8D7B4",
    text: "#6E5A34",
  };
}

export function getRingkasanProgress(ticket: TicketServisPublicRow): string[] {
  const progress: string[] = [];

  progress.push(`Tiket servis ${ticket.nomorTiket} berhasil dibuat`);

  if (ticket.tanggalMasuk) {
    progress.push("Perangkat telah masuk ke sistem servis");
  }

  if (
    !ticket.statusVerifikasi ||
    ticket.statusVerifikasi === "Menunggu Verifikasi"
  ) {
    progress.push("Menunggu verifikasi admin");
    return progress;
  }

  if (ticket.statusVerifikasi === "Ditolak") {
    progress.push("Tiket servis ditolak saat proses verifikasi");
    return progress;
  }

  if (ticket.statusVerifikasi === "Terverifikasi") {
    progress.push("Tiket telah diverifikasi admin");
  }

  if (ticket.statusServis === "Diterima") {
    progress.push("Perangkat telah diterima untuk proses servis");
    progress.push("Menunggu penanganan teknisi");
  }

  if (ticket.statusServis === "Diproses") {
    progress.push("Perangkat sedang ditangani teknisi");
    progress.push("Pemeriksaan atau perbaikan sedang berlangsung");
  }

  if (ticket.statusServis === "Menunggu Sparepart") {
    progress.push("Pemeriksaan awal telah dilakukan");
    progress.push("Menunggu ketersediaan sparepart");
  }

  if (ticket.statusServis === "Selesai") {
    progress.push("Proses perbaikan telah selesai");
    progress.push("Perangkat siap diambil pelanggan");
  }

  if (ticket.statusServis === "Diambil") {
    progress.push("Proses perbaikan telah selesai");
    progress.push("Perangkat sudah diambil oleh pelanggan");
  }

  if (ticket.statusServis === "Dibatalkan") {
    progress.push("Proses servis dibatalkan");
  }

  if (ticket.estimasiWaktu && ticket.statusServis !== "Diambil") {
    progress.push(`Estimasi waktu pengerjaan: ${ticket.estimasiWaktu}`);
  }

  const biaya = formatRupiah(ticket.estimasiBiaya);
  if (biaya && ticket.statusServis !== "Diambil") {
    progress.push(`Estimasi biaya servis: ${biaya}`);
  }

  return progress;
}