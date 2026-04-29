export type PublicJasaServisItem = {
  id: string;
  nama_jasa_servis: string;
  deskripsi: string | null;
  harga: string;
  jam_operasional: string | null;
};

export type PublicJasaServisPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type GetPublicJasaServisListResponse =
  | {
      success: true;
      message: string;
      jasaServis: PublicJasaServisItem[];
      pagination: PublicJasaServisPagination;
    }
  | {
      success: false;
      message: string;
    };

export async function getPublicJasaServisListRequest(params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<GetPublicJasaServisListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.search) {
    searchParams.set("search", params.search);
  }

  if (params?.page) {
    searchParams.set("page", String(params.page));
  }

  if (params?.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const queryString = searchParams.toString();
  const url = queryString
    ? `/api/public/jasa-servis?${queryString}`
    : "/api/public/jasa-servis";

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal mengambil data layanan servis.",
    };
  }

  return data as GetPublicJasaServisListResponse;
}