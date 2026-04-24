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
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
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
import SuppliersFormModal, {
  type SuppliersFormInitialData,
  type SuppliersFormPayload,
} from "@/components/UI/dashboard/admin-gudang/suppliers/form/SuppliersFormModal";
import SuppliersDetailModal from "@/components/UI/dashboard/admin-gudang/suppliers/modal/SuppliersDetailModal";
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
  type SupplierApiItem,
} from "@/lib/admin-gudang/admin-gudang-suppliers.client";

type SupplierRow = {
  id: string;
  no: number;
  nama: string;
  address: string | null;
  phone: string;
};

function mapSuppliers(data: SupplierApiItem[]): SupplierRow[] {
  return data.map((item, index) => ({
    id: item.id,
    no: index + 1,
    nama: item.nama_supplier,
    address: item.alamat,
    phone: item.phone || "-",
  }));
}

export default function AdminGudangSuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [openedForm, setOpenedForm] = useState(false);
  const [openedDetail, setOpenedDetail] = useState(false);
  const [formType, setFormType] = useState<FormType>("create");
  const [selectedSupplier, setSelectedSupplier] =
    useState<SuppliersFormInitialData | null>(null);
  const [detailSupplier, setDetailSupplier] = useState<SupplierRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchSuppliers() {
    try {
      setIsLoading(true);

      const result = await getSuppliers();
      setSuppliers(mapSuppliers(result.data || []));
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data supplier.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSuppliers();
  }, []);

  function handleTambahSupplier() {
    setFormType("create");
    setSelectedSupplier(null);
    setOpenedForm(true);
  }

  function handleOpenEditSupplier(row: SupplierRow) {
    setFormType("edit");
    setSelectedSupplier({
      id: row.id,
      nama: row.nama,
      address: row.address,
      phone: row.phone === "-" ? "" : row.phone,
    });
    setOpenedForm(true);
  }

  function handleOpenDetailSupplier(row: SupplierRow) {
    setDetailSupplier(row);
    setOpenedDetail(true);
  }

  function handleDeleteSupplier(row: SupplierRow) {
    modals.openConfirmModal({
      title: "Hapus Supplier",
      centered: true,
      children: (
        <Text size="sm">
          Apakah kamu yakin ingin menghapus supplier{" "}
          <Text span fw={700}>
            {row.nama}
          </Text>
          ?
        </Text>
      ),
      labels: {
        confirm: "Hapus",
        cancel: "Batal",
      },
      confirmProps: {
        color: "red",
      },
      onConfirm: async () => {
        try {
          setIsSubmitting(true);

          await deleteSupplier(row.id);
          await fetchSuppliers();

          notifications.show({
            title: "Berhasil",
            message: "Supplier berhasil dihapus.",
            color: "green",
          });
        } catch (error) {
          notifications.show({
            title: "Gagal",
            message:
              error instanceof Error
                ? error.message
                : "Gagal menghapus supplier.",
            color: "red",
          });
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  }

  async function handleSubmitSupplier(
    payload: SuppliersFormPayload,
    currentFormType: FormType
  ): Promise<boolean> {
    try {
      setIsSubmitting(true);

      const requestPayload = {
        nama_supplier: payload.nama,
        alamat: payload.address,
        phone: payload.phone,
      };

      if (currentFormType === "create") {
        await createSupplier(requestPayload);

        notifications.show({
          title: "Berhasil",
          message: "Supplier berhasil ditambahkan.",
          color: "green",
        });

        await fetchSuppliers();
        return true;
      }

      if (!selectedSupplier?.id) {
        notifications.show({
          title: "Gagal",
          message: "Data supplier yang diedit tidak ditemukan.",
          color: "red",
        });
        return false;
      }

      await updateSupplier(selectedSupplier.id, requestPayload);

      notifications.show({
        title: "Berhasil",
        message: "Supplier berhasil diperbarui.",
        color: "green",
      });

      await fetchSuppliers();
      return true;
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan supplier.",
        color: "red",
      });

      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  const columns: TableColumn<SupplierRow>[] = [
    {
      key: "no",
      label: "No",
      sortable: true,
      width: "10%",
      align: "center",
      render: (row) => (
        <Text fz={16} c="#222222">
          {row.no}
        </Text>
      ),
    },
    {
      key: "nama",
      label: "Nama",
      sortable: true,
      width: "30%",
      render: (row) => (
        <Text fw={700} fz={17} c="#111111">
          {row.nama}
        </Text>
      ),
    },
    {
      key: "address",
      label: "Address",
      sortable: true,
      width: "35%",
      render: (row) => (
        <Text fz={16} c="#222222">
          {row.address || "-"}
        </Text>
      ),
    },
    {
      key: "phone",
      label: "No HP",
      sortable: true,
      width: "15%",
      render: (row) => (
        <Text fz={16} c="#222222">
          {row.phone}
        </Text>
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
              leftSection={<IconEye size={16} stroke={1.9} />}
              onClick={() => handleOpenDetailSupplier(row)}
            >
              Tampil
            </Menu.Item>

            <Menu.Item
              leftSection={<IconEdit size={16} stroke={1.9} />}
              onClick={() => handleOpenEditSupplier(row)}
            >
              Edit
            </Menu.Item>

            <Menu.Item
              color="red"
              leftSection={<IconTrash size={16} stroke={1.9} />}
              onClick={() => handleDeleteSupplier(row)}
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
            onClick={handleTambahSupplier}
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
          data={suppliers}
          columns={columns}
          searchable
          isLoading={isLoading}
          searchPlaceholder="Search Suppliers...."
          showFooter={false}
          emptyText="Data supplier tidak ditemukan"
        />
      </Stack>

      <SuppliersFormModal
        opened={openedForm}
        onClose={() => setOpenedForm(false)}
        formType={formType}
        initialData={selectedSupplier}
        onSubmit={handleSubmitSupplier}
        isSubmitting={isSubmitting}
      />

      <SuppliersDetailModal
        opened={openedDetail}
        onClose={() => setOpenedDetail(false)}
        data={detailSupplier}
      />
    </>
  );
}