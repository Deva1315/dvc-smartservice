/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Menu,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { IconDotsVertical, IconEye, IconPlus, IconCash } from "@tabler/icons-react";
import CustomTable, {
  type TableColumn,
} from "@/components/table/custom-table-search/CustomTableSearch";
import TiketServisFormModal from "@/components/UI/dashboard/admin-penjualan/tiket-servis/form/AdminPenjualanTiketServisFormModal";

type StatusVerifikasi = "Menunggu" | "Diterima" | "Ditolak";

type StatusServis =
  | "Belum_Diproses"
  | "Diproses"
  | "Menunggu_Sparepart"
  | "Selesai"
  | "Diambil"
  | "Dibatalkan";

type AdminPenjualanTiketRow = {
  id: string;
  no: number;
  nomorTiket: string;
  namaPelanggan: string;
  noHp: string;
  jenisPerangkat: string;
  merkPerangkat: string | null;
  statusVerifikasi: StatusVerifikasi;
  statusServis: StatusServis;
  tanggalMasuk: string;
};

const dummyTiketServis: AdminPenjualanTiketRow[] = [
  {
    id: "1",
    no: 1,
    nomorTiket: "TSK-20260423-001",
    namaPelanggan: "Anton Wijaya",
    noHp: "08123456789",
    jenisPerangkat: "Laptop",
    merkPerangkat: "Asus VivoBook",
    tanggalMasuk: "23-04-2024",
    statusVerifikasi: "Menunggu",
    statusServis: "Belum_Diproses",
  },
  {
    id: "2",
    no: 2,
    nomorTiket: "TSK-20260423-002",
    namaPelanggan: "Bagus Raharja",
    noHp: "08134567890",
    jenisPerangkat: "CPU",
    merkPerangkat: "Dell Vostro 260",
    tanggalMasuk: "22-04-2024",
    statusVerifikasi: "Diterima",
    statusServis: "Diproses",
  },
  {
    id: "3",
    no: 3,
    nomorTiket: "TSK-20260423-003",
    namaPelanggan: "Siti Andika",
    noHp: "08212345678",
    jenisPerangkat: "CPU",
    merkPerangkat: "Dell Vostro 260",
    tanggalMasuk: "21-04-2024",
    statusVerifikasi: "Diterima",
    statusServis: "Menunggu_Sparepart",
  },
  {
    id: "4",
    no: 4,
    nomorTiket: "TSK-20260423-004",
    namaPelanggan: "Andi Saputra",
    noHp: "08223456789",
    jenisPerangkat: "Laptop",
    merkPerangkat: "Lenovo IdeaPad 3",
    tanggalMasuk: "20-04-2024",
    statusVerifikasi: "Diterima",
    statusServis: "Selesai",
  },
  {
    id: "5",
    no: 5,
    nomorTiket: "TSK-20260423-005",
    namaPelanggan: "Agung Santoso",
    noHp: "08198765432",
    jenisPerangkat: "Laptop",
    merkPerangkat: "Asus TUF Gaming",
    tanggalMasuk: "19-04-2024",
    statusVerifikasi: "Menunggu",
    statusServis: "Belum_Diproses",
  },
];

const filterStatusServisOptions = [
  { value: "Menunggu", label: "Menunggu Verifikasi" },
  { value: "Diterima", label: "Diterima" },
  { value: "Ditolak", label: "Ditolak" },
  { value: "Belum_Diproses", label: "Belum Diproses" },
  { value: "Diproses", label: "Diproses" },
  { value: "Menunggu_Sparepart", label: "Menunggu Sparepart" },
  { value: "Selesai", label: "Selesai" },
  { value: "Diambil", label: "Diambil" },
  { value: "Dibatalkan", label: "Dibatalkan" },
];


function getPerangkatDisplay(row: AdminPenjualanTiketRow) {
  return row.merkPerangkat
    ? `${row.jenisPerangkat} - ${row.merkPerangkat}`
    : row.jenisPerangkat;
}

function getStatusServisLabel(status: StatusServis) {
  const labels: Record<StatusServis, string> = {
    Belum_Diproses: "Belum Diproses",
    Diproses: "Diproses",
    Menunggu_Sparepart: "Menunggu Sparepart",
    Selesai: "Selesai",
    Diambil: "Diambil",
    Dibatalkan: "Dibatalkan",
  };

  return labels[status] || status;
}

function getStatusServisColor(status: StatusServis) {
  const colors: Record<StatusServis, string> = {
    Belum_Diproses: "gray",
    Diproses: "blue",
    Menunggu_Sparepart: "yellow",
    Selesai: "green",
    Diambil: "teal",
    Dibatalkan: "red",
  };

  return colors[status] || "gray";
}

function getStatusVerifikasiLabel(status: StatusVerifikasi) {
  const labels: Record<StatusVerifikasi, string> = {
    Menunggu: "Menunggu",
    Diterima: "Diterima",
    Ditolak: "Ditolak",
  };

  return labels[status] || status;
}

function getStatusVerifikasiColor(status: StatusVerifikasi) {
  const colors: Record<StatusVerifikasi, string> = {
    Menunggu: "yellow",
    Diterima: "green",
    Ditolak: "red",
  };

  return colors[status] || "gray";
}

