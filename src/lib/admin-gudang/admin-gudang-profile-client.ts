export type AdminGudangProfileUser = {
  id: string;
  nama: string;
  email: string;
  roleId: string;
  roleName: string;
  address: string | null;
  phone: string | null;
  photoProfilePath: string | null;
};

export type GetAdminGudangProfileResponse =
  | {
      success: true;
      message: string;
      user: AdminGudangProfileUser;
    }
  | {
      success: false;
      message: string;
    };

export async function getAdminGudangProfileRequest(): Promise<GetAdminGudangProfileResponse> {
  const response = await fetch("/api/admin-gudang/profile", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal mengambil profile admin gudang.",
    };
  }

  return data as GetAdminGudangProfileResponse;
}
