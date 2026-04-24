export type AdminPenjualanProfileUser = {
  id: string;
  nama: string;
  email: string;
  roleId: string;
  roleName: string;
  address: string | null;
  phone: string | null;
  photoProfilePath: string | null;
};

export type GetAdminPenjualanProfileResponse =
  | {
      success: true;
      message: string;
      user: AdminPenjualanProfileUser;
    }
  | {
      success: false;
      message: string;
    };

export async function getAdminPenjualanProfileRequest(): Promise<GetAdminPenjualanProfileResponse> {
  const response = await fetch("/api/admin-penjualan/profile", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal mengambil profile admin penjualan.",
    };
  }

  return data as GetAdminPenjualanProfileResponse;
}
