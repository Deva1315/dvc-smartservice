export type PublicDropPointApiRow = {
  id: string;
  nama_drop_point: string;
  alamat: string;
  phone: string | null;
  jam_operasional: string | null;
};

export type PublicNearestDropPointApiRow = PublicDropPointApiRow & {
  jarak_km: number | string | null;
  jarak_label: string | null;
};

export type GetPublicDropPointListResponse =
  | {
      success: true;
      message: string;
      dropPoints: PublicDropPointApiRow[];
    }
  | {
      success: false;
      message: string;
    };

export type GetPublicDropPointDetailResponse =
  | {
      success: true;
      message: string;
      dropPoint: PublicDropPointApiRow;
    }
  | {
      success: false;
      message: string;
    };

export type GetNearestPublicDropPointListResponse =
  | {
      success: true;
      message: string;
      dropPoints: PublicNearestDropPointApiRow[];
    }
  | {
      success: false;
      message: string;
    };

export async function getPublicDropPointListRequest(): Promise<GetPublicDropPointListResponse> {
  const response = await fetch("/api/public/drop-point", {
    method: "GET",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal mengambil data drop point.",
    };
  }

  return data as GetPublicDropPointListResponse;
}

export async function getPublicDropPointDetailRequest(
  id: string
): Promise<GetPublicDropPointDetailResponse> {
  const response = await fetch(`/api/public/drop-point/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal mengambil detail drop point.",
    };
  }

  return data as GetPublicDropPointDetailResponse;
}

export async function getNearestPublicDropPointListRequest(params: {
  alamatCustomer: string;
}): Promise<GetNearestPublicDropPointListResponse> {
  const searchParams = new URLSearchParams({
    alamat_customer: params.alamatCustomer,
  });

  const response = await fetch(
    `/api/public/drop-point/nearest?${searchParams.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal menghitung drop point terdekat.",
    };
  }

  return data as GetNearestPublicDropPointListResponse;
}

