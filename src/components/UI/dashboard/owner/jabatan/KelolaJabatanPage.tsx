"use client";

import { useEffect, useState } from "react";
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
import JabatanFormModal, {
  type JabatanFormInitialData,
  type JabatanFormPayload,
} from "@/components/UI/dashboard/owner/jabatan/form/JabatanFormModal";
import JabatanDetailModal, {
  type OwnerJabatanDetailRow,
} from "@/components/UI/dashboard/owner/jabatan/modal/JabatanDetailModal";
import {
  createOwnerJabatanRequest,
  deleteOwnerJabatanRequest,
  getOwnerJabatanDetailRequest,
  getOwnerJabatanListRequest,
  updateOwnerJabatanRequest,
  type OwnerJabatanRow,
} from "@/lib/owner/owner-jabatan.client";

type JabatanRow = {
  id: string;
  nama_roles: string;
  jumlah_user: number;
  isProtected: boolean;
};

function mapApiJabatanToRow(jabatan: OwnerJabatanRow): JabatanRow {
  return {
    id: jabatan.id,
    nama_roles: jabatan.nama_roles,
    jumlah_user: jabatan.jumlah_user,
    isProtected: jabatan.isProtected,
  };
}

function getRoleBadgeColor(role: string) {
  const normalized = role.trim().toLowerCase();

  if (normalized === "owner") return "violet";
  if (normalized.includes("penjualan")) return "blue";
  if (normalized.includes("gudang")) return "cyan";
  if (normalized.includes("teknisi")) return "green";

  return "gray";
}

