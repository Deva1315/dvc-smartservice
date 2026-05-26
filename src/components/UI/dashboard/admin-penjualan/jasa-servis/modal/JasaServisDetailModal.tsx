"use client";

import { Box, Group, Modal, Paper, SimpleGrid, Stack, Text } from "@mantine/core";

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
      <Text fw={700} fz="sm" c="#6B7280">
        {label}
      </Text>

      <Text fw={800} fz={16} c="#111827" style={{ lineHeight: 1.5 }}>
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
      title="Detail Jasa Servis"
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
                  <Stack gap={4}>
                    <Text fw={800} fz="lg" c="#111827">
                      Informasi Jasa Servis
                    </Text>

                    <Text fz="sm" c="#6B7280">
                      Detail nama jasa, harga, dan jam operasional layanan.
                    </Text>
                  </Stack>

                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                    <DetailItem label="Nama Jasa Servis" value={data.nama} />
                    <DetailItem label="Harga" value={formatRupiah(data.harga)} />
                    <DetailItem
                      label="Jam Operasional"
                      value={data.jamOperasional}
                    />
                    <DetailItem label="Slug" value={data.slug} />
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
                  <Group justify="space-between" align="center">
                    <Stack gap={4}>
                      <Text fw={800} fz="lg" c="#111827">
                        Deskripsi
                      </Text>

                      <Text fz="sm" c="#6B7280">
                        Penjelasan singkat mengenai cakupan jasa servis.
                      </Text>
                    </Stack>
                  </Group>

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