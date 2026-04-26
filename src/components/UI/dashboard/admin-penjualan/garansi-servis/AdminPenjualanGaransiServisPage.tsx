"use client";

import { useMemo, useState } from "react";
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

type StatusGaransi = "Aktif" | "Habis" | "Diklaim";

type GaransiRow = {
  id: string;
  no: number;
  nomorTiket: string;
  namaPelanggan: string;
  perangkat: string;
  tanggalServis: string;
  periodeHari: number;
  tanggalBerakhir: string;
  status: StatusGaransi;
};

const tiketSelesaiOptions: TiketSelesaiOption[] = [
  {
    value: "TSK-20260423-001",
    label: "TSK-20260423-001 - Anton Wijaya",
    namaPelanggan: "Anton Wijaya",
    perangkat: "Laptop - Asus VivoBook A412J",
    tanggalServis: "2026-04-23",
  },
  {
    value: "TSK-20260423-002",
    label: "TSK-20260423-002 - Rina Susanti",
    namaPelanggan: "Rina Susanti",
    perangkat: "Laptop - Lenovo Ideapad 330",
    tanggalServis: "2026-04-23",
  },
];

const initialGaransiData: GaransiRow[] = [
  {
    id: "1",
    no: 1,
    nomorTiket: "TSK-20260423-001",
    namaPelanggan: "Anton Wijaya",
    perangkat: "Laptop - Asus VivoBook A412J",
    tanggalServis: "23-04-2026",
    periodeHari: 30,
    tanggalBerakhir: "23-05-2026",
    status: "Aktif",
  },
  {
    id: "2",
    no: 2,
    nomorTiket: "TSK-20260423-002",
    namaPelanggan: "Rina Susanti",
    perangkat: "Laptop - Lenovo Ideapad 330",
    tanggalServis: "23-04-2026",
    periodeHari: 30,
    tanggalBerakhir: "23-05-2026",
    status: "Aktif",
  },
  {
    id: "3",
    no: 3,
    nomorTiket: "TSK-20260420-004",
    namaPelanggan: "Budi Hartono",
    perangkat: "PC - Custom",
    tanggalServis: "20-04-2026",
    periodeHari: 60,
    tanggalBerakhir: "20-06-2026",
    status: "Habis",
  },
  {
    id: "4",
    no: 4,
    nomorTiket: "TSK-20260418-006",
    namaPelanggan: "Andi Saputra",
    perangkat: "Laptop - HP Pavilion 14",
    tanggalServis: "18-04-2026",
    periodeHari: 60,
    tanggalBerakhir: "18-06-2026",
    status: "Diklaim",
  },
];

function getStatusGaransiColor(status: StatusGaransi) {
  const colors: Record<StatusGaransi, string> = {
    Aktif: "green",
    Habis: "yellow",
    Diklaim: "blue",
  };

  return colors[status];
}

function formatDateDisplay(value: string) {
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

export default function AdminPenjualanGaransiServisPage() {
    const [garansi, setGaransi] = useState<GaransiRow[]>(initialGaransiData);
    const [openedForm, setOpenedForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openedDetail, setOpenedDetail] = useState(false);
    const [selectedGaransi, setSelectedGaransi] = useState<GaransiRow | null>(null);

  const tableData = useMemo(() => {
    return garansi.map((item, index) => ({
      ...item,
      no: index + 1,
    }));
  }, [garansi]);

  async function handleOpenDetail(row: GaransiRow) {
    setSelectedGaransi(row);
    setOpenedDetail(true);
  }

  async function handleSubmitGaransi(payload: GaransiFormPayload) {
    try {
      setIsSubmitting(true);

      setGaransi((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          no: prev.length + 1,
          nomorTiket: payload.nomorTiket,
          namaPelanggan: payload.namaPelanggan,
          perangkat: payload.perangkat,
          tanggalServis: formatDateDisplay(payload.tanggalMulai),
          periodeHari: payload.periodeHari,
          tanggalBerakhir: formatDateDisplay(payload.tanggalBerakhir),
          status: "Aktif",
        },
      ]);

      notifications.show({
        title: "Berhasil",
        message: "Garansi berhasil dibuat.",
        color: "green",
      });

      return true;
    } catch {
      notifications.show({
        title: "Gagal",
        message: "Gagal membuat garansi.",
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
          isLoading={false}
          searchPlaceholder="Search No Tiket...."
          showFooter={false}
          emptyText="Data garansi tidak ditemukan"
        />
      </Stack>

      <GaransiFormModal
        opened={openedForm}
        onClose={() => setOpenedForm(false)}
        tiketOptions={tiketSelesaiOptions}
        onSubmit={handleSubmitGaransi}
        isSubmitting={isSubmitting}
      />

      <GaransiDetailModal
        opened={openedDetail}
        onClose={() => setOpenedDetail(false)}
        data={selectedGaransi}
      />
    </>
  );
}