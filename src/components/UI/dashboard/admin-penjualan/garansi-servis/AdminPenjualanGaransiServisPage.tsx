/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDotsVertical, IconEye, IconPlus } from "@tabler/icons-react";
import CustomTable, {
  type TableColumn,
} from "@/components/table/custom-table-search/CustomTableSearch";
import GaransiFormModal, {
  type GaransiFormPayload,
  type TiketSelesaiOption,
} from "@/components/UI/dashboard/admin-penjualan/garansi-servis/form/GaransiFormModal";
import GaransiDetailModal from "@/components/UI/dashboard/admin-penjualan/garansi-servis/modal/GaransiDetailModal";
import {
  createAdminPenjualanGaransiServis,
  getAdminPenjualanGaransiServis,
  getDetailAdminPenjualanGaransiServis,
  getGaransiServisTiketOptions,
  type AdminPenjualanGaransiApiItem,
  type GaransiTiketOptionApiItem,
  type StatusGaransiUi,
} from "@/lib/admin-penjualan/admin-penjualan-garansi-servis.client";

type GaransiRow = {
  id: string;
  no: number;
  nomorTiket: string;
  namaPelanggan: string;
  noHp: string;
  perangkat: string;
  tanggalServis: string;
  tanggalMulai: string;
  periodeHari: number;
  tanggalBerakhir: string;
  status: StatusGaransiUi;
  keteranganGaransi: string | null;
  totalPembayaran: string | number;
  admin: {
    id: string;
    nama: string;
    email: string;
  };
};

type AdminPenjualanGaransiServisPageProps = {
  initialGaransi?: AdminPenjualanGaransiApiItem[];
  initialTiketOptions?: GaransiTiketOptionApiItem[];
};

function getStatusGaransiColor(status: StatusGaransiUi) {
  const colors: Record<StatusGaransiUi, string> = {
    Aktif: "green",
    Habis: "yellow",
    Diklaim: "blue",
  };

  return colors[status];
}

function formatDateDisplay(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateInput(value: string | null | undefined) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function formatCurrency(value: string | number | null | undefined) {
  const numberValue = Number(value || 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numberValue) ? numberValue : 0);
}

function mapGaransiRow(item: AdminPenjualanGaransiApiItem): GaransiRow {
  return {
    id: item.id,
    no: 0,
    nomorTiket: item.nomor_tiket,
    namaPelanggan: item.nama_pelanggan,
    noHp: item.no_hp,
    perangkat: item.perangkat,
    tanggalServis: formatDateDisplay(item.tanggal_servis),
    tanggalMulai: formatDateDisplay(item.tanggal_mulai),
    periodeHari: item.periode_hari,
    tanggalBerakhir: formatDateDisplay(item.tanggal_akhir),
    status: item.status_display,
    keteranganGaransi: item.keterangan_garansi,
    totalPembayaran: item.total_pembayaran,
    admin: item.admin,
  };
}

function mapTiketOption(item: GaransiTiketOptionApiItem): TiketSelesaiOption {
  return {
    value: item.value,
    label: item.label,
    namaPelanggan: item.nama_pelanggan || item.namaPelanggan,
    perangkat: item.perangkat,
    tanggalServis: formatDateInput(item.tanggal_servis || item.tanggalServis),
  };
}

