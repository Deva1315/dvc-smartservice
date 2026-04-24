"use client";

import { useEffect, useState } from "react";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import {
  createBarangMasuk,
  type InventoryDetailPayload,
} from "@/lib/admin-gudang/admin-gudang-inventory-mutasi.client";
import {
  getBarang,
  type BarangApiItem,
} from "@/lib/admin-gudang/admin-gudang-barang.client";
import {
  getSparepart,
  type SparepartApiItem,
} from "@/lib/admin-gudang/admin-gudang-sparepart.client";
import {
  getSuppliers,
  type SupplierApiItem,
} from "@/lib/admin-gudang/admin-gudang-suppliers.client";

type DetailItem = {
  id: string;
  tipeItem: "Barang" | "Sparepart";
  namaItem: string | null;
  jumlah: number;
};

type SelectOption = {
  value: string;
  label: string;
};

const ADMIN_GUDANG_USER_ID = "4";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text fw={700} fz={18} c="#111111">
      {children}
    </Text>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text fw={700} fz={16} c="#111111">
      {children}
    </Text>
  );
}

export default function AdminGudangBarangMasukPage() {
  const router = useRouter();

  const [tanggalMutasi, setTanggalMutasi] = useState("");
  const [supplier, setSupplier] = useState<string | null>(null);
  const [keterangan, setKeterangan] = useState("");
  const [detailItems, setDetailItems] = useState<DetailItem[]>([
    {
      id: crypto.randomUUID(),
      tipeItem: "Barang",
      namaItem: null,
      jumlah: 1,
    },
  ]);
  const [supplierOptions, setSupplierOptions] = useState<SelectOption[]>([]);
  const [barangOptions, setBarangOptions] = useState<SelectOption[]>([]);
  const [sparepartOptions, setSparepartOptions] = useState<SelectOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function fetchOptions() {
    try {
      const [supplierResult, barangResult, sparepartResult] = await Promise.all([
        getSuppliers(),
        getBarang(),
        getSparepart(),
      ]);

      setSupplierOptions(
        (supplierResult.data || []).map((item: SupplierApiItem) => ({
          value: item.id,
          label: item.nama_supplier,
        }))
      );

      setBarangOptions(
        (barangResult.data || []).map((item: BarangApiItem) => ({
          value: item.id,
          label: `${item.nama_barang} - ${item.kode_barang}`,
        }))
      );

      setSparepartOptions(
        (sparepartResult.data || []).map((item: SparepartApiItem) => ({
          value: item.id,
          label: `${item.nama_sparepart} - ${item.kode_sparepart}`,
        }))
      );
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data pilihan item.",
        color: "red",
      });
    }
  }

  useEffect(() => {
    fetchOptions();
  }, []);

  function getNamaItemOptions(tipeItem: "Barang" | "Sparepart") {
    return tipeItem === "Barang" ? barangOptions : sparepartOptions;
  }

  function handleAddItem() {
    setDetailItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        tipeItem: "Barang",
        namaItem: null,
        jumlah: 1,
      },
    ]);
  }

  function handleDeleteItem(id: string) {
    setDetailItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleChangeItem(
    id: string,
    field: keyof DetailItem,
    value: string | number | null
  ) {
    setDetailItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        if (field === "tipeItem") {
          return {
            ...item,
            tipeItem: value as "Barang" | "Sparepart",
            namaItem: null,
          };
        }

        if (field === "namaItem") {
          return {
            ...item,
            namaItem: value as string | null,
          };
        }

        if (field === "jumlah") {
          return {
            ...item,
            jumlah: typeof value === "number" ? value : 0,
          };
        }

        return item;
      })
    );
  }

  async function handleSimpan() {
    try {
      if (!tanggalMutasi) {
        notifications.show({
          title: "Gagal",
          message: "Tanggal mutasi wajib diisi.",
          color: "red",
        });
        return;
      }

      if (!supplier) {
        notifications.show({
          title: "Gagal",
          message: "Supplier wajib dipilih.",
          color: "red",
        });
        return;
      }

      const invalidItem = detailItems.some(
        (item) => !item.namaItem || item.jumlah <= 0
      );

      if (invalidItem) {
        notifications.show({
          title: "Gagal",
          message: "Semua item wajib dipilih dan jumlah harus lebih dari 0.",
          color: "red",
        });
        return;
      }

      setIsSubmitting(true);

      const detailPayload: InventoryDetailPayload[] = detailItems.map((item) => ({
        tipe_item: item.tipeItem,
        id_barang: item.tipeItem === "Barang" ? item.namaItem : null,
        id_sparepart: item.tipeItem === "Sparepart" ? item.namaItem : null,
        jumlah: item.jumlah,
      }));

      await createBarangMasuk({
        id_user: ADMIN_GUDANG_USER_ID,
        id_supplier: supplier,
        tanggal_mutasi: tanggalMutasi,
        keterangan,
        detail_items: detailPayload,
      });

      notifications.show({
        title: "Berhasil",
        message: "Data barang masuk berhasil disimpan.",
        color: "green",
      });

      router.push("/admin_gudang/inventory");
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan barang masuk.",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Stack gap={24}>
      <Title order={1} fw={800} c="#000000">
        Tambah Barang Masuk
      </Title>

      <Paper radius="lg" shadow="xs" withBorder>
        <Box px="md" py={10} bg="#D7D7D7">
          <SectionLabel>Informasi Mutasi</SectionLabel>
        </Box>

        <Box p="md" bg="#ECECEC">
          <Stack gap={22}>
            <Group align="flex-start" grow>
              <Box w="28%">
                <FieldLabel>Tanggal Mutasi</FieldLabel>
              </Box>

              <TextInput
                type="date"
                value={tanggalMutasi}
                onChange={(event) => setTanggalMutasi(event.currentTarget.value)}
              />
            </Group>

            <Group align="flex-start" grow>
              <Box w="28%">
                <FieldLabel>Supplier</FieldLabel>
              </Box>

              <Select
                value={supplier}
                onChange={setSupplier}
                data={supplierOptions}
                placeholder="Pilih supplier"
                searchable
              />
            </Group>

            <Group align="flex-start" grow>
              <Box w="28%">
                <FieldLabel>Keterangan</FieldLabel>
              </Box>

              <Textarea
                value={keterangan}
                onChange={(event) => setKeterangan(event.currentTarget.value)}
                placeholder="Masukkan Keterangan disini..."
                minRows={4}
              />
            </Group>
          </Stack>
        </Box>
      </Paper>

      <Paper radius="lg" shadow="xs" withBorder>
        <Box px="md" py={10}>
          <Group justify="space-between">
            <SectionLabel>Detail Barang Masuk</SectionLabel>

            <Button
              radius="xl"
              leftSection={<IconPlus size={18} />}
              onClick={handleAddItem}
              style={{ backgroundColor: "#0D4CB5", fontWeight: 700 }}
            >
              Tambah Item
            </Button>
          </Group>
        </Box>

        <Box p="md" bg="#F2F2F4">
          <Table horizontalSpacing="md" verticalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Tipe Item</Table.Th>
                <Table.Th>Nama Item</Table.Th>
                <Table.Th>Jumlah</Table.Th>
                <Table.Th>Aksi</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {detailItems.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Select
                      value={item.tipeItem}
                      onChange={(value) =>
                        handleChangeItem(item.id, "tipeItem", value ?? "Barang")
                      }
                      data={[
                        { value: "Barang", label: "Barang" },
                        { value: "Sparepart", label: "Sparepart" },
                      ]}
                    />
                  </Table.Td>

                  <Table.Td>
                    <Select
                      value={item.namaItem}
                      onChange={(value) =>
                        handleChangeItem(item.id, "namaItem", value)
                      }
                      data={getNamaItemOptions(item.tipeItem)}
                      placeholder="Pilih item"
                      searchable
                    />
                  </Table.Td>

                  <Table.Td>
                    <NumberInput
                      value={item.jumlah}
                      onChange={(value) =>
                        handleChangeItem(
                          item.id,
                          "jumlah",
                          typeof value === "number" ? value : 0
                        )
                      }
                      allowDecimal={false}
                      min={1}
                    />
                  </Table.Td>

                  <Table.Td>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      </Paper>

      <Group justify="flex-end" mt={4} gap="lg">
        <Button
          radius="xl"
          onClick={() => router.push("/admin_gudang/inventory")}
          style={{
            minWidth: 160,
            height: 46,
            backgroundColor: "#FF1008",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          Batal
        </Button>

        <Button
          radius="xl"
          onClick={handleSimpan}
          loading={isSubmitting}
          style={{
            minWidth: 160,
            height: 46,
            backgroundColor: "#0D4CB5",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          Simpan
        </Button>
      </Group>
    </Stack>
  );
}