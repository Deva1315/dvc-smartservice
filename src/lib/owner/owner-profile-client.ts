export type OwnerProfileUser = {
  id: string;
  nama: string;
  email: string;
  roleId: string;
  roleName: string;
  address: string | null;
  phone: string | null;
  photoProfilePath: string | null;
};

export type GetOwnerProfileResponse =
  | {
      success: true;
      message: string;
      user: OwnerProfileUser;
    }
  | {
      success: false;
      message: string;
    };

export type UpdateOwnerProfileResponse =
  | {
      success: true;
      message: string;
      user: OwnerProfileUser;
    }
  | {
      success: false;
      message: string;
    };

export async function getOwnerProfileRequest(): Promise<GetOwnerProfileResponse> {
  const response = await fetch("/api/owner/profile", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal mengambil profile owner.",
    };
  }

  return data as GetOwnerProfileResponse;
}

export async function updateOwnerProfileRequest(
  formData: FormData
): Promise<UpdateOwnerProfileResponse> {
  const response = await fetch("/api/owner/profile", {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal memperbarui profile owner.",
    };
  }

  return data as UpdateOwnerProfileResponse;
}