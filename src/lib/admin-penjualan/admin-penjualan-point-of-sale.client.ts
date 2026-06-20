export type POSMetodePembayaran = "Cash";

export type POSBarangApiItem = {
  id: string;
  id_kategori: string;
  nama_barang: string;
  kode_barang: string;
  merk_barang: string | null;
  deskripsi: string | null;
  harga: string | number;
  stock: string | number;
  gambar: string | null;
  kategori_barang?: {
    id: string;
    nama_kategori: string;
    deskripsi: string | null;
  } | null;
};

export type POSDetailTransaksiApiItem = {
  id: string;
  id_transaksi: string;
  id_barang: string;
  jumlah: string | number;
  harga_satuan: string | number;
  sub_total: string | number;
  barang: POSBarangApiItem;
};

export type POSTransaksiApiItem = {
  id: string;
  nomor_transaksi: string;
  id_user: string;
  nama_cust: string;
  tanggal_transaksi: string;
  subtotal_transaksi: string | number;
  diskon_transaksi: string | number;
  total_transaksi: string | number;
  nominal_bayar: string | number;
  kembalian: string | number;
  metode_transaksi: POSMetodePembayaran;
  status_transaksi: "Belum_Bayar" | "Dibayar" | "Dibatalkan";
  subtotal: number;
  diskon: number;
  total: number;
  nominal_bayar_number: number;
  kembalian_number: number;

  admin: {
    id: string;
    nama: string;
    email: string;
  };

  detail_transaksi: POSDetailTransaksiApiItem[];
};

export type CreatePOSTransaksiPayload = {
  id_transaksi?: string;
  nama_cust?: string;
  metode_transaksi: POSMetodePembayaran;
  diskon_transaksi?: number;
  nominal_bayar?: number;
  detail_items: {
    id_barang: string;
    jumlah: number;
  }[];
};

const BASE_URL = "/api/admin-penjualan/point-of-sale";

export async function getPOSBarang(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.set("search", params.search);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const url = searchParams.toString()
    ? `${BASE_URL}/barang?${searchParams.toString()}`
    : `${BASE_URL}/barang`;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data barang POS");
  }

  return result;
}

export async function getPOSTransaksi(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.set("search", params.search);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const url = searchParams.toString()
    ? `${BASE_URL}/transaksi?${searchParams.toString()}`
    : `${BASE_URL}/transaksi`;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data transaksi POS");
  }

  return result;
}

export async function buatDraftPOSTransaksi() {
  const response = await fetch(`${BASE_URL}/transaksi`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "create_draft",
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal membuat draft transaksi POS");
  }

  return result;
}

export async function simpanPOSTransaksi(payload: CreatePOSTransaksiPayload) {
  const response = await fetch(`${BASE_URL}/transaksi`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menyimpan transaksi POS");
  }

  return result;
}

export async function bayarPOSTransaksi(
  idTransaksi: string,
  payload: Omit<CreatePOSTransaksiPayload, "id_transaksi">
) {
  return simpanPOSTransaksi({
    ...payload,
    id_transaksi: idTransaksi,
  });
}

export async function batalPOSTransaksi(id: string) {
  const response = await fetch(
    `${BASE_URL}/transaksi/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "cancel",
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal membatalkan transaksi POS");
  }

  return result;
}

export async function getDetailPOSTransaksi(id: string) {
  const response = await fetch(
    `${BASE_URL}/transaksi/${encodeURIComponent(id)}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil detail transaksi POS");
  }

  return result;
}