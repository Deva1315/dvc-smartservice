export type DropPointRow = {
  id: string;
  namaDropPoint: string;
  address: string;
  phone: string;
  jamOperasional: string;
};

export function buildDropPointMapsUrl(dropPoint: DropPointRow) {
  const query = encodeURIComponent(
    `${dropPoint.namaDropPoint}, ${dropPoint.address}`
  );

  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function generateDropPointSlug(dropPoint: DropPointRow) {
  const normalizedName = dropPoint.namaDropPoint
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return `${dropPoint.id}-${normalizedName}`;
}

export function extractDropPointIdFromSlug(slug: string) {
  const [id] = slug.split("-");
  return id || "";
}