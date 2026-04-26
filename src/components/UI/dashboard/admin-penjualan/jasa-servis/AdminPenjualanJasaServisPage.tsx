"use client";

import { useMemo, useState } from "react";
import {
  ActionIcon,
  Button,
  Group,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import { modals } from "@mantine/modals";
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

type JasaServisRow = {
  id: string;
  no: number;
  slug: string;
  nama: string;
  deskripsi: string | null;
  harga: number;
  jamOperasional: string;
};

const initialJasaServisData: JasaServisRow[] = [
  {
    id: "1",
    no: 1,
    slug: "perbaikan-laptop",
    nama: "Perbaikan Laptop",
    deskripsi: "Perbaikan berbagai masalah pada laptop",
    harga: 150000,
    jamOperasional: "09:00 - 17:00",
  },
  {
    id: "2",
    no: 2,
    slug: "instalasi-ulang-os",
    nama: "Instalasi Ulang OS",
    deskripsi: "Instalasi ulang sistem operasi, driver, dan aplikasi",
    harga: 100000,
    jamOperasional: "08:00 - 16:00",
  },
  {
    id: "3",
    no: 3,
    slug: "pembersihan-komputer",
    nama: "Pembersihan Komputer",
    deskripsi: "Pembersihan komputer dari debu dan kotoran",
    harga: 75000,
    jamOperasional: "09:00 - 15:00",
  },
  {
    id: "4",
    no: 4,
    slug: "upgrade-hardware",
    nama: "Upgrade Hardware",
    deskripsi: "Upgrade RAM, SSD, atau hardware lain",
    harga: 200000,
    jamOperasional: "10:00 - 18:00",
  },
];

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

export default function AdminPenjualanJasaServisPage() {
  const [jasaServis, setJasaServis] =
    useState<JasaServisRow[]>(initialJasaServisData);
  const [openedForm, setOpenedForm] = useState(false);
  const [openedDetail, setOpenedDetail] = useState(false);
  const [formType, setFormType] = useState<FormType>("create");
  const [selectedJasaServis, setSelectedJasaServis] =
    useState<JasaServisFormInitialData | null>(null);
  const [detailJasaServis, setDetailJasaServis] =
    useState<JasaServisRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tableData = useMemo(() => {
    return jasaServis.map((item, index) => ({
      ...item,
      no: index + 1,
    }));
  }, [jasaServis]);

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
      onConfirm: () => {
        setJasaServis((prev) => prev.filter((item) => item.id !== row.id));
      },
    });
  }

  async function handleSubmitJasaServis(
    payload: JasaServisFormPayload,
    currentFormType: FormType
  ): Promise<boolean> {
    if (!payload.nama.trim()) return false;
    if (!payload.harga || payload.harga < 0) return false;
    if (!payload.jamOperasional.trim()) return false;

    setIsSubmitting(true);

    try {
      if (currentFormType === "create") {
        setJasaServis((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            no: prev.length + 1,
            slug: createSlug(payload.nama),
            nama: payload.nama,
            harga: payload.harga,
            deskripsi: payload.deskripsi,
            jamOperasional: payload.jamOperasional,
          },
        ]);

        return true;
      }

      if (!selectedJasaServis?.id) return false;

      setJasaServis((prev) =>
        prev.map((item) =>
          item.id === selectedJasaServis.id
            ? {
                ...item,
                slug: createSlug(payload.nama),
                nama: payload.nama,
                harga: payload.harga,
                deskripsi: payload.deskripsi,
                jamOperasional: payload.jamOperasional,
              }
            : item
        )
      );

      return true;
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
        <Group justify="flex-end" align="center">

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
            + Tambah
          </Button>
        </Group>

        <CustomTable
          data={tableData}
          columns={columns}
          searchable
          isLoading={false}
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