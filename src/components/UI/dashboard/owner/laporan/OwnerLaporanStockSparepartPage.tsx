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

type LaporanStockSparepartRow = {
  id: string;
  kode_sparepart: string;
  nama_sparepart: string;
  supplier: string;
  stok: number;
  status: "Aman" | "Menipis" | "Habis";
};

const data: LaporanStockSparepartRow[] = [
  {
    id: "LSS-001",
    kode_sparepart: "SPR-001",
    nama_sparepart: "RAM 8GB DDR4",
    supplier: "Supplier A",
    stok: 12,
    status: "Aman",
  },
  {
    id: "LSS-002",
    kode_sparepart: "SPR-002",
    nama_sparepart: "SSD 256GB",
    supplier: "Supplier B",
    stok: 5,
    status: "Menipis",
  },
  {
    id: "LSS-003",
    kode_sparepart: "SPR-003",
    nama_sparepart: "Adaptor Laptop",
    supplier: "Supplier C",
    stok: 0,
    status: "Habis",
  },
];

function getStatusColor(status: LaporanStockSparepartRow["status"]) {
  if (status === "Aman") return "green";
  if (status === "Menipis") return "yellow";
  return "red";
}

export default function OwnerLaporanStockSparepartPage() {
  const [periode, setPeriode] = useState<string | null>("bulanan");
  const [tanggal, setTanggal] = useState("2024-04-26");

  function handleApplyFilter() {
    notifications.show({
      title: "Filter Laporan",
      message: `Filter laporan stock sparepart diterapkan (${periode ?? "-"}, ${tanggal})`,
      color: "blue",
    });
  }

  function handleDownload(type: "pdf" | "excel") {
    notifications.show({
      title: "Download Laporan",
      message: `Download laporan stock sparepart ${type.toUpperCase()} belum disambungkan`,
      color: "green",
    });
  }

  function handleView(row: LaporanStockSparepartRow) {
    notifications.show({
      title: "Tampil",
      message: `Menampilkan detail ${row.nama_sparepart}`,
      color: "blue",
    });
  }

  function handleRowDownload(row: LaporanStockSparepartRow) {
    notifications.show({
      title: "Download",
      message: `Download detail ${row.nama_sparepart} belum disambungkan`,
      color: "green",
    });
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
          emptyText="Data laporan stock sparepart tidak tersedia"
          toolbar={
            <Text fw={700} fz={22} c="#111111">
              Laporan Stock Sparepart
            </Text>
          }
        />
      </Paper>
    </Stack>
  );
}