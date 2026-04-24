"use client";

import { useEffect, useState } from "react";
import {
  ActionIcon,
  Button,
  Group,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import {
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import type { FormType } from "@/types/form-types";
import CustomTable, {
  type TableColumn,
} from "@/components/table/custom-table-search/CustomTableSearch";
import DropPointFormModal, {
  type DropPointFormInitialData,
  type DropPointFormPayload,
} from "@/components/UI/dashboard/owner/form/DropPointFormModal";
import DropPointDetailModal, {
  type OwnerDropPointDetailRow,
} from "@/components/UI/dashboard/owner/modal/DropPointDetailModal";
import {
  createOwnerDropPointRequest,
  deleteOwnerDropPointRequest,
  getOwnerDropPointDetailRequest,
  getOwnerDropPointListRequest,
  updateOwnerDropPointRequest,
  type OwnerDropPointRow,
} from "@/lib/owner/owner-drop-point.client";

type DropPointRow = {
  id: string;
  nama_drop_point: string;
  alamat: string;
  phone: string | null;
  jam_operasional: string | null;
};

function mapApiDropPointToRow(dropPoint: OwnerDropPointRow): DropPointRow {
  return {
    id: dropPoint.id,
    nama_drop_point: dropPoint.nama_drop_point,
    alamat: dropPoint.alamat,
    phone: dropPoint.phone,
    jam_operasional: dropPoint.jam_operasional,
  };
}

export default function OwnerDropPointPage() {
  const [dropPoints, setDropPoints] = useState<DropPointRow[]>([]);
  const [opened, setOpened] = useState(false);
  const [formType, setFormType] = useState<FormType>("create");
  const [selectedDropPoint, setSelectedDropPoint] =
    useState<DropPointFormInitialData | null>(null);

  const [detailOpened, setDetailOpened] = useState(false);
  const [selectedDetailDropPoint, setSelectedDetailDropPoint] =
    useState<OwnerDropPointDetailRow | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    void loadDropPointData();
  }, []);

  async function loadDropPointData() {
    try {
      setIsLoading(true);

      const result = await getOwnerDropPointListRequest();

      if (!result.success) {
        notifications.show({
          title: "Gagal",
          message: result.message,
          color: "red",
        });
        return;
      }

      setDropPoints(result.dropPoints.map(mapApiDropPointToRow));
    } finally {
      setIsLoading(false);
    }
  }

  function handleTambahDropPoint() {
    setFormType("create");
    setSelectedDropPoint(null);
    setOpened(true);
  }

  async function handleTampilDropPoint(row: DropPointRow) {
    const result = await getOwnerDropPointDetailRequest(row.id);

    if (!result.success) {
      notifications.show({
        title: "Gagal",
        message: result.message,
        color: "red",
      });
      return;
    }

    setSelectedDetailDropPoint(result.dropPoint);
    setDetailOpened(true);
  }

  function handleOpenEditDropPoint(row: DropPointRow) {
    setFormType("edit");
    setSelectedDropPoint({
      id: row.id,
      nama_drop_point: row.nama_drop_point,
      alamat: row.alamat,
      phone: row.phone,
      jam_operasional: row.jam_operasional,
    });
    setOpened(true);
  }

  async function handleDeleteDropPoint(row: DropPointRow) {
    modals.openConfirmModal({
      title: "Konfirmasi Hapus Drop Point",
      centered: true,
      radius: "lg",
      children: (
        <Text size="sm">
          Apakah kamu yakin ingin menghapus drop point{" "}
          <b>{row.nama_drop_point}</b>?
        </Text>
      ),
      labels: {
        confirm: "Ya, Hapus",
        cancel: "Batal",
      },
      confirmProps: {
        color: "red",
        radius: "md",
      },
      cancelProps: {
        radius: "md",
      },
      onConfirm: async () => {
        const result = await deleteOwnerDropPointRequest(row.id);

        if (!result.success) {
          notifications.show({
            title: "Gagal",
            message: result.message,
            color: "red",
          });
          return;
        }

        setDropPoints((prev) => prev.filter((item) => item.id !== row.id));

        notifications.show({
          title: "Berhasil",
          message: result.message,
          color: "green",
        });
      },
    });
  }

  async function handleSubmitDropPoint(
    payload: DropPointFormPayload,
    currentFormType: FormType
  ): Promise<boolean> {
    if (currentFormType === "create") {
      const result = await createOwnerDropPointRequest(payload);

      if (!result.success) {
        notifications.show({
          title: "Gagal",
          message: result.message,
          color: "red",
        });
        return false;
      }

      setDropPoints((prev) => [mapApiDropPointToRow(result.dropPoint), ...prev]);

      notifications.show({
        title: "Berhasil",
        message: result.message,
        color: "green",
      });

      return true;
    }

    if (!selectedDropPoint?.id) {
      notifications.show({
        title: "Gagal",
        message: "Data drop point yang diedit tidak ditemukan.",
        color: "red",
      });
      return false;
    }

    const result = await updateOwnerDropPointRequest(selectedDropPoint.id, payload);

    if (!result.success) {
      notifications.show({
        title: "Gagal",
        message: result.message,
        color: "red",
      });
      return false;
    }

    setDropPoints((prev) =>
      prev.map((item) =>
        item.id === selectedDropPoint.id
          ? mapApiDropPointToRow(result.dropPoint)
          : item
      )
    );

    notifications.show({
      title: "Berhasil",
      message: result.message,
      color: "green",
    });

    return true;
  }

  const columns: TableColumn<DropPointRow>[] = [
    {
      key: "nama_drop_point",
      label: "Nama Drop Point",
      sortable: true,
      width: "24%",
      render: (row) => (
        <Text fw={600} fz={16} c="#111111">
          {row.nama_drop_point}
        </Text>
      ),
    },
    {
      key: "alamat",
      label: "Address",
      sortable: true,
      width: "22%",
      render: (row) => (
        <Text fz={16} c="#222222">
          {row.alamat}
        </Text>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      sortable: true,
      width: "18%",
      render: (row) => (
        <Text fz={16} c="#222222">
          {row.phone ?? "-"}
        </Text>
      ),
    },
    {
      key: "jam_operasional",
      label: "Jam Operasional",
      width: "28%",
      render: (row) => (
        <Text
          fz={16}
          c="#222222"
          lh={1.45}
          style={{
            whiteSpace: "pre-line",
          }}
        >
          {row.jam_operasional ?? "-"}
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
              aria-label={`Aksi untuk ${row.nama_drop_point}`}
              onClick={(event) => event.stopPropagation()}
            >
              <IconDotsVertical size={20} stroke={2} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEdit size={16} stroke={1.9} />}
              onClick={() => handleOpenEditDropPoint(row)}
            >
              Edit
            </Menu.Item>

            <Menu.Item
              leftSection={<IconEye size={16} stroke={1.9} />}
              onClick={() => void handleTampilDropPoint(row)}
            >
              Tampil
            </Menu.Item>

            <Menu.Item
              color="red"
              leftSection={<IconTrash size={16} stroke={1.9} />}
              onClick={() => void handleDeleteDropPoint(row)}
            >
              Delete
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
            leftSection={<IconPlus size={20} stroke={2.2} />}
            onClick={handleTambahDropPoint}
            style={{
              height: 44,
              minWidth: 150,
              backgroundColor: "#0D4CB5",
              fontSize: 18,
              fontWeight: 700,
              paddingInline: 24,
            }}
          >
            Tambah
          </Button>
        </Group>

        <CustomTable
          data={dropPoints}
          columns={columns}
          searchable
          isLoading={isLoading}
          searchPlaceholder="Search..."
          showFooter={false}
          emptyText="Data tidak ditemukan"
        />
      </Stack>

      <DropPointFormModal
        opened={opened}
        onClose={() => setOpened(false)}
        formType={formType}
        initialData={selectedDropPoint}
        onSubmit={handleSubmitDropPoint}
      />

      <DropPointDetailModal
        opened={detailOpened}
        onClose={() => setDetailOpened(false)}
        dropPoint={selectedDetailDropPoint}
      />
    </>
  );
}