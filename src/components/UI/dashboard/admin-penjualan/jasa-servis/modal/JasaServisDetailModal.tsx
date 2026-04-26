"use client";

import { Box, Modal, SimpleGrid, Stack, Text } from "@mantine/core";

type JasaServisDetailData = {
  id: string;
  slug: string;
  nama: string;
  harga: number;
  deskripsi: string | null;
  jamOperasional: string;
};

type JasaServisDetailModalProps = {
  opened: boolean;
  onClose: () => void;
  data: JasaServisDetailData | null;
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
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

export default function JasaServisDetailModal({
  opened,
  onClose,
  data,
}: JasaServisDetailModalProps) {
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
          Detail Jasa Servis
        </Text>
      }
    >
      <Box p="lg">
        {!data ? null : (
          <Stack gap={22}>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              <DetailItem label="Nama Jasa Servis" value={data.nama} />
              <DetailItem label="Harga" value={formatRupiah(data.harga)} />
              <DetailItem
                label="Jam Operasional"
                value={data.jamOperasional}
              />
            </SimpleGrid>

            <DetailItem label="Deskripsi" value={data.deskripsi || "-"} />
          </Stack>
        )}
      </Box>
    </Modal>
  );
}