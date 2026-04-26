"use client";

import { Box, Badge, Modal, SimpleGrid, Stack, Text } from "@mantine/core";

type StatusGaransi = "Aktif" | "Habis" | "Diklaim";

export type GaransiDetailData = {
  id: string;
  nomorTiket: string;
  namaPelanggan: string;
  perangkat: string;
  tanggalServis: string;
  periodeHari: number;
  tanggalBerakhir: string;
  status: StatusGaransi;
};

type GaransiDetailModalProps = {
  opened: boolean;
  onClose: () => void;
  data: GaransiDetailData | null;
};

function getStatusGaransiColor(status: StatusGaransi) {
  const colors: Record<StatusGaransi, string> = {
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
              <DetailItem label="Perangkat" value={data.perangkat} />
              <DetailItem label="Tanggal Servis" value={data.tanggalServis} />
              <DetailItem
                label="Masa Garansi"
                value={`${data.periodeHari} Hari`}
              />
              <DetailItem
                label="Tanggal Berakhir"
                value={data.tanggalBerakhir}
              />
            </SimpleGrid>

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