export default function AdminPenjualanGaransiServisPage({
  initialGaransi = [],
  initialTiketOptions = [],
}: AdminPenjualanGaransiServisPageProps) {
  const [garansi, setGaransi] = useState<GaransiRow[]>(() =>
    initialGaransi.map(mapGaransiRow)
  );
  const [tiketOptions, setTiketOptions] = useState<TiketSelesaiOption[]>(() =>
    initialTiketOptions.map(mapTiketOption)
  );
  const [openedForm, setOpenedForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openedDetail, setOpenedDetail] = useState(false);
  const [selectedGaransi, setSelectedGaransi] = useState<GaransiRow | null>(
    null
  );

  const hasFetchedOnMountRef = useRef(false);

  const tableData = useMemo(() => {
    return garansi.map((item, index) => ({
      ...item,
      no: index + 1,
    }));
  }, [garansi]);

  async function fetchGaransi() {
    const result = await getAdminPenjualanGaransiServis({
      page: 1,
      limit: 100,
    });

    const data = (result.data || []) as AdminPenjualanGaransiApiItem[];

    setGaransi(data.map(mapGaransiRow));
  }

  async function fetchTiketOptions() {
    const result = await getGaransiServisTiketOptions();

    const data = (result.data || []) as GaransiTiketOptionApiItem[];

    setTiketOptions(data.map(mapTiketOption));
  }

  async function fetchInitialData() {
    try {
      setIsLoading(true);

      await Promise.all([fetchGaransi(), fetchTiketOptions()]);
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data garansi servis.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (hasFetchedOnMountRef.current) {
      return;
    }

    hasFetchedOnMountRef.current = true;
    void fetchInitialData();
  }, []);

  async function handleOpenDetail(row: GaransiRow) {
    try {
      const result = await getDetailAdminPenjualanGaransiServis(row.id);
      const detail = result.data as AdminPenjualanGaransiApiItem;

      setSelectedGaransi(mapGaransiRow(detail));
      setOpenedDetail(true);
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil detail garansi servis.",
        color: "red",
      });
    }
  }

  async function handleSubmitGaransi(payload: GaransiFormPayload) {
    try {
      setIsSubmitting(true);

      await createAdminPenjualanGaransiServis({
        nomor_tiket: payload.nomorTiket,
        tanggal_mulai: payload.tanggalMulai,
        tanggal_akhir: payload.tanggalBerakhir,
        keterangan_garansi: `Garansi servis selama ${payload.periodeHari} hari`,
      });

      await Promise.all([fetchGaransi(), fetchTiketOptions()]);

      notifications.show({
        title: "Berhasil",
        message: "Garansi berhasil dibuat.",
        color: "green",
      });

      return true;
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error ? error.message : "Gagal membuat garansi.",
        color: "red",
      });

      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  const columns: TableColumn<GaransiRow>[] = [
    {
      key: "no",
      label: "No",
      sortable: true,
      width: "7%",
      align: "center",
      render: (row) => <Text fz={16}>{row.no}</Text>,
    },
    {
      key: "nomorTiket",
      label: "No. Tiket",
      sortable: true,
      width: "17%",
      render: (row) => (
        <Text fw={700} fz={16}>
          {row.nomorTiket}
        </Text>
      ),
    },
    {
      key: "namaPelanggan",
      label: "Nama Pelanggan",
      sortable: true,
      width: "18%",
      render: (row) => <Text fz={16}>{row.namaPelanggan}</Text>,
    },
    {
      key: "perangkat",
      label: "Perangkat",
      sortable: true,
      width: "18%",
      render: (row) => (
        <Text fz={16} lineClamp={2}>
          {row.perangkat}
        </Text>
      ),
    },
    {
      key: "tanggalServis",
      label: "Tanggal Servis",
      sortable: true,
      width: "14%",
      render: (row) => <Text fz={16}>{row.tanggalServis}</Text>,
    },
    {
      key: "periodeHari",
      label: "Masa Garansi",
      sortable: true,
      width: "13%",
      render: (row) => <Text fz={16}>{row.periodeHari} Hari</Text>,
    },
    {
      key: "tanggalBerakhir",
      label: "Tanggal Berakhir",
      sortable: true,
      width: "15%",
      render: (row) => <Text fz={16}>{row.tanggalBerakhir}</Text>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      width: "10%",
      align: "center",
      render: (row) => (
        <Badge
          color={getStatusGaransiColor(row.status)}
          variant="filled"
          radius="md"
          size="lg"
          style={{
            textTransform: "none",
          }}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: "aksi",
      label: "Aksi",
      width: "8%",
      align: "center",
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
              onClick={() => handleOpenDetail(row)}
            >
              Tampil Detail
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];

  return (
    <>
      <Stack gap={18}>
        <Group justify="flex-end">
          <Button
            radius="xl"
            leftSection={<IconPlus size={18} stroke={2.2} />}
            onClick={() => setOpenedForm(true)}
            style={{
              height: 38,
              minWidth: 160,
              backgroundColor: "#0D4CB5",
              fontSize: 16,
              fontWeight: 700,
              paddingInline: 22,
            }}
          >
            Buat Garansi
          </Button>
        </Group>

        <CustomTable
          data={tableData}
          columns={columns}
          searchable
          isLoading={isLoading}
          searchPlaceholder="Search No Tiket...."
          showFooter={false}
          emptyText="Data garansi tidak ditemukan"
        />
      </Stack>

      <GaransiFormModal
        opened={openedForm}
        onClose={() => setOpenedForm(false)}
        tiketOptions={tiketOptions}
        onSubmit={handleSubmitGaransi}
        isSubmitting={isSubmitting}
      />

      <GaransiDetailModal
        opened={openedDetail}
        onClose={() => setOpenedDetail(false)}
        data={selectedGaransi}
        formatCurrency={formatCurrency}
      />
    </>
  );
}