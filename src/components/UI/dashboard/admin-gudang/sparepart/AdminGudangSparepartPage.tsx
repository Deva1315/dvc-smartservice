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
import SparepartFormModal, {
  type SparepartFormInitialData,
  type SparepartFormPayload,
} from "@/components/UI/dashboard/admin-gudang/sparepart/form/SparepartFormModal";
import SparepartDetailModal from "@/components/UI/dashboard/admin-gudang/sparepart/modal/SparepartDetailModal";
import { formatCurrency } from "@/utils/currency-format/format-currency";
import {
  createSparepart,
  deleteSparepart,
  getSparepart,
  updateSparepart,
  type SparepartApiItem,
} from "@/lib/admin-gudang/admin-gudang-sparepart.client";
import {
  getSuppliers,
  type SupplierApiItem,
} from "@/lib/admin-gudang/admin-gudang-suppliers.client";

type SparepartRow = {
  id: string;
  idSupplier: string;
  nama: string;
  kode: string;
  merk: string;
  stok: number;
  harga: number;
  supplier: string;
  deskripsi: string | null;
  foto: string | null;
};

type SupplierOption = {
  value: string;
  label: string;
};

function mapSparepart(data: SparepartApiItem[]): SparepartRow[] {
  return data.map((item) => ({
    id: item.id,
    idSupplier: item.id_supplier,
    nama: item.nama_sparepart,
    kode: item.kode_sparepart,
    merk: item.merk_sparepart || "-",
    stok: Number(item.stock || 0),
    harga: Number(item.harga || 0),
    supplier: item.suppliers?.nama_supplier || "-",
    deskripsi: item.deskripsi,
    foto: item.gambar,
  }));
}

function mapSupplierOptions(data: SupplierApiItem[]): SupplierOption[] {
  return data.map((item) => ({
    value: item.id,
    label: item.nama_supplier,
  }));
}

export default function AdminGudangSparepartPage() {
  const [sparepart, setSparepart] = useState<SparepartRow[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<SupplierOption[]>([]);
  const [openedForm, setOpenedForm] = useState(false);
  const [openedDetail, setOpenedDetail] = useState(false);
  const [formType, setFormType] = useState<FormType>("create");
  const [selectedSparepart, setSelectedSparepart] =
    useState<SparepartFormInitialData | null>(null);
  const [detailSparepart, setDetailSparepart] =
    useState<SparepartRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchSparepart() {
    try {
      setIsLoading(true);

      const result = await getSparepart();
      setSparepart(mapSparepart(result.data || []));
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data sparepart.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSupplierOptions() {
    try {
      const result = await getSuppliers();
      setSupplierOptions(mapSupplierOptions(result.data || []));
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data supplier.",
        color: "red",
      });
    }
  }

  useEffect(() => {
    fetchSparepart();
    fetchSupplierOptions();
  }, []);

  function handleTambahSparepart() {
    setFormType("create");
    setSelectedSparepart(null);
    setOpenedForm(true);
  }

  function handleOpenEditSparepart(row: SparepartRow) {
    setFormType("edit");
    setSelectedSparepart({
      id: row.id,
      nama: row.nama,
      kode: row.kode,
      merk: row.merk === "-" ? "" : row.merk,
      stok: row.stok,
      harga: row.harga,
      supplier: row.idSupplier,
      deskripsi: row.deskripsi,
      foto: row.foto,
    });
    setOpenedForm(true);
  }

  function handleOpenDetailSparepart(row: SparepartRow) {
    setDetailSparepart(row);
    setOpenedDetail(true);
  }

  function handleDeleteSparepart(row: SparepartRow) {
    modals.openConfirmModal({
      title: "Hapus Sparepart",
      centered: true,
      children: (
        <Text size="sm">
          Apakah kamu yakin ingin menghapus sparepart{" "}
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

          await deleteSparepart(row.id);
          await fetchSparepart();

          notifications.show({
            title: "Berhasil",
            message: "Sparepart berhasil dihapus.",
            color: "green",
          });
        } catch (error) {
          notifications.show({
            title: "Gagal",
            message:
              error instanceof Error
                ? error.message
                : "Gagal menghapus sparepart.",
            color: "red",
          });
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  }

  async function handleSubmitSparepart(
    payload: SparepartFormPayload,
    currentFormType: FormType
  ): Promise<boolean> {
    try {
      setIsSubmitting(true);

      const requestPayload = {
        id_supplier: payload.supplier,
        nama_sparepart: payload.nama,
        kode_sparepart: payload.kode,
        merk_sparepart: payload.merk,
        deskripsi: payload.deskripsi,
        harga: payload.harga,
        stock: payload.stok,
        gambar: payload.fotoBase64,
      };

      if (currentFormType === "create") {
        await createSparepart(requestPayload);

        notifications.show({
          title: "Berhasil",
          message: "Sparepart berhasil ditambahkan.",
          color: "green",
        });

        await fetchSparepart();
        return true;
      }

      if (!selectedSparepart?.id) {
        notifications.show({
          title: "Gagal",
          message: "Data sparepart yang diedit tidak ditemukan.",
          color: "red",
        });
        return false;
      }

      await updateSparepart(selectedSparepart.id, requestPayload);

      notifications.show({
        title: "Berhasil",
        message: "Sparepart berhasil diperbarui.",
        color: "green",
      });

      await fetchSparepart();
      return true;
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan sparepart.",
        color: "red",
      });

      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  const columns: TableColumn<SparepartRow>[] = [
    {
      key: "foto",
      label: "Foto",
      width: "12%",
      render: (row) => (
        <Group justify="center">
          <TableImagePreview
            src={row.foto}
            alt={row.nama}
            width={88}
            height={58}
            radius={10}
            emptyText="Tidak ada foto"
            fit="cover"
          />
        </Group>
      ),
    },
    {
      key: "nama",
      label: "Nama Sparepart",
      sortable: true,
      width: "22%",
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
      width: "13%",
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
      width: "15%",
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
      width: "16%",
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
              onClick: () => handleOpenDetailSparepart(row),
            },
            {
              label: "Edit",
              iconName: "edit",
              onClick: () => handleOpenEditSparepart(row),
            },
            {
              label: "Delete",
              iconName: "delete",
              color: "red",
              dividerBefore: true,
              onClick: () => handleDeleteSparepart(row),
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
            onClick={handleTambahSparepart}
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
          data={sparepart}
          columns={columns}
          searchable
          isLoading={isLoading}
          searchPlaceholder="Search Sparepart...."
          showFooter={false}
          emptyText="Data sparepart tidak ditemukan"
        />
      </Stack>

      <SparepartFormModal
        opened={openedForm}
        onClose={() => setOpenedForm(false)}
        formType={formType}
        initialData={selectedSparepart}
        supplierOptions={supplierOptions}
        onSubmit={handleSubmitSparepart}
        isSubmitting={isSubmitting}
      />

      <SparepartDetailModal
        opened={openedDetail}
        onClose={() => setOpenedDetail(false)}
        data={detailSparepart}
      />
    </>
  );
}