export default function KelolaJabatanPage() {
  const [jabatan, setJabatan] = useState<JabatanRow[]>([]);
  const [opened, setOpened] = useState(false);
  const [formType, setFormType] = useState<FormType>("create");
  const [selectedJabatan, setSelectedJabatan] =
    useState<JabatanFormInitialData | null>(null);

  const [detailOpened, setDetailOpened] = useState(false);
  const [selectedDetailJabatan, setSelectedDetailJabatan] =
    useState<OwnerJabatanDetailRow | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    void loadJabatanData();
  }, []);

  async function loadJabatanData() {
    try {
      setIsLoading(true);

      const result = await getOwnerJabatanListRequest();

      if (!result.success) {
        notifications.show({
          title: "Gagal",
          message: result.message,
          color: "red",
        });
        return;
      }

      setJabatan(result.jabatan.map(mapApiJabatanToRow));
    } finally {
      setIsLoading(false);
    }
  }

  function handleTambahJabatan() {
    setFormType("create");
    setSelectedJabatan(null);
    setOpened(true);
  }

  async function handleTampilJabatan(row: JabatanRow) {
    const result = await getOwnerJabatanDetailRequest(row.id);

    if (!result.success) {
      notifications.show({
        title: "Gagal",
        message: result.message,
        color: "red",
      });
      return;
    }

    setSelectedDetailJabatan(result.jabatan);
    setDetailOpened(true);
  }

  function handleOpenEditJabatan(row: JabatanRow) {
    if (row.isProtected) {
      notifications.show({
        title: "Tidak dapat diedit",
        message: "Role Owner tidak dapat diubah dari menu ini.",
        color: "yellow",
      });
      return;
    }

    setFormType("edit");
    setSelectedJabatan({
      id: row.id,
      nama_roles: row.nama_roles,
    });
    setOpened(true);
  }

  async function handleDeleteJabatan(row: JabatanRow) {
    if (row.isProtected) {
      notifications.show({
        title: "Tidak dapat dihapus",
        message: "Role Owner tidak dapat dihapus dari menu ini.",
        color: "yellow",
      });
      return;
    }

    modals.openConfirmModal({
      title: "Konfirmasi Hapus Jabatan",
      centered: true,
      radius: "lg",
      children: (
        <Stack gap={6}>
          <Text size="sm">
            Apakah kamu yakin ingin menghapus jabatan{" "}
            <b>{row.nama_roles}</b>?
          </Text>

          {row.jumlah_user > 0 ? (
            <Text size="sm" c="red">
              Jabatan ini masih digunakan oleh {row.jumlah_user} user, sehingga
              tidak dapat dihapus.
            </Text>
          ) : null}
        </Stack>
      ),
      labels: {
        confirm: "Ya, Hapus",
        cancel: "Batal",
      },
      confirmProps: {
        color: "red",
        radius: "md",
        disabled: row.jumlah_user > 0,
      },
      cancelProps: {
        radius: "md",
      },
      onConfirm: async () => {
        const result = await deleteOwnerJabatanRequest(row.id);

        if (!result.success) {
          notifications.show({
            title: "Gagal",
            message: result.message,
            color: "red",
          });
          return;
        }

        setJabatan((prev) => prev.filter((item) => item.id !== row.id));

        notifications.show({
          title: "Berhasil",
          message: result.message,
          color: "green",
        });
      },
    });
  }

  async function handleSubmitJabatan(
    payload: JabatanFormPayload,
    currentFormType: FormType
  ): Promise<boolean> {
    if (currentFormType === "create") {
      const result = await createOwnerJabatanRequest(payload);

      if (!result.success) {
        notifications.show({
          title: "Gagal",
          message: result.message,
          color: "red",
        });
        return false;
      }

      setJabatan((prev) => [mapApiJabatanToRow(result.jabatan), ...prev]);

      notifications.show({
        title: "Berhasil",
        message: result.message,
        color: "green",
      });

      return true;
    }

    if (!selectedJabatan?.id) {
      notifications.show({
        title: "Gagal",
        message: "Data jabatan yang diedit tidak ditemukan.",
        color: "red",
      });
      return false;
    }

    const result = await updateOwnerJabatanRequest(
      selectedJabatan.id,
      payload
    );

    if (!result.success) {
      notifications.show({
        title: "Gagal",
        message: result.message,
        color: "red",
      });
      return false;
    }

    setJabatan((prev) =>
      prev.map((item) =>
        item.id === selectedJabatan.id
          ? mapApiJabatanToRow(result.jabatan)
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

  const columns: TableColumn<JabatanRow>[] = [
    {
      key: "nama_roles",
      label: "Nama Jabatan",
      sortable: true,
      width: "52%",
      render: (row) => (
        <Group gap={10} wrap="wrap">
          <Text fw={700} fz={17} c="#111111">
            {row.nama_roles}
          </Text>

          {row.isProtected ? (
            <Badge color="violet" variant="light" radius="sm">
              Protected
            </Badge>
          ) : null}
        </Group>
      ),
    },
    {
      key: "jumlah_user",
      label: "Jumlah User",
      sortable: true,
      width: "32%",
      render: (row) => (
        <Badge
          color={getRoleBadgeColor(row.nama_roles)}
          variant="light"
          radius="sm"
          styles={{
            label: {
              fontSize: 13,
              fontWeight: 700,
            },
          }}
        >
          {row.jumlah_user} User
        </Badge>
      ),
    },
    {
      key: "aksi",
      label: "Aksi",
      width: "16%",
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
              aria-label={`Aksi untuk ${row.nama_roles}`}
              onClick={(event) => event.stopPropagation()}
            >
              <IconDotsVertical size={20} stroke={2} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEye size={16} stroke={1.9} />}
              onClick={() => void handleTampilJabatan(row)}
            >
              Tampil
            </Menu.Item>

            <Menu.Item
              leftSection={<IconEdit size={16} stroke={1.9} />}
              disabled={row.isProtected}
              onClick={() => handleOpenEditJabatan(row)}
            >
              Edit
            </Menu.Item>

            <Menu.Item
              color="red"
              leftSection={<IconTrash size={16} stroke={1.9} />}
              disabled={row.isProtected || row.jumlah_user > 0}
              onClick={() => void handleDeleteJabatan(row)}
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
            onClick={handleTambahJabatan}
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
          data={jabatan}
          columns={columns}
          searchable
          isLoading={isLoading}
          searchPlaceholder="Cari berdasarkan nama jabatan..."
          showFooter={false}
          emptyText="Data jabatan tidak ditemukan"
        />
      </Stack>

      <JabatanFormModal
        opened={opened}
        onClose={() => setOpened(false)}
        formType={formType}
        initialData={selectedJabatan}
        onSubmit={handleSubmitJabatan}
      />

      <JabatanDetailModal
        opened={detailOpened}
        onClose={() => setDetailOpened(false)}
        jabatan={selectedDetailJabatan}
      />
    </>
  );
}