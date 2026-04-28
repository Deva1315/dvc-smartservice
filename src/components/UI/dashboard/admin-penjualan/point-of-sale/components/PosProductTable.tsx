"use client";

import {
  Badge,
  Button,
  Card,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { EmptyTableRow } from "./PosShared";

type Barang = {
  id: string;
  nama: string;
  kode: string;
  harga: number;
  stok: number;
};

type PosProductTableProps = {
  search: string;
  onSearchChange: (value: string) => void;
  data: Barang[];
  isLoading: boolean;
  isSubmitting: boolean;
  formatRupiah: (value: number) => string;
  onTambahBarang: (barang: Barang) => void;
};

export default function PosProductTable({
  search,
  onSearchChange,
  data,
  isLoading,
  isSubmitting,
  formatRupiah,
  onTambahBarang,
}: PosProductTableProps) {
  return (
    <Stack gap={26}>
      <TextInput
        value={search}
        onChange={(event) => onSearchChange(event.currentTarget.value)}
        placeholder="Cari nama barang atau kode barang..."
        leftSection={<IconSearch size={20} color="#555555" />}
        radius="xl"
        styles={{
          input: {
            height: 58,
            fontSize: 16,
            backgroundColor: "#FFFFFF",
          },
        }}
      />

      <Card radius="lg" withBorder p={0} style={{ overflow: "hidden" }}>
        <Table horizontalSpacing="md" verticalSpacing="md">
          <Table.Thead bg="#ECECF2">
            <Table.Tr>
              <Table.Th>Nama Barang</Table.Th>
              <Table.Th>Kode</Table.Th>
              <Table.Th>Harga</Table.Th>
              <Table.Th>Stok</Table.Th>
              <Table.Th>Aksi</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {isLoading ? (
              <EmptyTableRow colSpan={5}>Memuat data barang...</EmptyTableRow>
            ) : data.length === 0 ? (
              <EmptyTableRow colSpan={5}>
                Data barang tidak ditemukan
              </EmptyTableRow>
            ) : (
              data.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Text fw={600}>{item.nama}</Text>
                  </Table.Td>

                  <Table.Td>{item.kode}</Table.Td>

                  <Table.Td>{formatRupiah(item.harga)}</Table.Td>

                  <Table.Td>
                    <Badge
                      color={item.stok > 0 ? "green" : "red"}
                      variant="light"
                    >
                      {item.stok}
                    </Badge>
                  </Table.Td>

                  <Table.Td>
                    <Button
                      size="xs"
                      color="green"
                      radius="md"
                      leftSection={<IconPlus size={14} />}
                      onClick={() => onTambahBarang(item)}
                      disabled={item.stok <= 0 || isSubmitting}
                    >
                      Tambah
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Card>
    </Stack>
  );
}