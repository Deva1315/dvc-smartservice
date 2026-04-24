export type SupplierApiItem = {
  id: string;
  nama_supplier: string;
  alamat: string | null;
  phone: string | null;
  _count?: {
    sparepart: number;
    stock_mutasi: number;
  };
};

export type SupplierPayload = {
  nama_supplier: string;
  alamat?: string | null;
  phone?: string | null;
};

const BASE_URL = "/api/admin-gudang/suppliers";

export async function getSuppliers() {
  const response = await fetch(BASE_URL, {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data supplier");
  }

  return result;
}

export async function createSupplier(payload: SupplierPayload) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menambahkan supplier");
  }

  return result;
}

export async function updateSupplier(id: string, payload: SupplierPayload) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal memperbarui supplier");
  }

  return result;
}

export async function deleteSupplier(id: string) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menghapus supplier");
  }

  return result;
}