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
import { IconPlus, IconTrash } from "@tabler/icons-react";
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
import { stokOpnameFormSchema, validateWithZod } from "@/lib/validations";

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

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <Text fw={700} fz={16} c="#111111">
      {children} {required ? <span style={{ color: "red" }}>*</span> : null}
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
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  function clearFieldError(field: string) {
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  }

  function clearDetailItemError(index: number, field: keyof StokOpnameDetailItem) {
    setErrors((prev) => ({
      ...prev,
      [`detailItems.${index}.${field}`]: "",
      detailItems: "",
    }));
  }

  function getDetailItemError(
    index: number,
    field: keyof StokOpnameDetailItem
  ) {
    return errors[`detailItems.${index}.${field}`];
  }

  function handleAddItem() {
    setDetailItems((prev) => [...prev, createEmptyItem()]);
    clearFieldError("detailItems");
  }

  function handleDeleteItem(idItem: string) {
    setDetailItems((prev) => {
      const nextItems = prev.filter((item) => item.id !== idItem);
      return nextItems.length > 0 ? nextItems : [createEmptyItem()];
    });

    setErrors((prev) => {
      const nextErrors = { ...prev };

      Object.keys(nextErrors).forEach((key) => {
        if (key.startsWith("detailItems")) {
          delete nextErrors[key];
        }
      });

      return nextErrors;
    });
  }

  function handleChangeItemType(
    idItem: string,
    value: StokOpnameItemType | null
  ) {
    setDetailItems((prev) =>
      prev.map((item, index) => {
        if (item.id !== idItem) return item;

        clearDetailItemError(index, "tipeItem");
        clearDetailItemError(index, "idBarang");
        clearDetailItemError(index, "idSparepart");
        clearDetailItemError(index, "namaItem");

        return {
          ...item,
          tipeItem: value ?? "Barang",
          idBarang: null,
          idSparepart: null,
          namaItem: null,
          stokSistem: 0,
          stokFisik: 0,
          selisih: 0,
        };
      })
    );
  }

  function handleChangeNamaItem(idItem: string, value: string | null) {
    setDetailItems((prev) =>
      prev.map((item, index) => {
        if (item.id !== idItem) {
          return item;
        }

        clearDetailItemError(index, "namaItem");
        clearDetailItemError(index, "idBarang");
        clearDetailItemError(index, "idSparepart");

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
      prev.map((item, index) => {
        if (item.id !== idItem) {
          return item;
        }

        clearDetailItemError(index, "stokFisik");
        clearDetailItemError(index, "selisih");

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
      prev.map((item, index) => {
        if (item.id !== idItem) return item;

        clearDetailItemError(index, "keterangan");

        return {
          ...item,
          keterangan: value,
        };
      })
    );
  }

  function validateForm() {
    const parsed = validateWithZod(stokOpnameFormSchema, {
      tanggalOpname,
      keteranganHeader,
      detailItems,
    });

    if (!parsed.success) {
      setErrors(parsed.errors);

      notifications.show({
        title: "Validasi gagal",
        message: parsed.message,
        color: "red",
      });

      return null;
    }

    setErrors({});
    return parsed.data;
  }

  async function handleSimpan() {
    const validated = validateForm();

    if (!validated) {
      return;
    }

    try {
      setIsSubmitting(true);

      const detailPayload: StokOpnameDetailPayload[] =
        validated.detailItems.map((item) => ({
          tipe_item: item.tipeItem,
          id_barang: item.tipeItem === "Barang" ? item.idBarang ?? null : null,
          id_sparepart:
            item.tipeItem === "Sparepart" ? item.idSparepart ?? null : null,
          stock_fisik: item.stokFisik,
          keterangan: item.keterangan ?? null,
        }));

      await createStokOpname({
        id_user: ADMIN_GUDANG_USER_ID,
        tanggal_opname: String(validated.tanggalOpname),
        keterangan: validated.keteranganHeader ?? null,
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
                <FieldLabel required>Tanggal Opname</FieldLabel>
              </Box>

              <TextInput
                type="date"
                value={tanggalOpname}
                onChange={(event) => {
                  setTanggalOpname(event.currentTarget.value);
                  clearFieldError("tanggalOpname");
                }}
                disabled={isSubmitting}
                error={errors.tanggalOpname}
                styles={{
                  input: {
                    backgroundColor: "#E2E2E2",
                    border: errors.tanggalOpname
                      ? "1px solid #FA5252"
                      : "none",
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
                onChange={(event) => {
                  setKeteranganHeader(event.currentTarget.value);
                  clearFieldError("keteranganHeader");
                }}
                placeholder="Masukkan keterangan stok opname disini..."
                minRows={4}
                disabled={isSubmitting}
                error={errors.keteranganHeader}
                styles={{
                  input: {
                    backgroundColor: "#E2E2E2",
                    border: errors.keteranganHeader
                      ? "1px solid #FA5252"
                      : "none",
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
            <Stack gap={2}>
              <SectionLabel>Detail Stock Opname</SectionLabel>

              {errors.detailItems ? (
                <Text fz={13} c="red" fw={600}>
                  {errors.detailItems}
                </Text>
              ) : null}
            </Stack>

            <Button
              radius="xl"
              leftSection={<IconPlus size={18} />}
              onClick={handleAddItem}
              disabled={isSubmitting}
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
                {detailItems.map((item, index) => (
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
                        disabled={isSubmitting}
                        error={getDetailItemError(index, "tipeItem")}
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
                        disabled={isSubmitting}
                        error={
                          getDetailItemError(index, "namaItem") ||
                          getDetailItemError(index, "idBarang") ||
                          getDetailItemError(index, "idSparepart")
                        }
                      />
                    </Table.Td>

                    <Table.Td>
                      <Text fw={600}>{item.stokSistem}</Text>

                      {getDetailItemError(index, "stokSistem") ? (
                        <Text fz={12} c="red" mt={4}>
                          {getDetailItemError(index, "stokSistem")}
                        </Text>
                      ) : null}
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
                        disabled={isSubmitting}
                        error={getDetailItemError(index, "stokFisik")}
                      />
                    </Table.Td>

                    <Table.Td
                      style={{
                        color: getSelisihColor(item.selisih),
                        fontWeight: 700,
                      }}
                    >
                      {getSelisihText(item.selisih)}

                      {getDetailItemError(index, "selisih") ? (
                        <Text fz={12} c="red" mt={4}>
                          {getDetailItemError(index, "selisih")}
                        </Text>
                      ) : null}
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
                        disabled={isSubmitting}
                        error={getDetailItemError(index, "keterangan")}
                      />
                    </Table.Td>

                    <Table.Td>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={isSubmitting}
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
          disabled={isSubmitting}
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