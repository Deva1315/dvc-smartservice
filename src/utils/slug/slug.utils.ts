export function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "dan")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createProductSlug(namaBarang: string, kodeBarang: string) {
  return createSlug(`${namaBarang}-${kodeBarang}`);
}