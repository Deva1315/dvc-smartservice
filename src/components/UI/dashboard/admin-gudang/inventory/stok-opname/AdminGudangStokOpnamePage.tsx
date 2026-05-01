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
import StokOpnameDetailModal from "@/components/UI/dashboard/admin-gudang/inventory/stok-opname/modal/StokOpnameDetailModal";
import {
  getStokOpname,
  type StokOpnameApiItem,
} from "@/lib/admin-gudang/admin-gudang-stok-opname-client";

export type StokOpnameDetailItem = {
  id: string;
  tipeItem: "Barang" | "Sparepart";
  namaItem: string;
  stokSistem: number;
  stokFisik: number;
  selisih: number;
  keterangan: string | null;
};

export type StokOpnameRow = {
  id: string;
  no: number;
  tanggalOpname: string;
  idUser: string;
  userName: string;
  selisihStock: number;
  keterangan: string | null;
  items: StokOpnameDetailItem[];
};

function formatDisplayDate(value: string) {
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

function getSelisihColor(value: number) {
  if (Math.abs(value) > 0) return "yellow";
  return "gray";
}

function mapStokOpname(data: StokOpnameApiItem[]): StokOpnameRow[] {
  return data.map((item, index) => ({
    id: item.id,
    no: index + 1,
    tanggalOpname: item.tanggal_opname,
    idUser: item.id_user,
    userName: item.users?.nama || "-",
    selisihStock: Math.abs(Number(item.selisih_stock || 0)),
    keterangan: item.keterangan,
    items: item.detail_stock_opname.map((detail) => {
      if (detail.id_barang && detail.barang) {
        return {
          id: detail.id,
          tipeItem: "Barang",
          namaItem: `${detail.barang.nama_barang} - ${detail.barang.kode_barang}`,
          stokSistem: Number(detail.stock_sistem || 0),
          stokFisik: Number(detail.stock_fisik || 0),
          selisih: Math.abs(Number(detail.selisih || 0)),
          keterangan: detail.keterangan,
        };
      }

      return {
        id: detail.id,
        tipeItem: "Sparepart",
        namaItem: detail.sparepart
          ? `${detail.sparepart.nama_sparepart} - ${detail.sparepart.kode_sparepart}`
          : "-",
        stokSistem: Number(detail.stock_sistem || 0),
        stokFisik: Number(detail.stock_fisik || 0),
        selisih: Math.abs(Number(detail.selisih || 0)),
        keterangan: detail.keterangan,
      };
    }),
  }));
}

export default function StokOpnamePage() {
  const router = useRouter();

  const [stokOpname, setStokOpname] = useState<StokOpnameRow[]>([]);
  const [openedDetail, setOpenedDetail] = useState(false);
  const [selectedData, setSelectedData] = useState<StokOpnameRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchStokOpname() {
    try {
      setIsLoading(true);

      const result = await getStokOpname();
      setStokOpname(mapStokOpname(result.data || []));
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data stok opname.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchStokOpname();
  }, []);

  function handleOpenDetail(row: StokOpnameRow) {
    setSelectedData(row);
    setOpenedDetail(true);
  }

  const columns: TableColumn<StokOpnameRow>[] = [
    {
      key: "no",
      label: "No",
      sortable: true,
      width: "8%",
      align: "center",
      render: (row) => (
        <Text fz={16} c="#222222">
          {row.no}
        </Text>
      ),
    },
    {
      key: "tanggalOpname",
      label: "Tanggal Opname",
      sortable: true,
      width: "20%",
      render: (row) => (
        <Text fz={16} c="#222222">
          {formatDisplayDate(row.tanggalOpname)}
        </Text>
      ),
    },
    {
      key: "userName",
      label: "User",
      sortable: true,
      width: "18%",
      render: (row) => (
        <Text fz={16} c="#222222">
          {row.userName}
        </Text>
      ),
    },
    {
      key: "selisihStock",
      label: "Selisih Stock",
      sortable: true,
      width: "14%",
      align: "center",
      render: (row) => (
        <Badge
          color={getSelisihColor(row.selisihStock)}
          variant="light"
          radius="sm"
        >
          {Math.abs(row.selisihStock)}
        </Badge>
      ),
    },
    {
      key: "keterangan",
      label: "Keterangan",
      sortable: true,
      width: "28%",
      render: (row) => (
        <Text fz={16} c="#222222">
          {row.keterangan || "-"}
        </Text>
      ),
    },
    {
      key: "aksi",
      label: "Aksi",
      width: "12%",
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
              aria-label={`Aksi untuk ${row.tanggalOpname}`}
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
            onClick={() =>
              router.push("/admin_gudang/inventory/stok-opname/tambah")
            }
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
          data={stokOpname}
          columns={columns}
          searchable
          isLoading={isLoading}
          searchPlaceholder="Search Stok Opname...."
          showFooter={false}
          emptyText="Data stok opname tidak ditemukan"
        />
      </Stack>

      <StokOpnameDetailModal
        opened={openedDetail}
        onClose={() => setOpenedDetail(false)}
        data={selectedData}
      />
    </>
  );
}