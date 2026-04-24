"use client";

import { useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Menu,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import {
  IconDotsVertical,
  IconEye,
} from "@tabler/icons-react";
import CustomTable, {
  type TableColumn,
} from "@/components/table/custom-table-search/CustomTableSearch";
import {
  filterStatusServisOptions,
  formatDisplayDate,
  getPerangkatDisplay,
  getStatusServisColor,
  getStatusServisLabel,
  getStatusVerifikasiColor,
  getStatusVerifikasiLabel,
  teknisiTicketServisData,
  type TeknisiTicketServisRecord,
} from "@/lib/dummy/tiket-servis-teknisi.mock";

export default function TeknisiTiketServisPage() {
  const router = useRouter();
  const [selectedStatusServis, setSelectedStatusServis] = useState<string | null>(
    null
  );

  const filteredData = useMemo(() => {
    if (!selectedStatusServis) {
      return teknisiTicketServisData;
    }

    return teknisiTicketServisData.filter(
      (item) => item.statusServis === selectedStatusServis
    );
  }, [selectedStatusServis]);

  const tableData = useMemo(() => {
    return filteredData.map((item, index) => ({
      ...item,
      no: index + 1,
    }));
  }, [filteredData]);

  const columns: TableColumn<(TeknisiTicketServisRecord & { no: number })>[] = [
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
                  `/teknisi/antrian-tiket-servis/${encodeURIComponent(row.nomorTiket)}`
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
    </Stack>
  );
}