export default function AdminPenjualanTiketServisPage() {
  const router = useRouter();
  const [opened, setOpened] = useState(false);


  const [selectedStatusServis, setSelectedStatusServis] = useState<
    string | null
  >(null);

  const tableData = useMemo(() => {
    const filtered = selectedStatusServis
      ? dummyTiketServis.filter(
          (item) =>
            item.statusVerifikasi === selectedStatusServis ||
            item.statusServis === selectedStatusServis
        )
      : dummyTiketServis;

    return filtered.map((item, index) => ({
      ...item,
      no: index + 1,
    }));
  }, [selectedStatusServis]);

  const columns: TableColumn<AdminPenjualanTiketRow>[] = [
    {
      key: "no",
      label: "No",
      sortable: true,
      width: "6%",
      align: "center",
      render: (row) => (
        <Text fz={16} c="#222222">
          {row.no}
        </Text>
      ),
    },
    {
      key: "nomorTiket",
      label: "No Tiket",
      sortable: true,
      width: "16%",
      render: (row) => (
        <Text fw={700} fz={16} c="#111111">
          {row.nomorTiket}
        </Text>
      ),
    },
    {
      key: "namaPelanggan",
      label: "Nama Pelanggan",
      sortable: true,
      width: "16%",
      render: (row) => (
        <Text fw={700} fz={16} c="#111111">
          {row.namaPelanggan}
        </Text>
      ),
    },
    {
      key: "noHp",
      label: "No HP",
      sortable: true,
      width: "12%",
      render: (row) => (
        <Text fz={16} c="#222222">
          {row.noHp || "N/A"}
        </Text>
      ),
    },
    {
      key: "perangkat",
      label: "Perangkat",
      sortable: false,
      width: "16%",
      render: (row) => (
        <Text fz={16} c="#222222">
          {getPerangkatDisplay(row)}
        </Text>
      ),
    },
    {
      key: "statusVerifikasi",
      label: "Verifikasi",
      sortable: true,
      width: "11%",
      align: "center",
      render: (row) => (
        <Badge
          color={getStatusVerifikasiColor(row.statusVerifikasi)}
          variant="light"
          radius="xl"
          size="lg"
        >
          {getStatusVerifikasiLabel(row.statusVerifikasi)}
        </Badge>
      ),
    },
    {
      key: "statusServis",
      label: "Status Servis",
      sortable: true,
      width: "13%",
      align: "center",
      render: (row) => (
        <Badge
          color={getStatusServisColor(row.statusServis)}
          variant="light"
          radius="xl"
          size="lg"
        >
          {getStatusServisLabel(row.statusServis)}
        </Badge>
      ),
    },
    {
      key: "tanggalMasuk",
      label: "Tanggal Masuk",
      sortable: true,
      width: "10%",
      align: "center",
      render: (row) => (
        <Text fz={16} c="#222222">
          {row.tanggalMasuk}
        </Text>
      ),
    },
    {
      key: "aksi",
      label: "Aksi",
      width: "8%",
      align: "center",
      render: (row) => (
        <Menu
          shadow="md"
          width={180}
          position="bottom-end"
          withinPortal={false}
        >
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              radius="xl"
              aria-label={`Aksi untuk ${row.nomorTiket}`}
              onClick={(event) => event.stopPropagation()}
            >
              <IconDotsVertical size={20} stroke={2} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEye size={16} stroke={1.9} />}
              onClick={() =>
                router.push(
                  `/admin_penjualan/tiket-servis/${encodeURIComponent(
                    row.nomorTiket
                  )}`
                )
              }
            >
              Tampil Detail
            </Menu.Item>
            <Menu.Item
              leftSection={<IconCash size={16} stroke={1.9} />}
              onClick={() => router.push(`/admin_penjualan/tiket-servis/${encodeURIComponent(row.nomorTiket)}/pembayaran`)}
            >
              Proses Pembayaran
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];

  return (
    <Stack gap={18}>
      <Group justify="space-between" align="center">
        <Text fw={800} fz={26} c="#111111">
          Tiket Servis
        </Text>

        <Button
          radius="xl"
          leftSection={<IconPlus size={18} stroke={2.2} />}
          onClick={() => setOpened(true)}
          style={{
            height: 36,
            minWidth: 120,
            backgroundColor: "#0D4CB5",
            fontSize: 14,
            fontWeight: 700,
            paddingInline: 18,
          }}
        >
          Buat Tiket
        </Button>
      </Group>

      <CustomTable
        data={tableData}
        columns={columns}
        searchable
        isLoading={false}
        searchPlaceholder="Search Tiket Servis...."
        showFooter={false}
        emptyText="Data tiket servis tidak ditemukan"
        searchRightSection={
          <Select
            value={selectedStatusServis}
            onChange={setSelectedStatusServis}
            placeholder="Filter Status"
            clearable
            data={filterStatusServisOptions}
            styles={{
              input: {
                minWidth: 190,
                height: 44,
                borderRadius: 999,
              },
            }}
          />
        }
      />

      <TiketServisFormModal
  opened={opened}
  onClose={() => setOpened(false)}
  formType="create"
  nomorTiket=""
  tanggalMasuk={new Date()}
  dropPointOptions={[
    { value: "1", label: "Drop Point Jogja" },
    { value: "2", label: "Drop Point Sleman" },
  ]}
  onSubmit={async (data: any) => {
    console.log("DATA TIKET:", data);

    // nanti sambung API
    return true;
  }}
/>
    </Stack>
  );
}