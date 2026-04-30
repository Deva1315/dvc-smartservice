"use client";

import { Badge, Box, Modal, Stack, Table, Text } from "@mantine/core";

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
      <Text fw={700} fz={14} c="#6B7280">
        {label}
      </Text>
      <Text fw={600} fz={16} c="#111111">
        {value || "-"}
      </Text>
    </Stack>
  );
}

function getSelisihColor(value: number) {
  if (Math.abs(value) > 0) return "#C97A32";
  return "#111111";
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
          Detail Stok Opname
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
            <FieldItem
              label="Tanggal Opname"
              value={formatDisplayDate(data.tanggalOpname)}
            />
            <FieldItem label="User" value={data.userName} />
            <FieldItem label="Keterangan" value={data.keterangan || "-"} />

            <Stack gap={6}>
              <Text fw={700} fz={14} c="#6B7280">
                Selisih Stock
              </Text>
<Badge
  color={Math.abs(data.selisihStock) > 0 ? "yellow" : "gray"}
  variant="light"
  radius="sm"
  w="fit-content"
>
  {Math.abs(data.selisihStock)}
</Badge>
            </Stack>

            <Stack gap={10}>
              <Text fw={700} fz={16} c="#6B7280">
                Detail Stock Opname
              </Text>

              <Box
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid #E5E7EB",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <Table
                  horizontalSpacing="md"
                  verticalSpacing="md"
                  highlightOnHover={false}
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Tipe Item</Table.Th>
                      <Table.Th>Nama Item</Table.Th>
                      <Table.Th>Stok Sistem</Table.Th>
                      <Table.Th>Stok Fisik</Table.Th>
                      <Table.Th>Selisih</Table.Th>
                      <Table.Th>Keterangan</Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {data.items.map((item) => (
                      <Table.Tr key={item.id}>
                        <Table.Td>{item.tipeItem}</Table.Td>
                        <Table.Td>{item.namaItem || "-"}</Table.Td>
                        <Table.Td>{item.stokSistem}</Table.Td>
                        <Table.Td>{item.stokFisik}</Table.Td>
                        <Table.Td
                          style={{
                            color: getSelisihColor(item.selisih),
                            fontWeight: 700,
                          }}
                        >
                          {Math.abs(item.selisih)}
                        </Table.Td>
                        <Table.Td>{item.keterangan || "-"}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Box>
            </Stack>
          </Stack>
        )}
      </Box>
    </Modal>
  );
}