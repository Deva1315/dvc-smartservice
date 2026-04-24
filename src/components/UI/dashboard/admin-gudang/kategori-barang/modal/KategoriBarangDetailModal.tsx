"use client";

import {
  Box,
  Modal,
  Stack,
  Text,
} from "@mantine/core";

type KategoriBarangDetailData = {
  id: string;
  no: number;
  nama: string;
  deskripsi: string | null;
} | null;

type KategoriBarangDetailModalProps = {
  opened: boolean;
  onClose: () => void;
  data: KategoriBarangDetailData;
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

export default function KategoriBarangDetailModal({
  opened,
  onClose,
  data,
}: KategoriBarangDetailModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="50rem"
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
          Detail Kategori Barang
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
            <FieldItem label="Nama" value={data.nama} />
            <FieldItem label="Deskripsi" value={data.deskripsi || "-"} />
          </Stack>
        )}
      </Box>
    </Modal>
  );
}