"use client";

import {
  Box,
  Modal,
  Stack,
  Table,
  Text,
} from "@mantine/core";

type InventoryItemDetail = {
  tipeItem: "Barang" | "Sparepart";
  namaItem: string;
  jumlah: number;
};

type InventoryDetailData = {
  id: string;
  no: number;
  tanggalMutasi: string;
  supplier: string;
  keterangan: string;
  totalItem: number;
  jenisMutasi: "Barang Masuk" | "Barang Keluar";
  detailItems: InventoryItemDetail[];
} | null;

type InventoryDetailModalProps = {
  opened: boolean;
  onClose: () => void;
  data: InventoryDetailData;
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

export default function InventoryDetailModal({
  opened,
  onClose,
  data,
}: InventoryDetailModalProps) {
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
          Detail Inventory
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
            <FieldItem label="Jenis Mutasi" value={data.jenisMutasi} />
            <FieldItem label="Tanggal Mutasi" value={data.tanggalMutasi} />
            <FieldItem label="Supplier" value={data.supplier} />
            <FieldItem label="Keterangan" value={data.keterangan} />
            <FieldItem label="Total Item" value={data.totalItem} />

            <Stack gap={10}>
              <Text fw={700} fz={16} c="#6B7280">
                Detail Item
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
                      <Table.Th>Jumlah</Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {data.detailItems.map((item, index) => (
                      <Table.Tr key={`${item.namaItem}-${index}`}>
                        <Table.Td>{item.tipeItem}</Table.Td>
                        <Table.Td>{item.namaItem}</Table.Td>
                        <Table.Td>{item.jumlah}</Table.Td>
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