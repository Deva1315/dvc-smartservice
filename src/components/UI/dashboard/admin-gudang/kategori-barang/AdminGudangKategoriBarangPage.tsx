/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { Stack, Text, Button, Group } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";
import type { FormType } from "@/types/form-types";
import CustomTable, {
  type TableColumn,
} from "@/components/table/custom-table-search/CustomTableSearch";
import RowActionMenu from "@/components/UI/common/actions/RowActionMenu";
import KategoriBarangFormModal, {
  type KategoriBarangFormInitialData,
  type KategoriBarangFormPayload,
} from "@/components/UI/dashboard/admin-gudang/kategori-barang/form/KategoriBarangFormModal";
import KategoriBarangDetailModal from "@/components/UI/dashboard/admin-gudang/kategori-barang/modal/KategoriBarangDetailModal";
import {
  createKategoriBarang,
  deleteKategoriBarang,
  getKategoriBarang,
  updateKategoriBarang,
  type KategoriBarang,
} from "@/lib/admin-gudang/admin-gudang-kategori-barang.client";

type KategoriBarangRow = {
  id: string;
  no: number;
  nama: string;
  deskripsi: string | null;
};

export default function AdminGudangKategoriBarangPage() {
  const [kategoriBarang, setKategoriBarang] = useState<KategoriBarangRow[]>([]);
  const [openedForm, setOpenedForm] = useState(false);
  const [openedDetail, setOpenedDetail] = useState(false);
  const [formType, setFormType] = useState<FormType>("create");
  const [selectedKategoriBarang, setSelectedKategoriBarang] =
    useState<KategoriBarangFormInitialData | null>(null);
  const [detailKategoriBarang, setDetailKategoriBarang] =
    useState<KategoriBarangRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function mapKategoriBarang(data: KategoriBarang[]) {
    return data.map((item, index) => ({
      id: item.id,
      no: index + 1,
      nama: item.nama_kategori,
      deskripsi: item.deskripsi,
    }));
  }

  async function fetchKategoriBarang() {
    try {
      setIsLoading(true);

      const result = await getKategoriBarang();
      setKategoriBarang(mapKategoriBarang(result.data || []));
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data kategori barang.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchKategoriBarang();
  }, []);

  function handleTambahKategoriBarang() {
    setFormType("create");
    setSelectedKategoriBarang(null);
    setOpenedForm(true);
  }

  function handleOpenEditKategoriBarang(row: KategoriBarangRow) {
    setFormType("edit");
    setSelectedKategoriBarang({
      id: row.id,
      nama: row.nama,
      deskripsi: row.deskripsi,
    });
    setOpenedForm(true);
  }

  function handleOpenDetailKategoriBarang(row: KategoriBarangRow) {
    setDetailKategoriBarang(row);
    setOpenedDetail(true);
  }

  function handleDeleteKategoriBarang(row: KategoriBarangRow) {
    modals.openConfirmModal({
      title: "Hapus Kategori Barang",
      centered: true,
      children: (
        <Text size="sm">
          Apakah kamu yakin ingin menghapus kategori barang{" "}
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

          await deleteKategoriBarang(row.id);
          await fetchKategoriBarang();

          notifications.show({
            title: "Berhasil",
            message: "Kategori barang berhasil dihapus.",
            color: "green",
          });
        } catch (error) {
          notifications.show({
            title: "Gagal",
            message:
              error instanceof Error
                ? error.message
                : "Gagal menghapus kategori barang.",
            color: "red",
          });
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  }

  async function handleSubmitKategoriBarang(
    payload: KategoriBarangFormPayload,
    currentFormType: FormType
  ): Promise<boolean> {
    try {
      setIsSubmitting(true);

      const requestPayload = {
        nama_kategori: payload.nama,
        deskripsi: payload.deskripsi,
      };

      if (currentFormType === "create") {
        await createKategoriBarang(requestPayload);

        notifications.show({
          title: "Berhasil",
          message: "Kategori barang berhasil ditambahkan.",
          color: "green",
        });

        await fetchKategoriBarang();
        return true;
      }

      if (!selectedKategoriBarang?.id) {
        notifications.show({
          title: "Gagal",
          message: "Data kategori barang yang diedit tidak ditemukan.",
          color: "red",
        });
        return false;
      }

      await updateKategoriBarang(selectedKategoriBarang.id, requestPayload);

      notifications.show({
        title: "Berhasil",
        message: "Kategori barang berhasil diperbarui.",
        color: "green",
      });

      await fetchKategoriBarang();
      return true;
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan kategori barang.",
        color: "red",
      });

      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  const columns: TableColumn<KategoriBarangRow>[] = [
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
      label: "Nama Kategori",
      sortable: true,
      width: "30%",
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
      width: "45%",
      render: (row) => (
        <Text fz={16} c="#222222">
          {row.deskripsi || "-"}
        </Text>
      ),
    },
    {
      key: "aksi",
      label: "Aksi",
      width: "15%",
      align: "center",
      render: (row) => (
        <RowActionMenu
          label={`Aksi untuk ${row.nama}`}
          actions={[
            {
              label: "Tampil",
              iconName: "eye",
              onClick: () => handleOpenDetailKategoriBarang(row),
            },
            {
              label: "Edit",
              iconName: "edit",
              onClick: () => handleOpenEditKategoriBarang(row),
            },
            {
              label: "Delete",
              iconName: "delete",
              color: "red",
              dividerBefore: true,
              onClick: () => handleDeleteKategoriBarang(row),
            },
          ]}
        />
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
            onClick={handleTambahKategoriBarang}
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
          data={kategoriBarang}
          columns={columns}
          searchable
          isLoading={isLoading}
          searchPlaceholder="Search Kategori Barang...."
          showFooter={false}
          emptyText="Data kategori barang tidak ditemukan"
        />
      </Stack>

      <KategoriBarangFormModal
        opened={openedForm}
        onClose={() => setOpenedForm(false)}
        formType={formType}
        initialData={selectedKategoriBarang}
        onSubmit={handleSubmitKategoriBarang}
        isSubmitting={isSubmitting}
      />

      <KategoriBarangDetailModal
        opened={openedDetail}
        onClose={() => setOpenedDetail(false)}
        data={detailKategoriBarang}
      />
    </>
  );
}