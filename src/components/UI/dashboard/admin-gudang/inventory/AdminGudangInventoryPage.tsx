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
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import {
  IconDotsVertical,
  IconEye,
  IconPlus,
} from "@tabler/icons-react";
import CustomTable, {
  type TableColumn,
} from "@/components/table/custom-table-search/CustomTableSearch";
import InventoryDetailModal from "@/components/UI/dashboard/admin-gudang/inventory/modal/InventoryDetailModal";
import {
  getInventoryMutasi,
  type InventoryMutasiApiItem,
} from "@/lib/admin-gudang/admin-gudang-inventory.client";

type InventoryItemDetail = {
  tipeItem: "Barang" | "Sparepart";
  namaItem: string;
  jumlah: number;
};

type InventoryRow = {
  id: string;
  no: number;
  tanggalMutasi: string;
  supplier: string;
  petugas: string;
  keterangan: string;
  totalItem: number;
  totalJumlah: number;
  jenisMutasi: "Barang Masuk" | "Barang Keluar";
  detailItems: InventoryItemDetail[];
};

function formatTanggalIndonesia(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getJenisMutasiColor(jenisMutasi: string) {
  if (jenisMutasi === "Barang Masuk") {
    return "green";
  }

  if (jenisMutasi === "Barang Keluar") {
    return "red";
  }

  return "gray";
}

function mapInventory(data: InventoryMutasiApiItem[]): InventoryRow[] {
  return data.map((item, index) => {
    const detailItems: InventoryItemDetail[] = item.detail_stock_mutasi.map(
      (detail) => {
        if (detail.id_barang && detail.barang) {
          return {
            tipeItem: "Barang",
            namaItem: `${detail.barang.nama_barang} - ${detail.barang.kode_barang}`,
            jumlah: Number(detail.jumlah || 0),
          };
        }

        return {
          tipeItem: "Sparepart",
          namaItem: detail.sparepart
            ? `${detail.sparepart.nama_sparepart} - ${detail.sparepart.kode_sparepart}`
            : "-",
          jumlah: Number(detail.jumlah || 0),
        };
      }
    );

    return {
      id: item.id,
      no: index + 1,
      tanggalMutasi: formatTanggalIndonesia(item.tanggal_mutasi),
      supplier: item.suppliers?.nama_supplier || "-",
      petugas: item.users?.nama || "-",
      keterangan: item.keterangan || "-",
      totalItem: item.detail_stock_mutasi.length,
      totalJumlah: item.detail_stock_mutasi.reduce(
        (total, detail) => total + Number(detail.jumlah || 0),
        0
      ),
      jenisMutasi:
        item.jenis_mutasi === "Barang Keluar"
          ? "Barang Keluar"
          : "Barang Masuk",
      detailItems,
    };
  });
}

export default function AdminGudangInventoryPage() {
  const router = useRouter();

  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [openedDetail, setOpenedDetail] = useState(false);
  const [selectedInventory, setSelectedInventory] =
    useState<InventoryRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchInventory() {
    try {
      setIsLoading(true);

      const result = await getInventoryMutasi();
      setInventory(mapInventory(result.data || []));
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data inventory.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchInventory();
  }, []);

  function handleOpenDetail(row: InventoryRow) {
    setSelectedInventory(row);
    setOpenedDetail(true);
  }

  const columns: TableColumn<InventoryRow>[] = [
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
      key: "tanggalMutasi",
      label: "Tanggal Mutasi",
      sortable: true,
      width: "16%",
      render: (row) => (
        <Text fz={16} c="#222222">
          {row.tanggalMutasi}
        </Text>
      ),
    },
    {
      key: "jenisMutasi",
      label: "Jenis Mutasi",
      sortable: true,
      width: "15%",
      render: (row) => (
        <Badge
          color={getJenisMutasiColor(row.jenisMutasi)}
          variant="light"
          radius="sm"
          styles={{
            label: {
              fontSize: 13,
              fontWeight: 700,
            },
          }}
        >
          {row.jenisMutasi}
        </Badge>
      ),
    },
    {
      key: "supplier",
      label: "Supplier",
      sortable: true,
      width: "16%",
      render: (row) => (
        <Text fz={16} c="#222222">
          {row.supplier}
        </Text>
      ),
    },
    {
      key: "petugas",
      label: "Petugas",
      sortable: true,
      width: "14%",
      render: (row) => (
        <Text fz={16} c="#222222">
          {row.petugas}
        </Text>
      ),
    },
    {
      key: "totalItem",
      label: "Total Item",
      sortable: true,
      width: "10%",
      align: "center",
      render: (row) => (
        <Text fz={16} fw={700} c="#222222">
          {row.totalItem}
        </Text>
      ),
    },
    {
      key: "totalJumlah",
      label: "Total Jumlah",
      sortable: true,
      width: "12%",
      align: "center",
      render: (row) => (
        <Text fz={16} fw={700} c="#222222">
          {row.totalJumlah}
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
              aria-label={`Aksi untuk ${row.tanggalMutasi}`}
              onClick={(event) => event.stopPropagation()}
            >
              <IconDotsVertical size={20} stroke={2} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEye size={16} stroke={1.9} />}
              onClick={() => handleOpenDetail(row)}
            >
              Tampil
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
            onClick={() => router.push("/admin_gudang/inventory/barang-masuk")}
            style={{
              height: 44,
              minWidth: 170,
              backgroundColor: "#0D4CB5",
              fontSize: 18,
              fontWeight: 700,
              paddingInline: 24,
            }}
          >
            Barang Masuk
          </Button>

          <Button
            radius="xl"
            leftSection={<IconPlus size={20} stroke={2.2} />}
            onClick={() => router.push("/admin_gudang/inventory/barang-keluar")}
            style={{
              height: 44,
              minWidth: 170,
              backgroundColor: "#FF1008",
              fontSize: 18,
              fontWeight: 700,
              paddingInline: 24,
            }}
          >
            Barang Keluar
          </Button>
        </Group>

        <CustomTable
          data={inventory}
          columns={columns}
          searchable
          isLoading={isLoading}
          searchPlaceholder="Search Inventory...."
          showFooter={false}
          emptyText="Data inventory tidak ditemukan"
        />
      </Stack>

      <InventoryDetailModal
        opened={openedDetail}
        onClose={() => setOpenedDetail(false)}
        data={selectedInventory}
      />
    </>
  );
}