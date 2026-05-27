"use client";

import {
  Badge,
  Box,
  Group,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconArrowDownToArc,
  IconArrowUpFromArc,
  IconBox,
  IconCalendar,
  IconPackages,
} from "@tabler/icons-react";

type InventoryItemDetail = {
  tipeItem: "Barang" | "Sparepart";
  namaItem: string;
  jumlah: number;
};

type InventoryDetailData = {
  id: string;
  no: number;
  tanggalMutasi: string;
  supplier: string;
  keterangan: string;
  totalItem: number;
  jenisMutasi: "Barang Masuk" | "Barang Keluar";
  detailItems: InventoryItemDetail[];
} | null;

type InventoryDetailModalProps = {
  opened: boolean;
  onClose: () => void;
  data: InventoryDetailData;
};

function getMutasiColor(jenisMutasi: InventoryDetailData extends null
  ? never
  : "Barang Masuk" | "Barang Keluar") {
  if (jenisMutasi === "Barang Masuk") {
    return "green";
  }

  return "red";
}

function FieldItem({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <Stack gap={6}>
      <Text fw={700} fz="sm" c="#6B7280">
        {label}
      </Text>

      <Text
        fw={800}
        fz={16}
        c="#111827"
        style={{
          lineHeight: 1.5,
          wordBreak: "break-word",
        }}
      >
        {value || "-"}
      </Text>
    </Stack>
  );
}

