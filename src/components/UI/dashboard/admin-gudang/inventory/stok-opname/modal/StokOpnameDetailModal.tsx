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
} from "@mantine/core";

type StokOpnameDetailItem = {
  id: string;
  tipeItem: "Barang" | "Sparepart";
  namaItem: string;
  stokSistem: number;
  stokFisik: number;
  selisih: number;
  keterangan: string | null;
};

type StokOpnameRow = {
  id: string;
  no: number;
  tanggalOpname: string;
  idUser: string;
  userName: string;
  selisihStock: number;
  keterangan: string | null;
  items: StokOpnameDetailItem[];
};

type StokOpnameDetailModalProps = {
  opened: boolean;
  onClose: () => void;
  data: StokOpnameRow | null;
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

function getSelisihColor(value: number) {
  return Math.abs(value) > 0 ? "yellow" : "green";
}

function getSelisihText(value: number) {
  return Math.abs(value) > 0 ? `Ada Selisih (${Math.abs(value)})` : "Sesuai";
}

export default function StokOpnameDetailModal({
  opened,
  onClose,
  data,
}: StokOpnameDetailModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="78rem"
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
      title="Detail Stok Opname"
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
                  <Stack gap={4}>
                    <Text fw={800} fz={22} c="#111827">
                      Stok Opname No. {data.no}
                    </Text>

                    <Text fz="sm" c="#6B7280">
                      Pemeriksaan stok fisik dibandingkan dengan stok sistem.
                    </Text>
                  </Stack>

                  <Badge
                    color={getSelisihColor(data.selisihStock)}
                    variant="light"
                    radius="md"
                    size="lg"
                    style={{
                      textTransform: "none",
                      fontWeight: 800,
                    }}
                  >
                    {getSelisihText(data.selisihStock)}
                  </Badge>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mt="lg">
                  <FieldItem
                    label="Tanggal Opname"
                    value={formatDisplayDate(data.tanggalOpname)}
                  />
                  <FieldItem label="User" value={data.userName} />
                  <FieldItem label="Total Selisih" value={Math.abs(data.selisihStock)} />
                  <FieldItem label="Jumlah Item" value={data.items.length} />
                </SimpleGrid>
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
                <Stack gap={6}>
                  <Text fw={800} fz="lg" c="#111827">
                    Keterangan
                  </Text>

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
                  <Group justify="space-between" align="center">
                    <Stack gap={4}>
                      <Text fw={800} fz="lg" c="#111827">
                        Detail Stock Opname
                      </Text>

                      <Text fz="sm" c="#6B7280">
                        Daftar item yang diperiksa dalam proses stok opname.
                      </Text>
                    </Stack>

                    <Badge
                      color="gray"
                      variant="light"
                      radius="md"
                      size="lg"
                      style={{
                        textTransform: "none",
                        fontWeight: 800,
                      }}
                    >
                      {data.items.length} baris
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
                          whiteSpace: "nowrap",
                        },
                        td: {
                          color: "#111827",
                          fontSize: 15,
                          fontWeight: 600,
                          borderBottom: "1px solid #F1F5F9",
                          verticalAlign: "top",
                        },
                      }}
                    >
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th style={{ width: 60 }}>No</Table.Th>
                          <Table.Th style={{ width: 140 }}>Tipe</Table.Th>
                          <Table.Th>Nama Item</Table.Th>
                          <Table.Th style={{ width: 120, textAlign: "right" }}>
                            Stok Sistem
                          </Table.Th>
                          <Table.Th style={{ width: 120, textAlign: "right" }}>
                            Stok Fisik
                          </Table.Th>
                          <Table.Th style={{ width: 100, textAlign: "right" }}>
                            Selisih
                          </Table.Th>
                          <Table.Th>Keterangan</Table.Th>
                        </Table.Tr>
                      </Table.Thead>

                      <Table.Tbody>
                        {data.items.length > 0 ? (
                          data.items.map((item, index) => (
                            <Table.Tr key={item.id}>
                              <Table.Td>{index + 1}</Table.Td>

                              <Table.Td>
                                <Badge
                                  color={item.tipeItem === "Barang" ? "blue" : "grape"}
                                  variant="light"
                                  radius="md"
                                  style={{
                                    textTransform: "none",
                                    fontWeight: 800,
                                  }}
                                >
                                  {item.tipeItem}
                                </Badge>
                              </Table.Td>

                              <Table.Td>
                                <Text fw={700} c="#111827">
                                  {item.namaItem || "-"}
                                </Text>
                              </Table.Td>

                              <Table.Td ta="right">{item.stokSistem}</Table.Td>
                              <Table.Td ta="right">{item.stokFisik}</Table.Td>

                              <Table.Td ta="right">
                                <Text
                                  fw={900}
                                  c={Math.abs(item.selisih) > 0 ? "#C97A32" : "#16A34A"}
                                >
                                  {Math.abs(item.selisih)}
                                </Text>
                              </Table.Td>

                              <Table.Td>
                                <Text
                                  fz={14}
                                  c="#374151"
                                  style={{
                                    lineHeight: 1.5,
                                    whiteSpace: "pre-line",
                                  }}
                                >
                                  {item.keterangan || "-"}
                                </Text>
                              </Table.Td>
                            </Table.Tr>
                          ))
                        ) : (
                          <Table.Tr>
                            <Table.Td colSpan={7}>
                              <Text ta="center" c="#6B7280" py="md">
                                Tidak ada detail stok opname.
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