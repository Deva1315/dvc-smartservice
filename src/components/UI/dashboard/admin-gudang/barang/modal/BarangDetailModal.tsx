"use client";

import {
  Badge,
  Box,
  Grid,
  Image,
  Modal,
  Stack,
  Text,
} from "@mantine/core";

type BarangDetailData = {
  id: string;
  nama: string;
  kode: string;
  merk: string;
  stok: number;
  harga: number;
  kategori: string;
  supplier: string;
  deskripsi: string | null;
  foto: string | null;
} | null;

type BarangDetailModalProps = {
  opened: boolean;
  onClose: () => void;
  data: BarangDetailData;
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getStockBadgeColor(stok: number) {
  if (stok <= 0) return "red";
  if (stok <= 5) return "yellow";
  return "green";
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
      <Text fw={700} fz={14} c="#6B7280">
        {label}
      </Text>
      <Text fw={600} fz={16} c="#111111">
        {value || "-"}
      </Text>
    </Stack>
  );
}

export default function BarangDetailModal({
  opened,
  onClose,
  data,
}: BarangDetailModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={800} fz={28} c="#000000">
          Detail Barang
        </Text>
      }
      centered
      size={860}
      radius={24}
      padding={28}
      overlayProps={{
        backgroundOpacity: 0.45,
        blur: 2,
      }}
    >
      {!data ? null : (
        <Stack gap={24}>
          <Box
            style={{
              width: "100%",
              height: 260,
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
                <Badge
                  color={getStockBadgeColor(data.stok)}
                  variant="light"
                  radius="sm"
                  w="fit-content"
                >
                  {data.stok}
                </Badge>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <FieldItem label="Harga" value={formatRupiah(data.harga)} />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <FieldItem label="Kategori" value={data.kategori} />
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
    </Modal>
  );
}