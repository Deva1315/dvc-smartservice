export type PeriodeLaporan = "harian" | "bulanan" | "tahunan";

export type OwnerLaporanJenis =
  | "penjualan"
  | "servis"
  | "stock-barang"
  | "stock-sparepart"
  | "pendapatan-gabungan";

export type OwnerLaporanApiResponse<
  TData = unknown,
  TSummary = Record<string, unknown>
> = {
  success: boolean;
  message: string;
  jenis: OwnerLaporanJenis;
  periode: PeriodeLaporan;
  tanggal: string;
  range: {
    start: string;
    end: string;
  };
  data: TData[];
  summary: TSummary;
};

const BASE_URL = "/api/owner/laporan";

export async function getOwnerLaporan<
  TData = unknown,
  TSummary = Record<string, unknown>
>(
  jenis: OwnerLaporanJenis,
  params?: {
    periode?: PeriodeLaporan;
    tanggal?: string;
  }
): Promise<OwnerLaporanApiResponse<TData, TSummary>> {
  const searchParams = new URLSearchParams();

  if (params?.periode) {
    searchParams.set("periode", params.periode);
  }

  if (params?.tanggal) {
    searchParams.set("tanggal", params.tanggal);
  }

  const url = `${BASE_URL}/${jenis}${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data laporan.");
  }

  return result;
}