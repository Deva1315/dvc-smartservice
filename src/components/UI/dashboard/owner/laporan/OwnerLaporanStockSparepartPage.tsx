"use client";

import { Badge, Text } from "@mantine/core";
import OwnerLaporanDataPage from "@/components/UI/dashboard/owner/laporan/components/OwnerLaporanDataPage";
import type { TableColumn } from "@/components/table/custom-table-no-search/CustomTableNoSearch";

type StatusStock = "Aman" | "Menipis" | "Habis";

type LaporanStockSparepartRow = Record<string, unknown> & {
  id: string;
  kode_sparepart: string;
  nama_sparepart: string;
  supplier: string;
  stok: number;
  status: StatusStock;
  harga_display: string;
};

function getStatusColor(status: StatusStock) {
  if (status === "Aman") return "green";
  if (status === "Menipis") return "yellow";
  return "red";
}

const columns: TableColumn<LaporanStockSparepartRow>[] = [
  {
    key: "kode_sparepart",
    label: "Kode Sparepart",
    sortable: true,
    render: (row) => <Text fz={16}>{row.kode_sparepart}</Text>,
  },
  {
    key: "nama_sparepart",
    label: "Nama Sparepart",
    sortable: true,
    render: (row) => <Text fz={16}>{row.nama_sparepart}</Text>,
  },
  {
    key: "supplier",
    label: "Supplier",
    sortable: true,
    render: (row) => <Text fz={16}>{row.supplier}</Text>,
  },
  {
    key: "stok",
    label: "Stok",
    sortable: true,
    align: "center",
    render: (row) => <Text fz={16}>{row.stok}</Text>,
  },
  {
    key: "harga_display",
    label: "Harga",
    sortable: true,
    render: (row) => <Text fz={16}>{row.harga_display}</Text>,
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (row) => (
      <Badge color={getStatusColor(row.status)} variant="light" radius="sm">
        {row.status}
      </Badge>
    ),
  },
];

export default function OwnerLaporanStockSparepartPage() {
  return (
    <OwnerLaporanDataPage<LaporanStockSparepartRow>
      jenis="stock-sparepart"
      label="Laporan Stock Sparepart"
      periodeDefault="bulanan"
      columns={columns}
      emptyText="Data stock sparepart tidak ditemukan"
      mapData={(item) => {
        const row = item as Partial<LaporanStockSparepartRow>;

        return {
          id: String(row.id || crypto.randomUUID()),
          kode_sparepart: String(row.kode_sparepart || "-"),
          nama_sparepart: String(row.nama_sparepart || "-"),
          supplier: String(row.supplier || "-"),
          stok: Number(row.stok || 0),
          status: (row.status || "Habis") as StatusStock,
          harga_display: String(row.harga_display || "Rp 0"),
        };
      }}
    />
  );
}