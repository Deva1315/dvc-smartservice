"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
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
  createStokOpname,
  type StokOpnameDetailPayload,
} from "@/lib/admin-gudang/admin-gudang-stok-opname-client";
import {
  getBarang,
  type BarangApiItem,
} from "@/lib/admin-gudang/admin-gudang-barang.client";
import {
  getSparepart,
  type SparepartApiItem,
} from "@/lib/admin-gudang/admin-gudang-sparepart.client";

type StokOpnameItemType = "Barang" | "Sparepart";

type StokOpnameDetailItem = {
  id: string;
  tipeItem: StokOpnameItemType;
  idBarang: string | null;
  idSparepart: string | null;
  namaItem: string | null;
  stokSistem: number;
  stokFisik: number;
  selisih: number;
  keterangan: string | null;
};

type ItemOption = {
  value: string;
  label: string;
  stokSistem: number;
};

const ADMIN_GUDANG_USER_ID = "4";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Text fw={700} fz={18} c="#111111">
      {children}
    </Text>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <Text fw={700} fz={16} c="#111111">
      {children}
    </Text>
  );
}

function createEmptyItem(): StokOpnameDetailItem {
  return {
    id: crypto.randomUUID(),
    tipeItem: "Barang",
    idBarang: null,
    idSparepart: null,
    namaItem: null,
    stokSistem: 0,
    stokFisik: 0,
    selisih: 0,
    keterangan: null,
  };
}

function getSelisih(stokSistem: number, stokFisik: number) {
  return Math.abs(stokFisik - stokSistem);
}

function getSelisihText(value: number) {
  return `${Math.abs(value)}`;
}

function getSelisihColor(value: number) {
  if (Math.abs(value) > 0) return "#C97A32";
  return "#111111";
}

