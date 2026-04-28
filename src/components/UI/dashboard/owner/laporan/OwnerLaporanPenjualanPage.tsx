"use client";

import { Text } from "@mantine/core";
import OwnerLaporanDataPage from "@/components/UI/dashboard/owner/laporan/components/OwnerLaporanDataPage";
import type { TableColumn } from "@/components/table/custom-table-no-search/CustomTableNoSearch";

type LaporanPenjualanRow = Record<string, unknown> & {
  id: string;
  tanggal: string;
  no_nota: string;
  customer: string;
  total_item: number;
  total_bayar: string;
};


const columns: TableColumn<LaporanPenjualanRow>[] = [
  {
    key: "tanggal",
    label: "Tanggal",
    sortable: true,
    render: (row) => <Text fz={16}>{row.tanggal}</Text>,
  },
  {
    key: "no_nota",
    label: "No Nota",
    sortable: true,
    render: (row) => <Text fz={16}>{row.no_nota}</Text>,
  },
  {
    key: "total_item",
    label: "Total Item",
    sortable: true,
    align: "center",
    render: (row) => <Text fz={16}>{row.total_item}</Text>,
  },
  {
    key: "total_bayar",
    label: "Total Bayar",
    sortable: true,
    render: (row) => <Text fz={16}>{row.total_bayar}</Text>,
  },
];

export default function OwnerLaporanPenjualanPage() {
  return (
    <OwnerLaporanDataPage<LaporanPenjualanRow>
      jenis="penjualan"
      label="Laporan Penjualan"
      periodeDefault="harian"
      columns={columns}
      emptyText="Data laporan penjualan tidak ditemukan"
      mapData={(item) => {
        const row = item as Partial<LaporanPenjualanRow>;

        return {
          id: String(row.id || crypto.randomUUID()),
          tanggal: String(row.tanggal || "-"),
          no_nota: String(row.no_nota || "-"),
          customer: String(row.customer || "-"),
          total_item: Number(row.total_item || 0),
          total_bayar: String(row.total_bayar || "Rp 0"),
        };
      }}
    />
  );
}