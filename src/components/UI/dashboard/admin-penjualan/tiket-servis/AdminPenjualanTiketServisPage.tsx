/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
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
import { notifications } from "@mantine/notifications";
import {
  IconCash,
  IconDotsVertical,
  IconEye,
  IconPlus,
} from "@tabler/icons-react";
import CustomTable, {
  type TableColumn,
} from "@/components/table/custom-table-search/CustomTableSearch";

import type {
  AdminPenjualanTicketDropPointOption,
  AdminPenjualanTicketRow,
  AdminPenjualanTicketStatusServis,
  AdminPenjualanTicketStatusVerifikasi,
} from "@/types/admin-penjualan-tiket-servis-form.types";
import {
  createAdminPenjualanTiketServis,
  getAdminPenjualanNomorTiketRequest,
  getAdminPenjualanTiketServis,
  type AdminPenjualanTiketApiItem,
  type StatusServis,
  type StatusVerifikasi,
} from "@/lib/admin-penjualan/admin-penjualan-tiket-servis.client";
import TiketServisFormModal from "@/components/UI/public/form/TiketServisFormModal";

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

const dropPointOptions: AdminPenjualanTicketDropPointOption[] = [];

function formatDisplayDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

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

function mapTiketServis(data: AdminPenjualanTiketApiItem[]) {
  return data.map((item, index): AdminPenjualanTiketRow => {
    return {
      id: item.id,
      no: index + 1,
      nomorTiket: item.nomor_tiket,
      namaPelanggan: item.nama_cust,
      noHp: item.phone_cust,
      jenisPerangkat: item.jenis_perangkat,
      merkPerangkat: item.merk_perangkat,
      statusVerifikasi: item.status_verifikasi,
      statusServis: item.status_servis,
      tanggalMasuk: item.tanggal_masuk,
    };
  });
}

function normalizeStatusServisForForm(status: StatusServis): AdminPenjualanTicketRow["status_servis"] {
  const labels: Record<StatusServis, AdminPenjualanTicketRow["status_servis"]> = {
    Belum_Diproses: "Belum Diproses",
    Diproses: "Diproses",
    Menunggu_Sparepart: "Menunggu Sparepart",
    Selesai: "Selesai",
    Diambil: "Diambil",
    Dibatalkan: "Dibatalkan",
  };

  return labels[status];
}

export default function AdminPenjualanTiketServisPage() {
  const router = useRouter();

  const [opened, setOpened] = useState(false);
  const [selectedStatusServis, setSelectedStatusServis] = useState<
    string | null
  >(null);
  const [tiketServis, setTiketServis] = useState<AdminPenjualanTiketRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tanggalMasuk] = useState(new Date());
  const [nomorTiket, setNomorTiket] = useState("");

  const tableData = useMemo(() => {
    const filtered = selectedStatusServis
      ? tiketServis.filter(
          (item) =>
            item.statusVerifikasi === selectedStatusServis ||
            item.statusServis === selectedStatusServis
        )
      : tiketServis;

    return filtered.map((item, index) => ({
      ...item,
      no: index + 1,
    }));
  }, [selectedStatusServis, tiketServis]);

  async function fetchTiketServis() {
    try {
      setIsLoading(true);

      const result = await getAdminPenjualanTiketServis();
      setTiketServis(mapTiketServis(result.data || []));
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data tiket servis.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function prepareNomorTiket(date = new Date()) {
  try {
    setNomorTiket("");

    const result = await getAdminPenjualanNomorTiketRequest({
      tanggal_masuk: date.toISOString(),
    });

    if (!result.success) {
      notifications.show({
        title: "Gagal",
        message: result.message,
        color: "red",
      });
      return;
    }

    setNomorTiket(result.nomor_tiket);
  } catch (error) {
    notifications.show({
      title: "Gagal",
      message:
        error instanceof Error
          ? error.message
          : "Gagal membuat nomor tiket.",
      color: "red",
    });
  }
}

  useEffect(() => {
    fetchTiketServis();
  }, []);

  function handleOpenCreate() {
  const now = new Date();

  setOpened(true);
  void prepareNomorTiket(now);
}

  async function handleSubmitTiketServis(
    ticket: AdminPenjualanTicketRow,
    _formType: any
  ): Promise<boolean> {
    try {
await createAdminPenjualanTiketServis({
  nomor_tiket: ticket.nomor_tiket,
  nama_cust: ticket.nama_cust,
  phone_cust: ticket.phone_cust,
  alamat_cust: ticket.alamat_cust || null,
  jenis_perangkat: ticket.jenis_perangkat,
  merk_perangkat: ticket.merk_perangkat || null,
  keluhan: ticket.keluhan,
  id_drop_point: ticket.gunakan_drop_point ? ticket.drop_point_id : null,
});

      notifications.show({
        title: "Berhasil",
        message: "Tiket servis berhasil dibuat.",
        color: "green",
      });

      await fetchTiketServis();
      return true;
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal membuat tiket servis.",
        color: "red",
      });

      return false;
    }
  }

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
          {formatDisplayDate(row.tanggalMasuk)}
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
              onClick={() =>
                router.push(
                  `/admin_penjualan/tiket-servis/${encodeURIComponent(
                    row.nomorTiket
                  )}/pembayaran`
                )
              }
            >
              Bayar
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];

  return (
    <>
      <Stack gap={18}>
        <Group justify="space-between" align="center">
          <Button
            radius="xl"
            leftSection={<IconPlus size={18} stroke={2.2} />}
            onClick={handleOpenCreate}
            style={{
              height: 36,
              minWidth: 120,
              backgroundColor: "#0D4CB5",
              fontSize: 14,
              fontWeight: 700,
              paddingInline: 18,
              marginLeft: "auto",
            }}
          >
            Buat Tiket
          </Button>
        </Group>

        <CustomTable
          data={tableData}
          columns={columns}
          searchable
          isLoading={isLoading}
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
      </Stack>

<TiketServisFormModal
  opened={opened}
  onClose={() => setOpened(false)}
  formType="create"
  nomorTiket={nomorTiket}
  tanggalMasuk={tanggalMasuk}
  dropPointOptions={dropPointOptions}
  initialData={null}
  onSubmit={handleSubmitTiketServis}
/>
    </>
  );
}