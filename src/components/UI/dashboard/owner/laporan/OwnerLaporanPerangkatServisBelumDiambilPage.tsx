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

type LaporanPerangkatBelumDiambilRow = {
  id: string;
  nomor_tiket: string;
  customer: string;
  perangkat: string;
  tanggal_selesai: string;
  status: string;
};

const data: LaporanPerangkatBelumDiambilRow[] = [
  {
    id: "LPB-001",
    nomor_tiket: "TS-240426-001",
    customer: "Agus",
    perangkat: "Laptop ASUS VivoBook",
    tanggal_selesai: "26 Apr 2024",
    status: "Belum Diambil",
  },
  {
    id: "LPB-002",
    nomor_tiket: "TS-240425-002",
    customer: "Budi",
    perangkat: "Printer Epson L3210",
    tanggal_selesai: "25 Apr 2024",
    status: "Belum Diambil",
  },
  {
    id: "LPB-003",
    nomor_tiket: "TS-240424-003",
    customer: "Siti",
    perangkat: "PC Rakitan Office",
    tanggal_selesai: "24 Apr 2024",
    status: "Belum Diambil",
  },
];

export default function OwnerLaporanPerangkatServisBelumDiambilPage() {
  const [periode, setPeriode] = useState<string | null>("harian");
  const [tanggal, setTanggal] = useState("2024-04-26");

  function handleApplyFilter() {
    notifications.show({
      title: "Filter Laporan",
      message: `Filter laporan perangkat servis belum diambil diterapkan (${periode ?? "-"}, ${tanggal})`,
      color: "blue",
    });
  }

  function handleDownload(type: "pdf" | "excel") {
    notifications.show({
      title: "Download Laporan",
      message: `Download laporan perangkat servis belum diambil ${type.toUpperCase()} belum disambungkan`,
      color: "green",
    });
  }

  function handleView(row: LaporanPerangkatBelumDiambilRow) {
    notifications.show({
      title: "Tampil",
      message: `Menampilkan detail ${row.nomor_tiket}`,
      color: "blue",
    });
  }

  function handleRowDownload(row: LaporanPerangkatBelumDiambilRow) {
    notifications.show({
      title: "Download",
      message: `Download detail ${row.nomor_tiket} belum disambungkan`,
      color: "green",
    });
  }

  const columns: TableColumn<LaporanPerangkatBelumDiambilRow>[] = [
    {
      key: "nomor_tiket",
      label: "Nomor Tiket",
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
      render: (row) => <Text fz={16}>{row.perangkat}</Text>,
    },
    {
      key: "tanggal_selesai",
      label: "Tanggal Selesai",
      sortable: true,
      render: (row) => <Text fz={16}>{row.tanggal_selesai}</Text>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => (
        <Badge color="orange" variant="light" radius="sm">
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
          emptyText="Data perangkat servis belum diambil tidak tersedia"
          toolbar={
            <Text fw={700} fz={22} c="#111111">
              Laporan Perangkat Servis Belum Diambil
            </Text>
          }
        />
      </Paper>
    </Stack>
  );
}