export default function StokOpnameFormPage() {
  const router = useRouter();

  const [tanggalOpname, setTanggalOpname] = useState("");
  const [keteranganHeader, setKeteranganHeader] = useState("");
  const [detailItems, setDetailItems] = useState<StokOpnameDetailItem[]>([
    createEmptyItem(),
  ]);
  const [barangOptions, setBarangOptions] = useState<ItemOption[]>([]);
  const [sparepartOptions, setSparepartOptions] = useState<ItemOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSelisihStock = useMemo(() => {
    return detailItems.reduce((total, item) => total + item.selisih, 0);
  }, [detailItems]);

  async function fetchOptions() {
    try {
      const [barangResult, sparepartResult] = await Promise.all([
        getBarang(),
        getSparepart(),
      ]);

      setBarangOptions(
        (barangResult.data || []).map((item: BarangApiItem) => ({
          value: item.id,
          label: `${item.nama_barang} - ${item.kode_barang}`,
          stokSistem: Number(item.stock || 0),
        }))
      );

      setSparepartOptions(
        (sparepartResult.data || []).map((item: SparepartApiItem) => ({
          value: item.id,
          label: `${item.nama_sparepart} - ${item.kode_sparepart}`,
          stokSistem: Number(item.stock || 0),
        }))
      );
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data barang dan sparepart.",
        color: "red",
      });
    }
  }

  useEffect(() => {
    fetchOptions();
  }, []);

  function getItemOptionsByType(tipeItem: StokOpnameItemType) {
    return tipeItem === "Barang" ? barangOptions : sparepartOptions;
  }

  function handleAddItem() {
    setDetailItems((prev) => [...prev, createEmptyItem()]);
  }

  function handleDeleteItem(idItem: string) {
    setDetailItems((prev) => prev.filter((item) => item.id !== idItem));
  }

  function handleChangeItemType(
    idItem: string,
    value: StokOpnameItemType | null
  ) {
    setDetailItems((prev) =>
      prev.map((item) =>
        item.id === idItem
          ? {
              ...item,
              tipeItem: value ?? "Barang",
              idBarang: null,
              idSparepart: null,
              namaItem: null,
              stokSistem: 0,
              stokFisik: 0,
              selisih: 0,
            }
          : item
      )
    );
  }

  function handleChangeNamaItem(idItem: string, value: string | null) {
    setDetailItems((prev) =>
      prev.map((item) => {
        if (item.id !== idItem) {
          return item;
        }

        const selectedOption = getItemOptionsByType(item.tipeItem).find(
          (option) => option.value === value
        );

        const nextStokSistem = selectedOption?.stokSistem ?? 0;
        const nextStokFisik = selectedOption?.stokSistem ?? 0;
        const nextSelisih = getSelisih(nextStokSistem, nextStokFisik);

        if (item.tipeItem === "Barang") {
          return {
            ...item,
            idBarang: value,
            idSparepart: null,
            namaItem: selectedOption?.label ?? null,
            stokSistem: nextStokSistem,
            stokFisik: nextStokFisik,
            selisih: nextSelisih,
          };
        }

        return {
          ...item,
          idBarang: null,
          idSparepart: value,
          namaItem: selectedOption?.label ?? null,
          stokSistem: nextStokSistem,
          stokFisik: nextStokFisik,
          selisih: nextSelisih,
        };
      })
    );
  }

  function handleChangeStokFisik(idItem: string, value: number | string) {
    setDetailItems((prev) =>
      prev.map((item) => {
        if (item.id !== idItem) {
          return item;
        }

        const nextStokFisik = typeof value === "number" ? value : 0;

        return {
          ...item,
          stokFisik: nextStokFisik,
          selisih: getSelisih(item.stokSistem, nextStokFisik),
        };
      })
    );
  }

  function handleChangeKeteranganDetail(idItem: string, value: string) {
    setDetailItems((prev) =>
      prev.map((item) =>
        item.id === idItem
          ? {
              ...item,
              keterangan: value,
            }
          : item
      )
    );
  }

  async function handleSimpan() {
    try {
      if (!tanggalOpname) {
        notifications.show({
          title: "Gagal",
          message: "Tanggal opname wajib diisi.",
          color: "red",
        });
        return;
      }

      if (detailItems.length === 0) {
        notifications.show({
          title: "Gagal",
          message: "Detail stok opname wajib diisi minimal 1 item.",
          color: "red",
        });
        return;
      }

      const invalidItem = detailItems.some((item) => {
        const idItem = item.tipeItem === "Barang" ? item.idBarang : item.idSparepart;
        return !idItem || item.stokFisik < 0;
      });

      if (invalidItem) {
        notifications.show({
          title: "Gagal",
          message: "Semua item wajib dipilih dan stok fisik tidak boleh negatif.",
          color: "red",
        });
        return;
      }

      setIsSubmitting(true);

      const detailPayload: StokOpnameDetailPayload[] = detailItems.map(
        (item) => ({
          tipe_item: item.tipeItem,
          id_barang: item.tipeItem === "Barang" ? item.idBarang : null,
          id_sparepart:
            item.tipeItem === "Sparepart" ? item.idSparepart : null,
          stock_fisik: item.stokFisik,
          keterangan: item.keterangan,
        })
      );

      await createStokOpname({
        id_user: ADMIN_GUDANG_USER_ID,
        tanggal_opname: tanggalOpname,
        keterangan: keteranganHeader,
        detail_items: detailPayload,
      });

      notifications.show({
        title: "Berhasil",
        message: "Data stok opname berhasil disimpan.",
        color: "green",
      });

      router.push("/admin_gudang/inventory/stok-opname");
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan stok opname.",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Stack gap={24}>
      <Title order={1} fw={800} c="#000000">
        Tambah Stok Opname
      </Title>

      <Paper
        radius="lg"
        shadow="xs"
        withBorder
        styles={{
          root: {
            overflow: "hidden",
            borderColor: "#D8D8D8",
          },
        }}
      >
        <Box
          px="md"
          py={10}
          bg="#D7D7D7"
          style={{ borderBottom: "1px solid #D8D8D8" }}
        >
          <SectionLabel>Informasi Opname</SectionLabel>
        </Box>

        <Box p="md" bg="#ECECEC">
          <Stack gap={22}>
            <Group align="flex-start" grow>
              <Box w="28%">
                <FieldLabel>Tanggal Opname</FieldLabel>
              </Box>

              <TextInput
                type="date"
                value={tanggalOpname}
                onChange={(event) => setTanggalOpname(event.currentTarget.value)}
                styles={{
                  input: {
                    backgroundColor: "#E2E2E2",
                    border: "none",
                    height: 42,
                  },
                }}
              />
            </Group>

            <Group align="flex-start" grow>
              <Box w="28%">
                <FieldLabel>Keterangan</FieldLabel>
              </Box>

              <Textarea
                value={keteranganHeader}
                onChange={(event) =>
                  setKeteranganHeader(event.currentTarget.value)
                }
                placeholder="Masukkan keterangan stok opname disini..."
                minRows={4}
                styles={{
                  input: {
                    backgroundColor: "#E2E2E2",
                    border: "none",
                  },
                }}
              />
            </Group>

            <Group align="flex-start" grow>
              <Box w="28%">
                <FieldLabel>Selisih Stock</FieldLabel>
              </Box>

              <TextInput
                value={getSelisihText(totalSelisihStock)}
                readOnly
                styles={{
                  input: {
                    backgroundColor: "#E2E2E2",
                    border: "none",
                    height: 42,
                    fontWeight: 700,
                    color: getSelisihColor(totalSelisihStock),
                  },
                }}
              />
            </Group>
          </Stack>
        </Box>
      </Paper>

      <Paper
        radius="lg"
        shadow="xs"
        withBorder
        styles={{
          root: {
            overflow: "hidden",
            borderColor: "#D8D8D8",
          },
        }}
      >
        <Box
          px="md"
          py={10}
          style={{
            borderBottom: "1px solid #D8D8D8",
            background:
              "linear-gradient(90deg, rgba(240,240,245,1) 0%, rgba(247,247,250,1) 100%)",
          }}
        >
          <Group justify="space-between">
            <SectionLabel>Detail Stock Opname</SectionLabel>

            <Button
              radius="xl"
              leftSection={<IconPlus size={18} />}
              onClick={handleAddItem}
              style={{
                backgroundColor: "#0D4CB5",
                fontWeight: 700,
              }}
            >
              Tambah Item
            </Button>
          </Group>
        </Box>

        <Box p="md" bg="#F2F2F4">
          <Box
            style={{
              border: "1px solid #E1E1E1",
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: "#FFFFFF",
            }}
          >
            <Table
              horizontalSpacing="md"
              verticalSpacing="md"
              highlightOnHover={false}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Tipe Item</Table.Th>
                  <Table.Th>Nama Item</Table.Th>
                  <Table.Th>Stok Sistem</Table.Th>
                  <Table.Th>Stok Fisik</Table.Th>
                  <Table.Th>Selisih</Table.Th>
                  <Table.Th>Keterangan</Table.Th>
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
                          handleChangeItemType(
                            item.id,
                            (value as StokOpnameItemType | null) ?? "Barang"
                          )
                        }
                        data={[
                          { value: "Barang", label: "Barang" },
                          { value: "Sparepart", label: "Sparepart" },
                        ]}
                      />
                    </Table.Td>

                    <Table.Td>
                      <Select
                        value={item.idBarang ?? item.idSparepart}
                        onChange={(value) =>
                          handleChangeNamaItem(item.id, value)
                        }
                        data={getItemOptionsByType(item.tipeItem).map(
                          (option) => ({
                            value: option.value,
                            label: option.label,
                          })
                        )}
                        placeholder="Pilih item"
                        searchable
                      />
                    </Table.Td>

                    <Table.Td>
                      <Text fw={600}>{item.stokSistem}</Text>
                    </Table.Td>

                    <Table.Td>
                      <NumberInput
                        value={item.stokFisik}
                        onChange={(value) =>
                          handleChangeStokFisik(
                            item.id,
                            typeof value === "number" ? value : 0
                          )
                        }
                        allowDecimal={false}
                        decimalScale={0}
                        min={0}
                      />
                    </Table.Td>

                    <Table.Td
                      style={{
                        color: getSelisihColor(item.selisih),
                        fontWeight: 700,
                      }}
                    >
                      {getSelisihText(item.selisih)}
                    </Table.Td>

                    <Table.Td>
                      <TextInput
                        value={item.keterangan ?? ""}
                        onChange={(event) =>
                          handleChangeKeteranganDetail(
                            item.id,
                            event.currentTarget.value
                          )
                        }
                        placeholder="Masukkan keterangan"
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
        </Box>
      </Paper>

      <Group justify="flex-end" mt={4} gap="lg">
        <Button
          radius="xl"
          onClick={() => router.push("/admin_gudang/inventory/stok-opname")}
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