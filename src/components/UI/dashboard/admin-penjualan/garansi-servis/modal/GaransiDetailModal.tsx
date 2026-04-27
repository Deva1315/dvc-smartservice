"use client";

import { Box, Badge, Modal, SimpleGrid, Stack, Text } from "@mantine/core";
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
      <Text fw={700} fz={15} c="#6B7280">
        {label}
      </Text>
      <Text fw={700} fz={18} c="#111111">
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
      size="52rem"
      radius="xl"
      closeButtonProps={{
        size: "lg",
        radius: "xl",
      }}
      styles={{
        body: {
          padding: 0,
          backgroundColor: "#D9D9D9",
        },
        header: {
          backgroundColor: "#D9D9D9",
          paddingBottom: 0,
        },
        content: {
          backgroundColor: "#D9D9D9",
        },
      }}
      title={
        <Text fw={800} fz={30} c="#000000">
          Detail Garansi
        </Text>
      }
    >
      <Box p="lg">
        {!data ? null : (
          <Stack gap={24}>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
              <DetailItem label="No. Tiket" value={data.nomorTiket} />
              <DetailItem label="Nama Pelanggan" value={data.namaPelanggan} />
              <DetailItem label="No. HP" value={data.noHp} />
              <DetailItem label="Perangkat" value={data.perangkat} />
              <DetailItem label="Tanggal Servis" value={data.tanggalServis} />
              <DetailItem label="Tanggal Mulai" value={data.tanggalMulai} />
              <DetailItem
                label="Masa Garansi"
                value={`${data.periodeHari} Hari`}
              />
              <DetailItem
                label="Tanggal Berakhir"
                value={data.tanggalBerakhir}
              />
              <DetailItem
                label="Total Pembayaran"
                value={
                  formatCurrency
                    ? formatCurrency(data.totalPembayaran)
                    : data.totalPembayaran
                }
              />
              <DetailItem label="Dibuat Oleh" value={data.admin?.nama} />
            </SimpleGrid>

            <Stack gap={6}>
              <Text fw={700} fz={15} c="#6B7280">
                Keterangan Garansi
              </Text>
              <Text fw={700} fz={18} c="#111111">
                {data.keteranganGaransi || "-"}
              </Text>
            </Stack>

            <Stack gap={6}>
              <Text fw={700} fz={15} c="#6B7280">
                Status
              </Text>

              <Badge
                color={getStatusGaransiColor(data.status)}
                variant="filled"
                radius="md"
                size="lg"
                w="fit-content"
                style={{
                  textTransform: "none",
                }}
              >
                {data.status}
              </Badge>
            </Stack>
          </Stack>
        )}
      </Box>
    </Modal>
  );
}