export default function InventoryDetailModal({
  opened,
  onClose,
  data,
}: InventoryDetailModalProps) {
  const isBarangMasuk = data?.jenisMutasi === "Barang Masuk";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="70rem"
      radius="xl"
      closeButtonProps={{
        size: "lg",
        radius: "xl",
      }}
      styles={{
        content: {
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
        },
        header: {
          backgroundColor: "#FFFFFF",
          padding: "26px 30px 10px",
          borderBottom: "1px solid #F1F5F9",
        },
        body: {
          padding: 0,
          backgroundColor: "#FFFFFF",
        },
        title: {
          color: "#111827",
          fontWeight: 800,
          fontSize: 24,
          lineHeight: 1.2,
        },
        close: {
          color: "#6B7280",
        },
      }}
      title="Detail Inventory"
    >
      <Box
        style={{
          maxHeight: "calc(100vh - 150px)",
          overflowY: "auto",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Box px={{ base: 20, sm: 30 }} py={26}>
          {!data ? null : (
            <Stack gap={24}>
              <Paper
                radius="lg"
                p={{ base: "md", sm: "lg" }}
                withBorder
                style={{
                  borderColor: "#E5E7EB",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <Group justify="space-between" align="flex-start" gap="md">
                  <Group align="flex-start" gap="md" style={{ minWidth: 0 }}>
                    <ThemeIcon
                      size={58}
                      radius="xl"
                      variant="light"
                      color={isBarangMasuk ? "green" : "red"}
                      style={{
                        flexShrink: 0,
                      }}
                    >
                      {isBarangMasuk ? (
                        <IconArrowDownToArc size={28} stroke={2} />
                      ) : (
                        <IconArrowUpFromArc size={28} stroke={2} />
                      )}
                    </ThemeIcon>

                    <Stack gap={6} style={{ minWidth: 0 }}>
                      <Group gap="sm" wrap="wrap">
                        <Text
                          fw={800}
                          fz={24}
                          c="#111827"
                          style={{
                            lineHeight: 1.2,
                            wordBreak: "break-word",
                          }}
                        >
                          Mutasi Inventory
                        </Text>

                        <Badge
                          color={getMutasiColor(data.jenisMutasi)}
                          variant="light"
                          radius="md"
                          size="lg"
                          style={{
                            textTransform: "none",
                            fontWeight: 800,
                          }}
                        >
                          {data.jenisMutasi}
                        </Badge>
                      </Group>

                      <Group gap="lg" wrap="wrap">
                        <Group gap={8}>
                          <IconCalendar size={18} color="#6B7280" />

                          <Text fw={700} fz="sm" c="#6B7280">
                            {data.tanggalMutasi}
                          </Text>
                        </Group>

                        <Group gap={8}>
                          <IconPackages size={18} color="#6B7280" />

                          <Text fw={700} fz="sm" c="#6B7280">
                            {data.totalItem} item
                          </Text>
                        </Group>
                      </Group>
                    </Stack>
                  </Group>

                  <Badge
                    color="blue"
                    variant="light"
                    radius="md"
                    size="lg"
                    style={{
                      textTransform: "none",
                      flexShrink: 0,
                      fontWeight: 800,
                    }}
                  >
                    No. {data.no}
                  </Badge>
                </Group>
              </Paper>

              <Paper
                radius="lg"
                p={{ base: "md", sm: "lg" }}
                withBorder
                style={{
                  borderColor: "#E5E7EB",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <Stack gap="md">
                  <Stack gap={4}>
                    <Text fw={800} fz="lg" c="#111827">
                      Informasi Mutasi
                    </Text>

                    <Text fz="sm" c="#6B7280">
                      Detail data mutasi inventory yang tercatat pada sistem.
                    </Text>
                  </Stack>

                  <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                    <FieldItem label="ID Mutasi" value={data.id} />
                    <FieldItem label="Tanggal Mutasi" value={data.tanggalMutasi} />
                    <FieldItem label="Jenis Mutasi" value={data.jenisMutasi} />
                    <FieldItem label="Supplier" value={data.supplier} />
                    <FieldItem label="Total Item" value={data.totalItem} />
                  </SimpleGrid>
                </Stack>
              </Paper>

              <Paper
                radius="lg"
                p={{ base: "md", sm: "lg" }}
                withBorder
                style={{
                  borderColor: "#E5E7EB",
                  backgroundColor: "#F9FAFB",
                }}
              >
                <Stack gap="md">
                  <Stack gap={4}>
                    <Text fw={800} fz="lg" c="#111827">
                      Keterangan
                    </Text>

                    <Text fz="sm" c="#6B7280">
                      Catatan tambahan mengenai proses mutasi inventory.
                    </Text>
                  </Stack>

                  <Text
                    fz={15}
                    c="#111827"
                    style={{
                      lineHeight: 1.7,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {data.keterangan || "-"}
                  </Text>
                </Stack>
              </Paper>

              <Paper
                radius="lg"
                p={{ base: "md", sm: "lg" }}
                withBorder
                style={{
                  borderColor: "#E5E7EB",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start" gap="md">
                    <Stack gap={4}>
                      <Text fw={800} fz="lg" c="#111827">
                        Detail Item
                      </Text>

                      <Text fz="sm" c="#6B7280">
                        Daftar barang atau sparepart yang terlibat dalam mutasi
                        inventory.
                      </Text>
                    </Stack>

                    <Badge
                      color="gray"
                      variant="light"
                      radius="md"
                      size="lg"
                      style={{
                        textTransform: "none",
                        flexShrink: 0,
                        fontWeight: 800,
                      }}
                    >
                      {data.detailItems.length} baris
                    </Badge>
                  </Group>

                  <Box
                    style={{
                      borderRadius: 16,
                      overflow: "hidden",
                      border: "1px solid #E5E7EB",
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <Table
                      horizontalSpacing="lg"
                      verticalSpacing="md"
                      highlightOnHover
                      styles={{
                        thead: {
                          backgroundColor: "#F9FAFB",
                        },
                        th: {
                          color: "#374151",
                          fontSize: 14,
                          fontWeight: 800,
                          borderBottom: "1px solid #E5E7EB",
                        },
                        td: {
                          color: "#111827",
                          fontSize: 15,
                          fontWeight: 600,
                          borderBottom: "1px solid #F1F5F9",
                        },
                      }}
                    >
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th style={{ width: 70 }}>No</Table.Th>
                          <Table.Th style={{ width: 160 }}>Tipe Item</Table.Th>
                          <Table.Th>Nama Item</Table.Th>
                          <Table.Th style={{ width: 120, textAlign: "right" }}>
                            Jumlah
                          </Table.Th>
                        </Table.Tr>
                      </Table.Thead>

                      <Table.Tbody>
                        {data.detailItems.length > 0 ? (
                          data.detailItems.map((item, index) => (
                            <Table.Tr key={`${item.namaItem}-${index}`}>
                              <Table.Td>{index + 1}</Table.Td>

                              <Table.Td>
                                <Badge
                                  color={
                                    item.tipeItem === "Barang" ? "blue" : "grape"
                                  }
                                  variant="light"
                                  radius="md"
                                  style={{
                                    textTransform: "none",
                                    fontWeight: 800,
                                  }}
                                  leftSection={<IconBox size={13} />}
                                >
                                  {item.tipeItem}
                                </Badge>
                              </Table.Td>

                              <Table.Td>
                                <Text fw={700} c="#111827">
                                  {item.namaItem}
                                </Text>
                              </Table.Td>

                              <Table.Td style={{ textAlign: "right" }}>
                                <Text fw={800} c="#111827">
                                  {item.jumlah}
                                </Text>
                              </Table.Td>
                            </Table.Tr>
                          ))
                        ) : (
                          <Table.Tr>
                            <Table.Td colSpan={4}>
                              <Text ta="center" c="#6B7280" py="md">
                                Tidak ada detail item.
                              </Text>
                            </Table.Td>
                          </Table.Tr>
                        )}
                      </Table.Tbody>
                    </Table>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          )}
        </Box>
      </Box>
    </Modal>
  );
}