"use client";

import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Menu,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCalendarMonth,
  IconChevronDown,
  IconDotsVertical,
  IconDownload,
  IconEye,
  IconFileDownload,
} from "@tabler/icons-react";
import CustomTableNoSearch, {
  type TableColumn,
} from "@/components/table/custom-table-no-search/CustomTableNoSearch";

type LaporanPendapatanGabunganRow = {
  id: string;
  tanggal: string;
  sumber: "Penjualan" | "Servis";
  referensi: string;
  keterangan: string;
  nominal: string;
};

const data: LaporanPendapatanGabunganRow[] = [
  {
    id: "LPG-001",
    tanggal: "26 Apr 2024",
    sumber: "Penjualan",
    referensi: "PJ-240426-001",
    keterangan: "Penjualan Mouse Gaming",
    nominal: "Rp 850.000",
  },
  {
    id: "LPG-002",
    tanggal: "26 Apr 2024",
    sumber: "Servis",
    referensi: "TS-240426-001",
    keterangan: "Servis Laptop ASUS",
    nominal: "Rp 500.000",
  },
  {
    id: "LPG-003",
    tanggal: "25 Apr 2024",
    sumber: "Penjualan",
    referensi: "PJ-240425-002",
    keterangan: "Penjualan Keyboard",
    nominal: "Rp 650.000",
  },
  {
    id: "LPG-004",
    tanggal: "25 Apr 2024",
    sumber: "Servis",
    referensi: "TS-240425-003",
    keterangan: "Ganti SSD Laptop",
    nominal: "Rp 750.000",
  },
];

function getSumberColor(sumber: LaporanPendapatanGabunganRow["sumber"]) {
  return sumber === "Penjualan" ? "blue" : "green";
}

export default function OwnerLaporanPendapatanGabunganPage() {
  const [periode, setPeriode] = useState<string | null>("harian");
  const [tanggal, setTanggal] = useState("2024-04-26");

  function handleApplyFilter() {
    notifications.show({
      title: "Filter Laporan",
      message: `Filter laporan pendapatan gabungan diterapkan (${periode ?? "-"}, ${tanggal})`,
      color: "blue",
    });
  }

  function handleDownload(type: "pdf" | "excel") {
    notifications.show({
      title: "Download Laporan",
      message: `Download laporan pendapatan gabungan ${type.toUpperCase()} belum disambungkan`,
      color: "green",
    });
  }

  function handleView(row: LaporanPendapatanGabunganRow) {
    notifications.show({
      title: "Tampil",
      message: `Menampilkan detail ${row.referensi}`,
      color: "blue",
    });
  }

  function handleRowDownload(row: LaporanPendapatanGabunganRow) {
    notifications.show({
      title: "Download",
      message: `Download detail ${row.referensi} belum disambungkan`,
      color: "green",
    });
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
    {
      key: "aksi",
      label: "Aksi",
      align: "center",
      width: 90,
      render: (row) => (
        <Menu shadow="md" width={180} position="bottom-end" withinPortal={false}>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" radius="xl">
              <IconDotsVertical size={20} stroke={2} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEye size={16} stroke={1.9} />}
              onClick={() => handleView(row)}
            >
              Tampil
            </Menu.Item>
            <Menu.Item
              leftSection={<IconFileDownload size={16} stroke={1.9} />}
              onClick={() => handleRowDownload(row)}
            >
              Download
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];

  return (
    <Stack gap={16}>
      <Group justify="flex-end">
        <Menu shadow="md" width={180} position="bottom-end" withinPortal={false}>
          <Menu.Target>
            <Button
              radius="xl"
              rightSection={<IconChevronDown size={18} stroke={2} />}
              style={{
                height: 44,
                minWidth: 160,
                backgroundColor: "#0D4CB5",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              Download
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item leftSection={<IconDownload size={16} stroke={1.9} />} onClick={() => handleDownload("pdf")}>
              Download PDF
            </Menu.Item>
            <Menu.Item leftSection={<IconDownload size={16} stroke={1.9} />} onClick={() => handleDownload("excel")}>
              Download Excel
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Paper radius={22} p={10} style={{ backgroundColor: "#F8F8FA", border: "1px solid #E6E6EA" }}>
        <Stack gap={10}>
          <Text fw={700} fz={20}>Periode</Text>

          <Group gap={12} align="stretch" wrap="nowrap">
            <Select
              value={periode}
              onChange={setPeriode}
              data={[
                { value: "harian", label: "Harian" },
                { value: "mingguan", label: "Mingguan" },
                { value: "bulanan", label: "Bulanan" },
                { value: "tahunan", label: "Tahunan" },
              ]}
              radius="md"
              style={{ flex: 1 }}
              styles={{ input: { height: 54, backgroundColor: "#FFFFFF", border: "1px solid #D9DCE3", fontSize: 17 } }}
            />

            <TextInput
              type="date"
              value={tanggal}
              onChange={(event) => setTanggal(event.currentTarget.value)}
              radius="md"
              leftSection={<IconCalendarMonth size={18} stroke={1.8} />}
              style={{ flex: 1 }}
              styles={{ input: { height: 54, backgroundColor: "#FFFFFF", border: "1px solid #D9DCE3", fontSize: 17 } }}
            />

            <Button
              radius="md"
              onClick={handleApplyFilter}
              style={{
                minWidth: 230,
                height: 54,
                backgroundColor: "#0D4CB5",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              Terapkan Filter
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Paper radius={22} p={0} style={{ backgroundColor: "#F8F8FA", border: "1px solid #E6E6EA", overflow: "hidden" }}>
        <CustomTableNoSearch
          data={data}
          columns={columns}
          showFooter={false}
          emptyText="Data laporan pendapatan gabungan tidak tersedia"
          toolbar={
            <Text fw={700} fz={22} c="#111111">
              Laporan Pendapatan Gabungan
            </Text>
          }
        />
      </Paper>
    </Stack>
  );
}