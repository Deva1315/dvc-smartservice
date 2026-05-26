"use client";

import { Badge, Text } from "@mantine/core";
import OwnerLaporanDataPage from "@/components/UI/dashboard/owner/laporan/components/OwnerLaporanDataPage";
import type { TableColumn } from "@/components/table/custom-table-no-search/CustomTableNoSearch";

type StatusStock = "Aman" | "Habis";

type LaporanStockBarangRow = Record<string, unknown> & {
  id: string;
  kode_barang: string;
  nama_barang: string;
  kategori: string;
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

const columns: TableColumn<LaporanStockBarangRow>[] = [
  {
    key: "kode_barang",
    label: "Kode Barang",
    sortable: true,
    render: (row) => <Text fz={16}>{row.kode_barang}</Text>,
  },
  {
    key: "nama_barang",
    label: "Nama Barang",
    sortable: true,
    render: (row) => <Text fz={16}>{row.nama_barang}</Text>,
  },
  {
    key: "kategori",
    label: "Kategori",
    sortable: true,
    render: (row) => <Text fz={16}>{row.kategori}</Text>,
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

export default function OwnerLaporanStockBarangPage() {
  return (
    <OwnerLaporanDataPage<LaporanStockBarangRow>
      jenis="stock-barang"
      label="Laporan Stock Barang"
      periodeDefault="bulanan"
      columns={columns}
      emptyText="Data stock barang tidak ditemukan"
      mapData={(item) => {
        const row = item as Partial<LaporanStockBarangRow>;

        return {
          id: String(row.id || crypto.randomUUID()),
          kode_barang: String(row.kode_barang || "-"),
          nama_barang: String(row.nama_barang || "-"),
          kategori: String(row.kategori || "-"),
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