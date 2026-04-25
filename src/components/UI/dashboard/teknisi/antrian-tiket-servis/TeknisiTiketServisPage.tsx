"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Menu,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { IconDotsVertical, IconEye } from "@tabler/icons-react";
import CustomTable, {
  type TableColumn,
} from "@/components/table/custom-table-search/CustomTableSearch";
import {
  getAntrianTiketServis,
  type StatusServis,
  type StatusVerifikasi,
  type TeknisiTiketServisApiItem,
} from "@/lib/teknisi/teknisi-tiket-servis.client";

type TeknisiTicketServisRow = {
  id: string;
  no: number;
  nomorTiket: string;
  namaCust: string;
  phoneCust: string;
  jenisPerangkat: string;
  merkPerangkat: string | null;
  statusVerifikasi: StatusVerifikasi;
  statusServis: StatusServis;
  tanggalMasuk: string;
};

const filterStatusServisOptions = [
  { value: "Belum_Diproses", label: "Belum Diproses" },
  { value: "Diproses", label: "Diproses" },
  { value: "Menunggu_Sparepart", label: "Menunggu Sparepart" },
];

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

function getPerangkatDisplay(row: TeknisiTicketServisRow) {
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

function mapTiketServis(data: TeknisiTiketServisApiItem[]) {
  return data.map((item, index): TeknisiTicketServisRow => {
    return {
      id: item.id,
      no: index + 1,
      nomorTiket: item.nomor_tiket,
      namaCust: item.nama_cust,
      phoneCust: item.phone_cust,
      jenisPerangkat: item.jenis_perangkat,
      merkPerangkat: item.merk_perangkat,
      statusVerifikasi: item.status_verifikasi,
      statusServis: item.status_servis,
      tanggalMasuk: item.tanggal_masuk,
    };
  });
}

export default function TeknisiTiketServisPage() {
  const router = useRouter();

  const [selectedStatusServis, setSelectedStatusServis] = useState<string | null>(
    null
  );
  const [tiketServis, setTiketServis] = useState<TeknisiTicketServisRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchTiketServis(status?: string | null) {
    try {
      setIsLoading(true);

      const result = await getAntrianTiketServis(status);
      setTiketServis(mapTiketServis(result.data || []));
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil antrian tiket servis.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchTiketServis(selectedStatusServis);
  }, [selectedStatusServis]);

  const tableData = useMemo(() => {
    return tiketServis.map((item, index) => ({
      ...item,
      no: index + 1,
    }));
  }, [tiketServis]);

  const columns: TableColumn<TeknisiTicketServisRow>[] = [
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
      key: "namaCust",
      label: "Nama Pelanggan",
      sortable: true,
      width: "16%",
      render: (row) => (
        <Text fw={700} fz={16} c="#111111">
          {row.namaCust}
        </Text>
      ),
    },
    {
      key: "phoneCust",
      label: "No HP",
      sortable: true,
      width: "12%",
      render: (row) => (
        <Text fz={16} c="#222222">
          {row.phoneCust || "N/A"}
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
                  `/teknisi/antrian-tiket-servis/${encodeURIComponent(
                    row.nomorTiket
                  )}`
                )
              }
            >
              Tampil Detail
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];

  return (
    <Stack gap={18}>
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
  );
}