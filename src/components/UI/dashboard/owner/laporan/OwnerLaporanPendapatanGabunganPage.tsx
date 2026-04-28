"use client";

import { Badge, Text } from "@mantine/core";
import OwnerLaporanDataPage from "@/components/UI/dashboard/owner/laporan/components/OwnerLaporanDataPage";
import type { TableColumn } from "@/components/table/custom-table-no-search/CustomTableNoSearch";

type SumberPendapatan = "Penjualan" | "Servis";

type LaporanPendapatanGabunganRow = Record<string, unknown> & {
  id: string;
  tanggal: string;
  sumber: SumberPendapatan;
  referensi: string;
  keterangan: string;
  nominal: string;
};

function getSumberColor(sumber: SumberPendapatan) {
  return sumber === "Penjualan" ? "blue" : "green";
}

const columns: TableColumn<LaporanPendapatanGabunganRow>[] = [
  {
    key: "tanggal",
    label: "Tanggal",
    sortable: true,
    render: (row) => <Text fz={16}>{row.tanggal}</Text>,
  },
  {
    key: "sumber",
    label: "Sumber",
    sortable: true,
    render: (row) => (
      <Badge color={getSumberColor(row.sumber)} variant="light" radius="sm">
        {row.sumber}
      </Badge>
    ),
  },
  {
    key: "referensi",
    label: "Referensi",
    sortable: true,
    render: (row) => <Text fz={16}>{row.referensi}</Text>,
  },
  {
    key: "keterangan",
    label: "Keterangan",
    sortable: true,
    render: (row) => <Text fz={16}>{row.keterangan}</Text>,
  },
  {
    key: "nominal",
    label: "Nominal",
    sortable: true,
    render: (row) => <Text fz={16}>{row.nominal}</Text>,
  },
];

export default function OwnerLaporanPendapatanGabunganPage() {
  return (
    <OwnerLaporanDataPage<LaporanPendapatanGabunganRow>
      jenis="pendapatan-gabungan"
      label="Laporan Pendapatan Gabungan"
      periodeDefault="harian"
      columns={columns}
      emptyText="Data pendapatan gabungan tidak ditemukan"
      mapData={(item) => {
        const row = item as Partial<LaporanPendapatanGabunganRow>;

        return {
          id: String(row.id || crypto.randomUUID()),
          tanggal: String(row.tanggal || "-"),
          sumber: (row.sumber || "Penjualan") as SumberPendapatan,
          referensi: String(row.referensi || "-"),
          keterangan: String(row.keterangan || "-"),
          nominal: String(row.nominal || "Rp 0"),
        };
      }}
    />
  );
}