export type OwnerJabatanRow = {
  id: string;
  nama_roles: string;
  jumlah_user: number;
  isProtected: boolean;
};

export type GetOwnerJabatanListResponse =
  | {
      success: true;
      message: string;
      jabatan: OwnerJabatanRow[];
    }
  | {
      success: false;
      message: string;
    };

export type GetOwnerJabatanDetailResponse =
  | {
      success: true;
      message: string;
      jabatan: OwnerJabatanRow;
    }
  | {
      success: false;
      message: string;
    };

export type CreateOwnerJabatanResponse =
  | {
      success: true;
      message: string;
      jabatan: OwnerJabatanRow;
    }
  | {
      success: false;
      message: string;
    };

export type UpdateOwnerJabatanResponse =
  | {
      success: true;
      message: string;
      jabatan: OwnerJabatanRow;
    }
  | {
      success: false;
      message: string;
    };

export type DeleteOwnerJabatanResponse =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message: string;
    };

export async function getOwnerJabatanListRequest(): Promise<GetOwnerJabatanListResponse> {
  const response = await fetch("/api/owner/jabatan", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal mengambil data jabatan.",
    };
  }

  return data as GetOwnerJabatanListResponse;
}

export async function getOwnerJabatanDetailRequest(
  id: string
): Promise<GetOwnerJabatanDetailResponse> {
  const response = await fetch(`/api/owner/jabatan/${id}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal mengambil detail jabatan.",
    };
  }

  return data as GetOwnerJabatanDetailResponse;
}

export async function createOwnerJabatanRequest(payload: {
  nama_roles: string;
}): Promise<CreateOwnerJabatanResponse> {
  const response = await fetch("/api/owner/jabatan", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal menambah jabatan.",
    };
  }

  return data as CreateOwnerJabatanResponse;
}

export async function updateOwnerJabatanRequest(
  id: string,
  payload: {
    nama_roles: string;
  }
): Promise<UpdateOwnerJabatanResponse> {
  const response = await fetch(`/api/owner/jabatan/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal memperbarui jabatan.",
    };
  }

  return data as UpdateOwnerJabatanResponse;
}

export async function deleteOwnerJabatanRequest(
  id: string
): Promise<DeleteOwnerJabatanResponse> {
  const response = await fetch(`/api/owner/jabatan/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal menghapus jabatan.",
    };
  }

  return data as DeleteOwnerJabatanResponse;
}