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

type LaporanStockBarangRow = {
  id: string;
  kode_barang: string;
  nama_barang: string;
  kategori: string;
  stok: number;
  status: "Aman" | "Menipis" | "Habis";
};

const data: LaporanStockBarangRow[] = [
  {
    id: "LSB-001",
    kode_barang: "BRG-001",
    nama_barang: "Mouse Gaming",
    kategori: "Aksesoris",
    stok: 18,
    status: "Aman",
  },
  {
    id: "LSB-002",
    kode_barang: "BRG-002",
    nama_barang: "Keyboard Mechanical",
    kategori: "Aksesoris",
    stok: 7,
    status: "Menipis",
  },
  {
    id: "LSB-003",
    kode_barang: "BRG-003",
    nama_barang: "Monitor 24 Inch",
    kategori: "Monitor",
    stok: 0,
    status: "Habis",
  },
];

function getStatusColor(status: LaporanStockBarangRow["status"]) {
  if (status === "Aman") return "green";
  if (status === "Menipis") return "yellow";
  return "red";
}

export default function OwnerLaporanStockBarangPage() {
  const [periode, setPeriode] = useState<string | null>("bulanan");
  const [tanggal, setTanggal] = useState("2024-04-26");

  function handleApplyFilter() {
    notifications.show({
      title: "Filter Laporan",
      message: `Filter laporan stock barang diterapkan (${periode ?? "-"}, ${tanggal})`,
      color: "blue",
    });
  }

  function handleDownload(type: "pdf" | "excel") {
    notifications.show({
      title: "Download Laporan",
      message: `Download laporan stock barang ${type.toUpperCase()} belum disambungkan`,
      color: "green",
    });
  }

  function handleView(row: LaporanStockBarangRow) {
    notifications.show({
      title: "Tampil",
      message: `Menampilkan detail ${row.nama_barang}`,
      color: "blue",
    });
  }

  function handleRowDownload(row: LaporanStockBarangRow) {
    notifications.show({
      title: "Download",
      message: `Download detail ${row.nama_barang} belum disambungkan`,
      color: "green",
    });
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
      key: "stok",
      label: "Stok",
      sortable: true,
      align: "center",
      render: (row) => <Text fz={16}>{row.stok}</Text>,
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
          emptyText="Data laporan stock barang tidak tersedia"
          toolbar={
            <Text fw={700} fz={22} c="#111111">
              Laporan Stock Barang
            </Text>
          }
        />
      </Paper>
    </Stack>
  );
}