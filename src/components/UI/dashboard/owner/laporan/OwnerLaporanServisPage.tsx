"use client";

import { Text } from "@mantine/core";
import OwnerLaporanDataPage from "@/components/UI/dashboard/owner/laporan/components/OwnerLaporanDataPage";
import type { TableColumn } from "@/components/table/custom-table-no-search/CustomTableNoSearch";

type LaporanServisRow = Record<string, unknown> & {
  id: string;
  tanggal: string;
  no_nota: string;
  nomor_tiket: string;
  customer: string;
  perangkat: string;
  total_item: number;
  total_bayar: string;
};

const columns: TableColumn<LaporanServisRow>[] = [
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
    key: "nomor_tiket",
    label: "No Tiket",
    sortable: true,
    render: (row) => <Text fz={16}>{row.nomor_tiket}</Text>,
  },
  {
    key: "customer",
    label: "Nama Customer",
    sortable: true,
    render: (row) => <Text fz={16}>{row.customer}</Text>,
  },
  {
    key: "perangkat",
    label: "Perangkat",
    sortable: true,
    render: (row) => (
      <Text fz={16} lineClamp={2}>
        {row.perangkat}
      </Text>
    ),
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

export default function OwnerLaporanServisPage() {
  return (
    <OwnerLaporanDataPage<LaporanServisRow>
      jenis="servis"
      label="Laporan Servis"
      periodeDefault="harian"
      columns={columns}
      emptyText="Data laporan servis tidak ditemukan"
      mapData={(item) => {
        const row = item as Partial<LaporanServisRow>;

        return {
          id: String(row.id || crypto.randomUUID()),
          tanggal: String(row.tanggal || "-"),
          no_nota: String(row.no_nota || "-"),
          nomor_tiket: String(row.nomor_tiket || "-"),
          customer: String(row.customer || "-"),
          perangkat: String(row.perangkat || "-"),
          total_item: Number(row.total_item || 0),
          total_bayar: String(row.total_bayar || "Rp 0"),
        };
      }}
    />
  );
}