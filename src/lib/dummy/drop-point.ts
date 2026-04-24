export type DropPointRow = {
  id: number;
  namaDropPoint: string;
  address: string;
  phone: string;
  jamOperasional: string;
};

export const DUMMY_DROP_POINTS: DropPointRow[] = [
  {
    id: 1,
    namaDropPoint: "Drop Point Guwang",
    address: "Jalan Mangga No. 22 Guwang, Gianyar",
    phone: "082147073742",
    jamOperasional: "09.00 - 17.00",
  },
  {
    id: 2,
    namaDropPoint: "Drop Point Celuk",
    address: "Jalan Wayan Pugig No. 19X, Celuk, Batubulan",
    phone: "08174762502",
    jamOperasional: "09.00 - 17.00",
  },
  {
    id: 3,
    namaDropPoint: "Drop Point Denpasar",
    address: "Jalan Nangka No. 11, Denpasar",
    phone: "0819981725",
    jamOperasional: "09.00 - 17.00",
  },
  {
    id: 4,
    namaDropPoint: "Drop Point Sukawati",
    address: "Jalan Srsan Putra No. 99, Sukawati",
    phone: "0879929998217",
    jamOperasional: "09.00 - 17.00",
  },
];

export function generateDropPointSlug(namaDropPoint: string) {
  return namaDropPoint
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getDropPointBySlug(slug: string) {
  return DUMMY_DROP_POINTS.find(
    (item) => generateDropPointSlug(item.namaDropPoint) === slug
  );
}

export function buildDropPointMapsUrl(
  dropPoint: Pick<DropPointRow, "namaDropPoint" | "address">
) {
  const query = encodeURIComponent(
    `${dropPoint.namaDropPoint}, ${dropPoint.address}`
  );

  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}