export type OwnerPegawaiRow = {
  id: string;
  nama: string;
  email: string;
  roleId: string;
  roleName: string;
  address: string | null;
  phone: string | null;
  photoProfilePath: string | null;
};

export type OwnerPegawaiRoleOption = {
  value: string;
  label: string;
};

export type GetOwnerPegawaiListResponse =
  | {
      success: true;
      message: string;
      employees: OwnerPegawaiRow[];
      availableRoles: OwnerPegawaiRoleOption[];
    }
  | {
      success: false;
      message: string;
    };

export type CreateOwnerPegawaiResponse =
  | {
      success: true;
      message: string;
      employee: OwnerPegawaiRow;
    }
  | {
      success: false;
      message: string;
    };

export type UpdateOwnerPegawaiResponse =
  | {
      success: true;
      message: string;
      employee: OwnerPegawaiRow;
    }
  | {
      success: false;
      message: string;
    };

export type DeleteOwnerPegawaiResponse =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message: string;
    };

export async function getOwnerPegawaiListRequest(): Promise<GetOwnerPegawaiListResponse> {
  const response = await fetch("/api/owner/pegawai", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal mengambil data pegawai.",
    };
  }

  return data as GetOwnerPegawaiListResponse;
}

export async function createOwnerPegawaiRequest(
  formData: FormData
): Promise<CreateOwnerPegawaiResponse> {
  const response = await fetch("/api/owner/pegawai", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal menambah pegawai.",
    };
  }

  return data as CreateOwnerPegawaiResponse;
}

export async function updateOwnerPegawaiRequest(
  id: string,
  formData: FormData
): Promise<UpdateOwnerPegawaiResponse> {
  const response = await fetch(`/api/owner/pegawai/${id}`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal memperbarui pegawai.",
    };
  }

  return data as UpdateOwnerPegawaiResponse;
}

export async function deleteOwnerPegawaiRequest(
  id: string
): Promise<DeleteOwnerPegawaiResponse> {
  const response = await fetch(`/api/owner/pegawai/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal menghapus pegawai.",
    };
  }

  return data as DeleteOwnerPegawaiResponse;
}