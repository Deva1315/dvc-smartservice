export type AdminPenjualanDropPointApiItem = {
  id: string;
  nama_drop_point: string;
  alamat: string;
  phone: string | null;
  jam_operasional: string | null;
};

export type GetAdminPenjualanDropPointResponse =
  | {
      success: true;
      message: string;
      data: AdminPenjualanDropPointApiItem[];
    }
  | {
      success: false;
      message: string;
    };

const BASE_URL = "/api/admin-penjualan/drop-point";

export async function getAdminPenjualanDropPointList(params?: {
  search?: string;
}): Promise<GetAdminPenjualanDropPointResponse> {
  const searchParams = new URLSearchParams();

  if (params?.search) {
    searchParams.set("search", params.search);
  }

  const url = searchParams.toString()
    ? `${BASE_URL}?${searchParams.toString()}`
    : BASE_URL;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: result?.message ?? "Gagal mengambil data Drop Point.",
    };
  }

  return result as GetAdminPenjualanDropPointResponse;
}