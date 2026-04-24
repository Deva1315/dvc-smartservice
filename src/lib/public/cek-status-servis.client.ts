import type { TicketServisPublicRow } from "@/utils/public/cek-status-servis.utils";

export type GetCekStatusServisResponse =
  | {
      success: true;
      message: string;
      ticket: TicketServisPublicRow;
    }
  | {
      success: false;
      message: string;
    };

export async function getCekStatusServisRequest(
  nomorTiket: string
): Promise<GetCekStatusServisResponse> {
  const normalizedNomorTiket = nomorTiket.trim().toUpperCase();

  const response = await fetch(
    `/api/public/cek-status-servis?nomor_tiket=${encodeURIComponent(
      normalizedNomorTiket
    )}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal mengambil status servis.",
    };
  }

  return data as GetCekStatusServisResponse;
}