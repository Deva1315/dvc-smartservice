"use client";

import { ActionIcon, Card, NumberInput, Table, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { EmptyTableRow } from "./PosShared";

type CartItem = {
  id: string;
  nama: string;
  kode: string;
  harga: number;
  stok: number;
  qty: number;
};

type PosCartTableProps = {
  cart: CartItem[];
  isSubmitting: boolean;
  formatRupiah: (value: number) => string;
  onChangeQty: (id: string, value: number | string) => void;
  onHapusItem: (id: string) => void;
};

export default function PosCartTable({
  cart,
  isSubmitting,
  formatRupiah,
  onChangeQty,
  onHapusItem,
}: PosCartTableProps) {
  return (
    <Card radius="lg" withBorder p={0} style={{ overflow: "hidden" }}>
      <Table horizontalSpacing="md" verticalSpacing="md">
        <Table.Thead bg="#ECECF2">
          <Table.Tr>
            <Table.Th>Nama Barang</Table.Th>
            <Table.Th>Kode</Table.Th>
            <Table.Th>Harga</Table.Th>
            <Table.Th>Qty</Table.Th>
            <Table.Th>Subtotal</Table.Th>
            <Table.Th>Aksi</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {cart.length === 0 ? (
            <EmptyTableRow colSpan={6}>
              Belum ada barang di transaksi
            </EmptyTableRow>
          ) : (
            cart.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Text fw={600}>{item.nama}</Text>
                </Table.Td>

                <Table.Td>{item.kode}</Table.Td>

                <Table.Td>{formatRupiah(item.harga)}</Table.Td>

                <Table.Td>
                  <NumberInput
                    value={item.qty}
                    onChange={(value) => onChangeQty(item.id, value)}
                    min={1}
                    max={item.stok}
                    allowDecimal={false}
                    w={80}
                    disabled={isSubmitting}
                  />
                </Table.Td>

                <Table.Td>{formatRupiah(item.harga * item.qty)}</Table.Td>

                <Table.Td>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => onHapusItem(item.id)}
                    disabled={isSubmitting}
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
    </Card>
  );
}