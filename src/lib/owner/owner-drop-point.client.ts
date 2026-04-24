export type OwnerDropPointRow = {
  id: string;
  nama_drop_point: string;
  alamat: string;
  phone: string | null;
  jam_operasional: string | null;
};

export type GetOwnerDropPointListResponse =
  | {
      success: true;
      message: string;
      dropPoints: OwnerDropPointRow[];
    }
  | {
      success: false;
      message: string;
    };

export type CreateOwnerDropPointResponse =
  | {
      success: true;
      message: string;
      dropPoint: OwnerDropPointRow;
    }
  | {
      success: false;
      message: string;
    };

export type UpdateOwnerDropPointResponse =
  | {
      success: true;
      message: string;
      dropPoint: OwnerDropPointRow;
    }
  | {
      success: false;
      message: string;
    };

export type GetOwnerDropPointDetailResponse =
  | {
      success: true;
      message: string;
      dropPoint: OwnerDropPointRow;
    }
  | {
      success: false;
      message: string;
    };

export type DeleteOwnerDropPointResponse =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message: string;
    };

export async function getOwnerDropPointListRequest(): Promise<GetOwnerDropPointListResponse> {
  const response = await fetch("/api/owner/drop-point", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal mengambil data drop point.",
    };
  }

  return data as GetOwnerDropPointListResponse;
}

export async function createOwnerDropPointRequest(payload: {
  nama_drop_point: string;
  alamat: string;
  phone: string | null;
  jam_operasional: string | null;
}): Promise<CreateOwnerDropPointResponse> {
  const response = await fetch("/api/owner/drop-point", {
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
      message: data?.message ?? "Gagal menambah drop point.",
    };
  }

  return data as CreateOwnerDropPointResponse;
}

export async function updateOwnerDropPointRequest(
  id: string,
  payload: {
    nama_drop_point: string;
    alamat: string;
    phone: string | null;
    jam_operasional: string | null;
  }
): Promise<UpdateOwnerDropPointResponse> {
  const response = await fetch(`/api/owner/drop-point/${id}`, {
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
      message: data?.message ?? "Gagal memperbarui drop point.",
    };
  }

  return data as UpdateOwnerDropPointResponse;
}

export async function getOwnerDropPointDetailRequest(
  id: string
): Promise<GetOwnerDropPointDetailResponse> {
  const response = await fetch(`/api/owner/drop-point/${id}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal mengambil detail drop point.",
    };
  }

  return data as GetOwnerDropPointDetailResponse;
}

export async function deleteOwnerDropPointRequest(
  id: string
): Promise<DeleteOwnerDropPointResponse> {
  const response = await fetch(`/api/owner/drop-point/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal menghapus drop point.",
    };
  }

  return data as DeleteOwnerDropPointResponse;
}