"use client";

import { Box, Grid, Image, Modal, Stack, Text } from "@mantine/core";
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
      <Text fw={700} fz={14} c="#6B7280">
        {label}
      </Text>
      <Text fw={600} fz={16} c="#111111">
        {value || "-"}
      </Text>
    </Stack>
  );
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
      size="60rem"
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
        <Text fw={800} fz={26} c="#000000">
          Detail Sparepart
        </Text>
      }
    >
      <Box
        p="lg"
        bg="#D9D9D9"
        style={{
          border: "1px solid #D9D9D9",
          borderRadius: 16,
        }}
      >
        {!data ? null : (
          <Stack gap={24}>
            <Box
              style={{
                width: "100%",
                height: 240,
                borderRadius: 18,
                overflow: "hidden",
                backgroundColor: "#F5F7FB",
                border: "1px solid #E8EEF7",
              }}
            >
              {data.foto ? (
                <Image
                  src={data.foto}
                  alt={data.nama}
                  w="100%"
                  h="100%"
                  fit="contain"
                />
              ) : (
                <Box
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text c="dimmed">Tidak ada foto</Text>
                </Box>
              )}
            </Box>

            <Grid gap={22}>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <FieldItem label="Nama" value={data.nama} />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <FieldItem label="Kode" value={data.kode} />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <FieldItem label="Merk" value={data.merk} />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap={6}>
                  <Text fw={700} fz={14} c="#6B7280">
                    Stok
                  </Text>
                  <StockBadge
                    value={data.stok}
                    label={String(data.stok)}
                    showValue={false}
                    radius="sm"
                  />
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <FieldItem
                  label="Harga"
                  value={formatCurrency(data.harga, {
                    locale: "id-ID",
                    prefix: "Rp ",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <FieldItem label="Supplier" value={data.supplier} />
              </Grid.Col>

              <Grid.Col span={12}>
                <FieldItem label="Deskripsi" value={data.deskripsi || "-"} />
              </Grid.Col>
            </Grid>
          </Stack>
        )}
      </Box>
    </Modal>
  );
}