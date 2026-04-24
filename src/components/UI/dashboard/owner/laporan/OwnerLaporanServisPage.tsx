"use client";

import { useState } from "react";
import {
  ActionIcon,
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

type LaporanPenjualanRow = {
  id: string;
  tanggal: string;
  no_nota: string;
  customer: string;
  total_item: number;
  total_bayar: string;
};

const data: LaporanPenjualanRow[] = [
  {
    id: "LPJ-001",
    tanggal: "26 Apr 2024",
    no_nota: "PJ-240426-001",
    customer: "Agus",
    total_item: 3,
    total_bayar: "Rp 850.000",
  },
  {
    id: "LPJ-002",
    tanggal: "26 Apr 2024",
    no_nota: "PJ-240426-002",
    customer: "Budi",
    total_item: 2,
    total_bayar: "Rp 650.000",
  },
  {
    id: "LPJ-003",
    tanggal: "25 Apr 2024",
    no_nota: "PJ-240425-001",
    customer: "Siti",
    total_item: 1,
    total_bayar: "Rp 200.000",
  },
  {
    id: "LPJ-004",
    tanggal: "25 Apr 2024",
    no_nota: "PJ-240425-002",
    customer: "Rizky",
    total_item: 4,
    total_bayar: "Rp 1.250.000",
  },
];

export default function OwnerLaporanPenjualanPage() {
  const [periode, setPeriode] = useState<string | null>("harian");
  const [tanggal, setTanggal] = useState("2024-04-26");

  function handleApplyFilter() {
    notifications.show({
      title: "Filter Laporan",
      message: `Filter laporan penjualan diterapkan (${periode ?? "-"}, ${tanggal})`,
      color: "blue",
    });
  }

  function handleDownload(type: "pdf" | "excel") {
    notifications.show({
      title: "Download Laporan",
      message: `Download laporan penjualan ${type.toUpperCase()} belum disambungkan`,
      color: "green",
    });
  }

  function handleView(row: LaporanPenjualanRow) {
    notifications.show({
      title: "Tampil",
      message: `Menampilkan detail ${row.no_nota}`,
      color: "blue",
    });
  }

  function handleRowDownload(row: LaporanPenjualanRow) {
    notifications.show({
      title: "Download",
      message: `Download detail ${row.no_nota} belum disambungkan`,
      color: "green",
    });
  }

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
      key: "customer",
      label: "Nama Customer",
      sortable: true,
      render: (row) => <Text fz={16}>{row.customer}</Text>,
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
            <Menu.Item
              leftSection={<IconDownload size={16} stroke={1.9} />}
              onClick={() => handleDownload("pdf")}
            >
              Download PDF
            </Menu.Item>
            <Menu.Item
              leftSection={<IconDownload size={16} stroke={1.9} />}
              onClick={() => handleDownload("excel")}
            >
              Download Excel
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Paper
        radius={22}
        p={10}
        style={{
          backgroundColor: "#F8F8FA",
          border: "1px solid #E6E6EA",
        }}
      >
        <Stack gap={10}>
          <Text fw={700} fz={20}>
            Periode
          </Text>

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
              styles={{
                input: {
                  height: 54,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #D9DCE3",
                  fontSize: 17,
                },
              }}
            />

            <TextInput
              type="date"
              value={tanggal}
              onChange={(event) => setTanggal(event.currentTarget.value)}
              radius="md"
              leftSection={<IconCalendarMonth size={18} stroke={1.8} />}
              style={{ flex: 1 }}
              styles={{
                input: {
                  height: 54,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #D9DCE3",
                  fontSize: 17,
                },
              }}
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

      <Paper
        radius={22}
        p={0}
        style={{
          backgroundColor: "#F8F8FA",
          border: "1px solid #E6E6EA",
          overflow: "hidden",
        }}
      >
        <CustomTableNoSearch
          data={data}
          columns={columns}
          showFooter={false}
          emptyText="Data laporan penjualan tidak tersedia"
          toolbar={
            <Text fw={700} fz={22} c="#111111">
              Laporan Penjualan
            </Text>
          }
        />
      </Paper>
    </Stack>
  );
}