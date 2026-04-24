export type TeknisiProfileUser = {
  id: string;
  nama: string;
  email: string;
  roleId: string;
  roleName: string;
  address: string | null;
  phone: string | null;
  photoProfilePath: string | null;
};

export type GetTeknisiProfileResponse =
  | {
      success: true;
      message: string;
      user: TeknisiProfileUser;
    }
  | {
      success: false;
      message: string;
    };

export async function getTeknisiProfileRequest(): Promise<GetTeknisiProfileResponse> {
  const response = await fetch("/api/teknisi/profile", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal mengambil profile teknisi.",
    };
  }

  return data as GetTeknisiProfileResponse;
}
