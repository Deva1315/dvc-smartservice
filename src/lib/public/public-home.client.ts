export type PublicPopularCategoryItem = {
  id: string;
  title: string;
  image: string | null;
  totalTerjual: number;
  href: string;
};

export type GetPopularCategoriesResponse =
  | {
      success: true;
      message: string;
      kategori: PublicPopularCategoryItem[];
    }
  | {
      success: false;
      message: string;
    };

export async function getPopularCategoriesRequest(params?: {
  limit?: number;
}): Promise<GetPopularCategoriesResponse> {
  const searchParams = new URLSearchParams();

  if (params?.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const queryString = searchParams.toString();
  const url = queryString
    ? `/api/public/kategori-terpopuler?${queryString}`
    : "/api/public/kategori-terpopuler";

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal mengambil kategori terpopuler.",
    };
  }

  return data as GetPopularCategoriesResponse;
}
