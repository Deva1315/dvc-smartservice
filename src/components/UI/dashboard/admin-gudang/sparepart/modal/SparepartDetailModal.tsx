"use client";

import {
  Badge,
  Box,
  Group,
  Image,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import StockBadge from "@/components/UI/common/badges/StockBadge";
import { formatCurrency } from "@/utils/currency-format/format-currency";

type SparepartDetailData = {
  id: string;
  nama: string;
  kode: string;
  merk: string;
  stok: number;
  harga: number;
  supplier: string;
  deskripsi: string | null;
  foto: string | null;
} | null;

type SparepartDetailModalProps = {
  opened: boolean;
  onClose: () => void;
  data: SparepartDetailData;
};

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

function getStockBadgeColor(stok: number) {
  if (stok <= 0) {
    return "red";
  }

  if (stok <= 5) {
    return "yellow";
  }

  return "green";
}

function getStockLabel(stok: number) {
  if (stok <= 0) {
    return "Stok Habis";
  }

  if (stok <= 5) {
    return `Stok Menipis (${stok})`;
  }

  return `Stok Tersedia (${stok})`;
}

function formatHarga(value: number) {
  return formatCurrency(value, {
    locale: "id-ID",
    prefix: "Rp ",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function SparepartDetailModal({
  opened,
  onClose,
  data,
}: SparepartDetailModalProps) {
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
      title="Detail Sparepart"
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
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                  <Box
                    style={{
                      width: "100%",
                      minHeight: 300,
                      borderRadius: 18,
                      overflow: "hidden",
                      backgroundColor: "#F9FAFB",
                      border: "1px solid #E5E7EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {data.foto ? (
                      <Image
                        src={data.foto}
                        alt={data.nama}
                        w="100%"
                        h={300}
                        fit="contain"
                        style={{
                          backgroundColor: "#F9FAFB",
                        }}
                      />
                    ) : (
                      <Stack align="center" gap={6}>
                        <Text fw={800} c="#9CA3AF">
                          Tidak ada foto
                        </Text>
                        <Text fz="sm" c="#9CA3AF">
                          Foto sparepart belum tersedia.
                        </Text>
                      </Stack>
                    )}
                  </Box>

                  <Stack gap="md" justify="space-between">
                    <Stack gap={6}>
                      <Group justify="space-between" align="flex-start" gap="md">
                        <Stack gap={6} style={{ minWidth: 0, flex: 1 }}>
                          <Text fw={800} fz={24} c="#111827" lineClamp={2}>
                            {data.nama}
                          </Text>

                          <Text fz="sm" c="#6B7280">
                            {data.kode || "-"} • {data.merk || "-"}
                          </Text>
                        </Stack>

                        <Badge
                          color={getStockBadgeColor(data.stok)}
                          variant="light"
                          radius="md"
                          size="lg"
                          style={{
                            textTransform: "none",
                            flexShrink: 0,
                            fontWeight: 800,
                          }}
                        >
                          {getStockLabel(data.stok)}
                        </Badge>
                      </Group>

                      <Text fw={900} fz={28} c="#0D4CB5" mt={8}>
                        {formatHarga(data.harga)}
                      </Text>
                    </Stack>

                    <Paper
                      radius="md"
                      p="md"
                      withBorder
                      style={{
                        borderColor: "#E5E7EB",
                        backgroundColor: "#F9FAFB",
                      }}
                    >
                      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                        <FieldItem label="Supplier" value={data.supplier} />
                        <FieldItem label="Merk" value={data.merk} />
                        <FieldItem label="Kode Sparepart" value={data.kode} />

                        <Stack gap={6}>
                          <Text fw={700} fz="sm" c="#6B7280">
                            Stok
                          </Text>

                          <StockBadge
                            value={data.stok}
                            label={String(data.stok)}
                            showValue={false}
                            radius="md"
                          />
                        </Stack>
                      </SimpleGrid>
                    </Paper>
                  </Stack>
                </SimpleGrid>
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
                      Informasi Sparepart
                    </Text>

                    <Text fz="sm" c="#6B7280">
                      Detail identitas, supplier, harga, dan stok sparepart.
                    </Text>
                  </Stack>

                  <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                    <FieldItem label="Nama Sparepart" value={data.nama} />
                    <FieldItem label="Kode Sparepart" value={data.kode} />
                    <FieldItem label="Merk" value={data.merk} />
                    <FieldItem label="Harga" value={formatHarga(data.harga)} />
                    <FieldItem label="Supplier" value={data.supplier} />

                    <Stack gap={6}>
                      <Text fw={700} fz="sm" c="#6B7280">
                        Stok
                      </Text>

                      <StockBadge
                        value={data.stok}
                        label={String(data.stok)}
                        showValue={false}
                        radius="md"
                      />
                    </Stack>
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
                      Deskripsi Sparepart
                    </Text>

                    <Text fz="sm" c="#6B7280">
                      Catatan tambahan, spesifikasi, atau informasi kondisi
                      sparepart.
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
                    {data.deskripsi || "-"}
                  </Text>
                </Stack>
              </Paper>
            </Stack>
          )}
        </Box>
      </Box>
    </Modal>
  );
}