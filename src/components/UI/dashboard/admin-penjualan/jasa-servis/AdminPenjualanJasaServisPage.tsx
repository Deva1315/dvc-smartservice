"use client";

import { useEffect, useMemo, useState } from "react";
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
  IconTrash,
} from "@tabler/icons-react";
import type { FormType } from "@/types/form-types";
import CustomTable, {
  type TableColumn,
} from "@/components/table/custom-table-search/CustomTableSearch";
import JasaServisFormModal, {
  type JasaServisFormInitialData,
  type JasaServisFormPayload,
} from "@/components/UI/dashboard/admin-penjualan/jasa-servis/form/JasaServisFormModal";
import JasaServisDetailModal from "@/components/UI/dashboard/admin-penjualan/jasa-servis/modal/JasaServisDetailModal";
import {
  createJasaServis,
  deleteJasaServis,
  getJasaServis,
  updateJasaServis,
  type JasaServisApiItem,
} from "@/lib/admin-penjualan/admin-penjualan-jasa-servis.client";

type JasaServisRow = {
  id: string;
  no: number;
  slug: string;
  nama: string;
  deskripsi: string | null;
  harga: number;
  jamOperasional: string;
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function mapJasaServis(data: JasaServisApiItem[]): JasaServisRow[] {
  return data.map((item, index) => ({
    id: item.id,
    no: index + 1,
    slug: item.slug || createSlug(item.nama_jasa_servis),
    nama: item.nama_jasa_servis,
    deskripsi: item.deskripsi,
    harga: Number(item.harga || 0),
    jamOperasional: item.jam_operasional,
  }));
}

export default function AdminPenjualanJasaServisPage() {
  const [jasaServis, setJasaServis] = useState<JasaServisRow[]>([]);
  const [openedForm, setOpenedForm] = useState(false);
  const [openedDetail, setOpenedDetail] = useState(false);
  const [formType, setFormType] = useState<FormType>("create");
  const [selectedJasaServis, setSelectedJasaServis] =
    useState<JasaServisFormInitialData | null>(null);
  const [detailJasaServis, setDetailJasaServis] =
    useState<JasaServisRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const tableData = useMemo(() => {
    return jasaServis.map((item, index) => ({
      ...item,
      no: index + 1,
    }));
  }, [jasaServis]);

  async function fetchJasaServis() {
    try {
      setIsLoading(true);

      const result = await getJasaServis();
      setJasaServis(mapJasaServis(result.data || []));
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data jasa servis.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchJasaServis();
  }, []);

  function handleTambahJasaServis() {
    setFormType("create");
    setSelectedJasaServis(null);
    setOpenedForm(true);
  }

  function handleOpenEditJasaServis(row: JasaServisRow) {
    setFormType("edit");
    setSelectedJasaServis({
      id: row.id,
      slug: row.slug,
      nama: row.nama,
      harga: row.harga,
      deskripsi: row.deskripsi,
      jamOperasional: row.jamOperasional,
    });
    setOpenedForm(true);
  }

  function handleOpenDetailJasaServis(row: JasaServisRow) {
    setDetailJasaServis(row);
    setOpenedDetail(true);
  }

  function handleDeleteJasaServis(row: JasaServisRow) {
    modals.openConfirmModal({
      title: "Hapus Jasa Servis",
      centered: true,
      children: (
        <Text size="sm">
          Apakah kamu yakin ingin menghapus jasa servis{" "}
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

          await deleteJasaServis(row.id);
          await fetchJasaServis();

          notifications.show({
            title: "Berhasil",
            message: "Jasa servis berhasil dihapus.",
            color: "green",
          });
        } catch (error) {
          notifications.show({
            title: "Gagal",
            message:
              error instanceof Error
                ? error.message
                : "Gagal menghapus jasa servis.",
            color: "red",
          });
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  }

  async function handleSubmitJasaServis(
    payload: JasaServisFormPayload,
    currentFormType: FormType
  ): Promise<boolean> {
    try {
      if (!payload.nama.trim()) {
        notifications.show({
          title: "Gagal",
          message: "Nama jasa servis wajib diisi.",
          color: "red",
        });
        return false;
      }

      if (!payload.harga || payload.harga < 0) {
        notifications.show({
          title: "Gagal",
          message: "Harga jasa servis wajib diisi dan tidak boleh negatif.",
          color: "red",
        });
        return false;
      }

      if (!payload.jamOperasional.trim()) {
        notifications.show({
          title: "Gagal",
          message: "Jam operasional wajib diisi.",
          color: "red",
        });
        return false;
      }

      setIsSubmitting(true);

      const requestPayload = {
        nama_jasa_servis: payload.nama,
        deskripsi: payload.deskripsi,
        harga: payload.harga,
        jam_operasional: payload.jamOperasional,
      };

      if (currentFormType === "create") {
        await createJasaServis(requestPayload);

        notifications.show({
          title: "Berhasil",
          message: "Jasa servis berhasil ditambahkan.",
          color: "green",
        });

        await fetchJasaServis();
        return true;
      }

      if (!selectedJasaServis?.id) {
        notifications.show({
          title: "Gagal",
          message: "Data jasa servis yang diedit tidak ditemukan.",
          color: "red",
        });
        return false;
      }

      await updateJasaServis(selectedJasaServis.id, requestPayload);

      notifications.show({
        title: "Berhasil",
        message: "Jasa servis berhasil diperbarui.",
        color: "green",
      });

      await fetchJasaServis();
      return true;
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan jasa servis.",
        color: "red",
      });

      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  const columns: TableColumn<JasaServisRow>[] = [
    {
      key: "no",
      label: "No",
      sortable: true,
      width: "7%",
      align: "center",
      render: (row) => (
        <Text fz={16} c="#222222">
          {row.no}
        </Text>
      ),
    },
    {
      key: "nama",
      label: "Nama Jasa Servis",
      sortable: true,
      width: "28%",
      render: (row) => (
        <Text fw={700} fz={17} c="#111111">
          {row.nama}
        </Text>
      ),
    },
    {
      key: "deskripsi",
      label: "Deskripsi",
      sortable: true,
      width: "30%",
      render: (row) => (
        <Text fz={16} c="#222222" lineClamp={2}>
          {row.deskripsi || "-"}
        </Text>
      ),
    },
    {
      key: "harga",
      label: "Harga",
      sortable: true,
      width: "15%",
      render: (row) => (
        <Text fz={16} c="#222222">
          {formatRupiah(row.harga)}
        </Text>
      ),
    },
    {
      key: "jamOperasional",
      label: "Jam Operasional",
      sortable: true,
      width: "14%",
      render: (row) => (
        <Text fz={16} c="#222222">
          {row.jamOperasional}
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
              onClick={() => handleOpenDetailJasaServis(row)}
            >
              Tampil
            </Menu.Item>

            <Menu.Item
              leftSection={<IconEdit size={16} stroke={1.9} />}
              onClick={() => handleOpenEditJasaServis(row)}
            >
              Edit
            </Menu.Item>

            <Menu.Item
              color="red"
              leftSection={<IconTrash size={16} stroke={1.9} />}
              onClick={() => handleDeleteJasaServis(row)}
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
            onClick={handleTambahJasaServis}
            style={{
              height: 38,
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
          data={tableData}
          columns={columns}
          searchable
          isLoading={isLoading}
          searchPlaceholder="Search Jasa Servis...."
          showFooter={false}
          emptyText="Data jasa servis tidak ditemukan"
        />
      </Stack>

      <JasaServisFormModal
        opened={openedForm}
        onClose={() => setOpenedForm(false)}
        formType={formType}
        initialData={selectedJasaServis}
        onSubmit={handleSubmitJasaServis}
        isSubmitting={isSubmitting}
      />

      <JasaServisDetailModal
        opened={openedDetail}
        onClose={() => setOpenedDetail(false)}
        data={detailJasaServis}
      />
    </>
  );
}