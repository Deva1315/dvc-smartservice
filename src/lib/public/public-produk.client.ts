export type PublicKategoriProduk = {
  id: string;
  nama_kategori: string;
  deskripsi: string | null;
};

export type PublicProdukItem = {
  id: string;
  id_kategori: string;
  slug: string;
  nama_barang: string;
  kode_barang: string;
  merk_barang: string | null;
  deskripsi: string | null;
  harga: string;
  stock: string;
  gambar: string | null;
  kategori_barang?: PublicKategoriProduk | null;
};

export type PublicProdukPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type GetPublicProdukListResponse =
  | {
      success: true;
      message: string;
      produk: PublicProdukItem[];
      kategori: PublicKategoriProduk[];
      pagination: PublicProdukPagination;
    }
  | {
      success: false;
      message: string;
    };

export type GetPublicProdukDetailResponse =
  | {
      success: true;
      message: string;
      produk: PublicProdukItem;
    }
  | {
      success: false;
      message: string;
    };

export async function getPublicProdukListRequest(params?: {
  search?: string;
  id_kategori?: string;
  page?: number;
  limit?: number;
}): Promise<GetPublicProdukListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.search) {
    searchParams.set("search", params.search);
  }

  if (params?.id_kategori) {
    searchParams.set("id_kategori", params.id_kategori);
  }

  if (params?.page) {
    searchParams.set("page", String(params.page));
  }

  if (params?.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const queryString = searchParams.toString();
  const url = queryString
    ? `/api/public/produk?${queryString}`
    : "/api/public/produk";

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal mengambil data produk.",
    };
  }

  return data as GetPublicProdukListResponse;
}

export async function getPublicProdukDetailRequest(
  slug: string
): Promise<GetPublicProdukDetailResponse> {
  const response = await fetch(
    `/api/public/produk/${encodeURIComponent(slug)}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal mengambil detail produk.",
    };
  }

  return data as GetPublicProdukDetailResponse;
}