"use client";

import { Badge, Text } from "@mantine/core";
import OwnerLaporanDataPage from "@/components/UI/dashboard/owner/laporan/components/OwnerLaporanDataPage";
import type { TableColumn } from "@/components/table/custom-table-no-search/CustomTableNoSearch";

type StatusStock = "Aman" | "Habis";

type LaporanStockSparepartRow = Record<string, unknown> & {
  id: string;
  kode_sparepart: string;
  nama_sparepart: string;
  supplier: string;
  stok_awal: number;
  barang_masuk: number;
  barang_keluar: number;
  stok_akhir: number;
  status: StatusStock;
  harga_display: string;
};

function getStatusColor(status: StatusStock) {
  if (status === "Aman") return "green";
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
    key: "stok_awal",
    label: "Stok Awal",
    sortable: true,
    align: "center",
    render: (row) => <Text fz={16}>{row.stok_awal}</Text>,
  },
  {
    key: "barang_masuk",
    label: "Barang Masuk",
    sortable: true,
    align: "center",
    render: (row) => <Text fz={16}>{row.barang_masuk}</Text>,
  },
  {
    key: "barang_keluar",
    label: "Barang Keluar",
    sortable: true,
    align: "center",
    render: (row) => <Text fz={16}>{row.barang_keluar}</Text>,
  },
  {
    key: "stok_akhir",
    label: "Stok Akhir",
    sortable: true,
    align: "center",
    render: (row) => <Text fz={16}>{row.stok_akhir}</Text>,
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
          stok_awal: Number(row.stok_awal || 0),
          barang_masuk: Number(row.barang_masuk || 0),
          barang_keluar: Number(row.barang_keluar || 0),
          stok_akhir: Number(row.stok_akhir || 0),
          status: (row.status || "Habis") as StatusStock,
          harga_display: String(row.harga_display || "Rp 0"),
        };
      }}
    />
  );
}