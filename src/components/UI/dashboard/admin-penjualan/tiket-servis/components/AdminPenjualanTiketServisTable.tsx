"use client";

import { ActionIcon, Badge, Menu, Text } from "@mantine/core";
import { IconCash, IconDotsVertical, IconEdit, IconEye } from "@tabler/icons-react";
import type { TableColumn } from "@/components/table/custom-table-search/CustomTableSearch";
import type { AdminPenjualanTiketPageRow } from "./AdminPenjualanTiketServisPage.types";
import {
  formatDisplayDate,
  getPerangkatDisplay,
  getStatusServisColor,
  getStatusServisLabel,
  getStatusVerifikasiColor,
  getStatusVerifikasiLabel,
} from "@/components/UI/dashboard/admin-penjualan/tiket-servis/components/adminPenjualanTiketServisPage.helpers";

type GetColumnsParams = {
  onEdit: (row: AdminPenjualanTiketPageRow) => void;
  onDetail: (row: AdminPenjualanTiketPageRow) => void;
  onPayment: (row: AdminPenjualanTiketPageRow) => void;
};

export function getAdminPenjualanTiketServisColumns({
  onEdit,
  onDetail,
  onPayment,
}: GetColumnsParams): TableColumn<AdminPenjualanTiketPageRow>[] {
  return [
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
        <Menu shadow="md" width={180} position="bottom-end" withinPortal>
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
              leftSection={<IconEdit size={16} />}
              onClick={() => onEdit(row)}
            >
              Edit Tiket
            </Menu.Item>

            <Menu.Item
              leftSection={<IconEye size={16} stroke={1.9} />}
              onClick={() => onDetail(row)}
            >
              Tampil Detail
            </Menu.Item>

            <Menu.Item
              leftSection={<IconCash size={16} stroke={1.9} />}
              onClick={() => onPayment(row)}
            >
              Bayar
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];
}