"use client";

import { useEffect, useState } from "react";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Group,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import type { FormType } from "@/types/form-types";
import CustomTable, {
  type TableColumn,
} from "@/components/table/custom-table-search/CustomTableSearch";
import PegawaiFormModal, {
  type PegawaiFormInitialData,
  type PegawaiFormPayload,
  type PegawaiRoleOption,
} from "@/components/UI/dashboard/owner/form/PegawaiFormModal";
import {
  createOwnerPegawaiRequest,
  deleteOwnerPegawaiRequest,
  getOwnerPegawaiListRequest,
  updateOwnerPegawaiRequest,
  type OwnerPegawaiRow,
} from "@/lib/owner/owner-pegawai.client";

type PegawaiRow = {
  id: string;
  nama: string;
  email: string;
  roleId: string;
  roleLabel: string;
  phone: string;
  address: string | null;
  photoUrl: string | null;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "P";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getRoleBadgeColor(role: string) {
  const normalized = role.trim().toLowerCase();

  if (normalized === "owner") return "violet";
  if (normalized.includes("penjualan")) return "blue";
  if (normalized.includes("gudang")) return "cyan";
  if (normalized.includes("teknisi")) return "green";

  return "gray";
}

function mapApiEmployeeToRow(employee: OwnerPegawaiRow): PegawaiRow {
  return {
    id: employee.id,
    nama: employee.nama,
    email: employee.email,
    roleId: employee.roleId,
    roleLabel: employee.roleName,
    phone: employee.phone ?? "",
    address: employee.address,
    photoUrl: employee.photoProfilePath,
  };
}

export default function KelolaPegawaiPage() {
  const [pegawai, setPegawai] = useState<PegawaiRow[]>([]);
  const [roleOptions, setRoleOptions] = useState<PegawaiRoleOption[]>([]);
  const [opened, setOpened] = useState(false);
  const [formType, setFormType] = useState<FormType>("create");
  const [selectedPegawai, setSelectedPegawai] =
    useState<PegawaiFormInitialData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    void loadPegawaiData();
  }, []);

  async function loadPegawaiData() {
    try {
      setIsLoading(true);

      const result = await getOwnerPegawaiListRequest();

      if (!result.success) {
        notifications.show({
          title: "Gagal",
          message: result.message,
          color: "red",
        });
        return;
      }

      setPegawai(result.employees.map(mapApiEmployeeToRow));
      setRoleOptions(result.availableRoles);
    } finally {
      setIsLoading(false);
    }
  }

  function handleTambahPegawai() {
    setFormType("create");
    setSelectedPegawai(null);
    setOpened(true);
  }

  function handleOpenEditPegawai(row: PegawaiRow) {
    setFormType("edit");
    setSelectedPegawai({
      id: row.id,
      nama: row.nama,
      email: row.email,
      phone: row.phone,
      address: row.address,
      id_roles: row.roleId,
      photo_profile_path: row.photoUrl,
    });
    setOpened(true);
  }

  async function handleDeletePegawai(row: PegawaiRow) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus pegawai ${row.nama}?`
    );

    if (!confirmed) {
      return;
    }

    const result = await deleteOwnerPegawaiRequest(row.id);

    if (!result.success) {
      notifications.show({
        title: "Gagal",
        message: result.message,
        color: "red",
      });
      return;
    }

    setPegawai((prev) => prev.filter((item) => item.id !== row.id));

    notifications.show({
      title: "Berhasil",
      message: result.message,
      color: "green",
    });
  }

  async function handleSubmitPegawai(
    payload: PegawaiFormPayload,
    currentFormType: FormType
  ): Promise<boolean> {
    const formData = new FormData();
    formData.append("nama", payload.nama);
    formData.append("email", payload.email);
    formData.append("phone", payload.phone);
    formData.append("address", payload.address ?? "");
    formData.append("id_roles", payload.id_roles);

    if (payload.password) {
      formData.append("password", payload.password);
    }

    if (payload.photoFile) {
      formData.append("photo", payload.photoFile);
    }

    if (payload.removePhoto) {
      formData.append("remove_photo", "1");
    }

    if (currentFormType === "create") {
      const result = await createOwnerPegawaiRequest(formData);

      if (!result.success) {
        notifications.show({
          title: "Gagal",
          message: result.message,
          color: "red",
        });
        return false;
      }

      setPegawai((prev) => [mapApiEmployeeToRow(result.employee), ...prev]);

      notifications.show({
        title: "Berhasil",
        message: result.message,
        color: "green",
      });

      return true;
    }

    if (!selectedPegawai?.id) {
      notifications.show({
        title: "Gagal",
        message: "Data pegawai yang diedit tidak ditemukan.",
        color: "red",
      });
      return false;
    }

    const result = await updateOwnerPegawaiRequest(selectedPegawai.id, formData);

    if (!result.success) {
      notifications.show({
        title: "Gagal",
        message: result.message,
        color: "red",
      });
      return false;
    }

    setPegawai((prev) =>
      prev.map((item) =>
        item.id === selectedPegawai.id
          ? mapApiEmployeeToRow(result.employee)
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

  const columns: TableColumn<PegawaiRow>[] = [
    {
      key: "nama",
      label: "Nama Pegawai",
      sortable: true,
      width: "36%",
      render: (row) => (
        <Group gap={14} wrap="nowrap">
          <Avatar
            size={48}
            radius="xl"
            src={row.photoUrl || undefined}
            color="blue"
          >
            {getInitials(row.nama)}
          </Avatar>

          <Text fw={700} fz={17} c="#111111">
            {row.nama}
          </Text>
        </Group>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      width: "32%",
      render: (row) => (
        <Text fz={17} c="#222222">
          {row.email}
        </Text>
      ),
    },
    {
      key: "roleLabel",
      label: "Role",
      sortable: true,
      width: "22%",
      render: (row) => (
        <Badge
          color={getRoleBadgeColor(row.roleLabel)}
          variant="light"
          radius="sm"
          styles={{
            label: {
              fontSize: 13,
              fontWeight: 700,
            },
          }}
        >
          {row.roleLabel}
        </Badge>
      ),
    },
    {
      key: "aksi",
      label: "Aksi",
      width: "10%",
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
              aria-label={`Aksi untuk ${row.nama}`}
              onClick={(event) => event.stopPropagation()}
            >
              <IconDotsVertical size={20} stroke={2} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEdit size={16} stroke={1.9} />}
              onClick={() => handleOpenEditPegawai(row)}
            >
              Edit
            </Menu.Item>

            <Menu.Item
              color="red"
              leftSection={<IconTrash size={16} stroke={1.9} />}
              onClick={() => void handleDeletePegawai(row)}
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
            onClick={handleTambahPegawai}
            style={{
              height: 44,
              minWidth: 160,
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
          data={pegawai}
          columns={columns}
          searchable
          isLoading={isLoading}
          searchPlaceholder="Cari berdasarkan nama pegawai..."
          showFooter={false}
          emptyText="Data pegawai tidak ditemukan"
        />
      </Stack>

      <PegawaiFormModal
        opened={opened}
        onClose={() => setOpened(false)}
        formType={formType}
        roleOptions={roleOptions}
        initialData={selectedPegawai}
        onSubmit={handleSubmitPegawai}
      />
    </>
  );
}