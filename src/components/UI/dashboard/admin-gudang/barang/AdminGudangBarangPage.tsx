"use client";

import { useEffect, useState } from "react";
import { Button, Group, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";
import type { FormType } from "@/types/form-types";
import CustomTable, {
  type TableColumn,
} from "@/components/table/custom-table-search/CustomTableSearch";
import RowActionMenu from "@/components/UI/common/actions/RowActionMenu";
import StockBadge from "@/components/UI/common/badges/StockBadge";
import TableImagePreview from "@/components/UI/common/data-display/TableImagePreview";
import BarangFormModal, {
  type BarangFormInitialData,
  type BarangFormPayload,
} from "@/components/UI/dashboard/admin-gudang/barang/form/BarangFormModal";
import BarangDetailModal from "@/components/UI/dashboard/admin-gudang/barang/modal/BarangDetailModal";
import {
  createBarang,
  deleteBarang,
  getBarang,
  updateBarang,
  type BarangApiItem,
} from "@/lib/admin-gudang/admin-gudang-barang.client";
import {
  getKategoriBarang,
  type KategoriBarang,
} from "@/lib/admin-gudang/admin-gudang-kategori-barang.client";
import { formatCurrency } from "@/utils/currency-format/format-currency";

type BarangRow = {
  id: string;
  idKategori: string;
  nama: string;
  kode: string;
  merk: string;
  stok: number;
  harga: number;
  kategori: string;
  deskripsi: string | null;
  foto: string | null;
};

type KategoriOption = {
  value: string;
  label: string;
};

function mapBarang(data: BarangApiItem[]): BarangRow[] {
  return data.map((item) => ({
    id: item.id,
    idKategori: item.id_kategori,
    nama: item.nama_barang,
    kode: item.kode_barang,
    merk: item.merk_barang || "-",
    stok: Number(item.stock || 0),
    harga: Number(item.harga || 0),
    kategori: item.kategori_barang?.nama_kategori || "-",
    deskripsi: item.deskripsi,
    foto: item.gambar,
  }));
}

function mapKategoriOptions(data: KategoriBarang[]): KategoriOption[] {
  return data.map((item) => ({
    value: item.id,
    label: item.nama_kategori,
  }));
}

export default function AdminGudangBarangPage() {
  const [barang, setBarang] = useState<BarangRow[]>([]);
  const [kategoriOptions, setKategoriOptions] = useState<KategoriOption[]>([]);
  const [openedForm, setOpenedForm] = useState(false);
  const [openedDetail, setOpenedDetail] = useState(false);
  const [formType, setFormType] = useState<FormType>("create");
  const [selectedBarang, setSelectedBarang] =
    useState<BarangFormInitialData | null>(null);
  const [detailBarang, setDetailBarang] = useState<BarangRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchBarang() {
    try {
      setIsLoading(true);

      const result = await getBarang();
      setBarang(mapBarang(result.data || []));
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data barang.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchKategoriOptions() {
    try {
      const result = await getKategoriBarang();
      setKategoriOptions(mapKategoriOptions(result.data || []));
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data kategori barang.",
        color: "red",
      });
    }
  }

  useEffect(() => {
    fetchBarang();
    fetchKategoriOptions();
  }, []);

  function handleTambahBarang() {
    setFormType("create");
    setSelectedBarang(null);
    setOpenedForm(true);
  }

  function handleOpenEditBarang(row: BarangRow) {
    setFormType("edit");
    setSelectedBarang({
      id: row.id,
      nama: row.nama,
      kode: row.kode,
      merk: row.merk === "-" ? "" : row.merk,
      stok: row.stok,
      harga: row.harga,
      kategori: row.idKategori,
      deskripsi: row.deskripsi,
      foto: row.foto,
    });
    setOpenedForm(true);
  }

  function handleOpenDetailBarang(row: BarangRow) {
    setDetailBarang(row);
    setOpenedDetail(true);
  }

  function handleDeleteBarang(row: BarangRow) {
    modals.openConfirmModal({
      title: "Hapus Barang",
      centered: true,
      children: (
        <Text size="sm">
          Apakah kamu yakin ingin menghapus barang{" "}
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

          await deleteBarang(row.id);
          await fetchBarang();

          notifications.show({
            title: "Berhasil",
            message: "Barang berhasil dihapus.",
            color: "green",
          });
        } catch (error) {
          notifications.show({
            title: "Gagal",
            message:
              error instanceof Error
                ? error.message
                : "Gagal menghapus barang.",
            color: "red",
          });
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  }

  async function handleSubmitBarang(
    payload: BarangFormPayload,
    currentFormType: FormType
  ): Promise<boolean> {
    try {
      setIsSubmitting(true);

      const requestPayload = {
        id_kategori: payload.kategori,
        nama_barang: payload.nama,
        kode_barang: payload.kode,
        merk_barang: payload.merk,
        deskripsi: payload.deskripsi,
        harga: payload.harga,
        stock: payload.stok,
        gambar: payload.fotoBase64,
      };

      if (currentFormType === "create") {
        await createBarang(requestPayload);

        notifications.show({
          title: "Berhasil",
          message: "Barang berhasil ditambahkan.",
          color: "green",
        });

        await fetchBarang();
        return true;
      }

      if (!selectedBarang?.id) {
        notifications.show({
          title: "Gagal",
          message: "Data barang yang diedit tidak ditemukan.",
          color: "red",
        });
        return false;
      }

      await updateBarang(selectedBarang.id, requestPayload);

      notifications.show({
        title: "Berhasil",
        message: "Barang berhasil diperbarui.",
        color: "green",
      });

      await fetchBarang();
      return true;
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan barang.",
        color: "red",
      });

      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  const columns: TableColumn<BarangRow>[] = [
    {
      key: "foto",
      label: "Foto Barang",
      width: "18%",
      render: (row) => (
        <Group justify="center">
          <TableImagePreview
            src={row.foto}
            alt={row.nama}
            width={92}
            height={68}
            radius={12}
            emptyText="Tidak ada foto"
            fit="cover"
          />
        </Group>
      ),
    },
    {
      key: "nama",
      label: "Nama",
      sortable: true,
      width: "17%",
      render: (row) => (
        <Text fw={700} fz={17} c="#111111">
          {row.nama}
        </Text>
      ),
    },
    {
      key: "kode",
      label: "Kode",
      sortable: true,
      width: "12%",
      render: (row) => (
        <Text fz={17} c="#222222">
          {row.kode}
        </Text>
      ),
    },
    {
      key: "merk",
      label: "Merk",
      sortable: true,
      width: "14%",
      render: (row) => (
        <Text fz={17} c="#222222">
          {row.merk}
        </Text>
      ),
    },
    {
      key: "stok",
      label: "Stok",
      sortable: true,
      width: "10%",
      align: "center",
      render: (row) => (
        <StockBadge
          value={row.stok}
          label={String(row.stok)}
          showValue={false}
          radius="sm"
        />
      ),
    },
    {
      key: "harga",
      label: "Harga",
      sortable: true,
      width: "17%",
      render: (row) => (
        <Text fz={17} c="#222222">
          {formatCurrency(row.harga, {
            locale: "id-ID",
            prefix: "Rp ",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </Text>
      ),
    },
    {
      key: "aksi",
      label: "Aksi",
      width: "12%",
      align: "center",
      render: (row) => (
        <RowActionMenu
          label={`Aksi untuk ${row.nama}`}
          actions={[
            {
              label: "Tampil",
              iconName: "eye",
              onClick: () => handleOpenDetailBarang(row),
            },
            {
              label: "Edit",
              iconName: "edit",
              onClick: () => handleOpenEditBarang(row),
            },
            {
              label: "Delete",
              iconName: "delete",
              color: "red",
              dividerBefore: true,
              onClick: () => handleDeleteBarang(row),
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
            onClick={handleTambahBarang}
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
          data={barang}
          columns={columns}
          searchable
          isLoading={isLoading}
          searchPlaceholder="Search Barang...."
          showFooter={false}
          emptyText="Data barang tidak ditemukan"
        />
      </Stack>

      <BarangFormModal
        opened={openedForm}
        onClose={() => setOpenedForm(false)}
        formType={formType}
        initialData={selectedBarang}
        kategoriOptions={kategoriOptions}
        onSubmit={handleSubmitBarang}
        isSubmitting={isSubmitting}
      />

      <BarangDetailModal
        opened={openedDetail}
        onClose={() => setOpenedDetail(false)}
        data={detailBarang}
      />
    </>
  );
}