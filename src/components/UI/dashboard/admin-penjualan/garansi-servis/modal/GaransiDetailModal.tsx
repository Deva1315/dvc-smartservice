"use client";

import {
  Badge,
  Box,
  Group,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import type { StatusGaransiUi } from "@/lib/admin-penjualan/admin-penjualan-garansi-servis.client";

export type GaransiDetailData = {
  id: string;
  nomorTiket: string;
  namaPelanggan: string;
  noHp: string;
  perangkat: string;
  tanggalServis: string;
  tanggalMulai: string;
  periodeHari: number;
  tanggalBerakhir: string;
  status: StatusGaransiUi;
  keteranganGaransi: string | null;
  totalPembayaran: string | number;
  admin: {
    id: string;
    nama: string;
    email: string;
  };
};

type GaransiDetailModalProps = {
  opened: boolean;
  onClose: () => void;
  data: GaransiDetailData | null;
  formatCurrency?: (value: string | number | null | undefined) => string;
};

function getStatusGaransiColor(status: StatusGaransiUi) {
  const colors: Record<StatusGaransiUi, string> = {
    Aktif: "green",
    Habis: "yellow",
    Diklaim: "blue",
  };

  return colors[status];
}

function DetailItem({
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

export default function GaransiDetailModal({
  opened,
  onClose,
  data,
  formatCurrency,
}: GaransiDetailModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="56rem"
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
      title="Detail Garansi"
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
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start" gap="md">
                    <Stack gap={4}>
                      <Text fw={800} fz="lg" c="#111827">
                        Informasi Garansi
                      </Text>

                      <Text fz="sm" c="#6B7280">
                        Detail tiket servis, status garansi, dan periode masa
                        garansi.
                      </Text>
                    </Stack>

                    <Badge
                      color={getStatusGaransiColor(data.status)}
                      variant="filled"
                      radius="md"
                      size="lg"
                      style={{
                        textTransform: "none",
                        flexShrink: 0,
                      }}
                    >
                      {data.status}
                    </Badge>
                  </Group>

                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                    <DetailItem label="No. Tiket" value={data.nomorTiket} />
                    <DetailItem label="Tanggal Servis" value={data.tanggalServis} />
                    <DetailItem label="Tanggal Mulai" value={data.tanggalMulai} />
                    <DetailItem
                      label="Tanggal Berakhir"
                      value={data.tanggalBerakhir}
                    />
                    <DetailItem
                      label="Masa Garansi"
                      value={`${data.periodeHari} Hari`}
                    />
                    <DetailItem
                      label="Total Pembayaran"
                      value={
                        formatCurrency
                          ? formatCurrency(data.totalPembayaran)
                          : data.totalPembayaran
                      }
                    />
                  </SimpleGrid>
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
                  <Stack gap={4}>
                    <Text fw={800} fz="lg" c="#111827">
                      Data Customer dan Perangkat
                    </Text>

                    <Text fz="sm" c="#6B7280">
                      Informasi pelanggan dan perangkat yang mendapatkan
                      garansi.
                    </Text>
                  </Stack>

                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                    <DetailItem
                      label="Nama Pelanggan"
                      value={data.namaPelanggan}
                    />
                    <DetailItem label="No. HP" value={data.noHp} />
                    <DetailItem label="Perangkat" value={data.perangkat} />
                    <DetailItem label="Dibuat Oleh" value={data.admin?.nama} />
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
                      Keterangan Garansi
                    </Text>

                    <Text fz="sm" c="#6B7280">
                      Catatan tambahan mengenai ketentuan atau kondisi garansi.
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
                    {data.keteranganGaransi || "-"}
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