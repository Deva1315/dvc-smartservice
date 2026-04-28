export type OwnerDashboardData = {
  tahun_berjalan: number;
  range: {
    start: string;
    end: string;
  };
  total_penjualan: number;
  total_servis: number;
  total_pendapatan: number;
  total_pendapatan_display: string;
  detail_pendapatan: {
    penjualan: number;
    penjualan_display: string;
    servis: number;
    servis_display: string;
  };
};

export type OwnerDashboardResponse = {
  success: boolean;
  message: string;
  data: OwnerDashboardData;
};

const BASE_URL = "/api/owner/dashboard";

export async function getOwnerDashboard() {
  const response = await fetch(BASE_URL, {
    method: "GET",
    cache: "no-store",
  });

  const result = (await response.json()) as OwnerDashboardResponse;

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data dashboard owner.");
  }

  return result;
}