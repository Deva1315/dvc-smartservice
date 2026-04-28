"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  NumberInput,
  Radio,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePenjualanPDF, {
  type InvoicePenjualanData,
} from "@/components/UI/dashboard/admin-penjualan/point-of-sale/InvoicePenjualanPDF";
import type { POSMetodePembayaran } from "@/lib/admin-penjualan/admin-penjualan-point-of-sale.client";

type CartItem = {
  id: string;
  nama: string;
  kode: string;
  harga: number;
  stok: number;
  qty: number;
};

type PosCheckoutPanelProps = {
  cart: CartItem[];
  nomorTransaksiPreview: string;
  tanggalPreview: string;
  adminPreview: string;
  lastInvoiceData: InvoicePenjualanData | null;
  subtotal: number;
  diskon: number | string;
  total: number;
  metodePembayaran: POSMetodePembayaran;
  nominalBayar: number | string;
  kembalian: number;
  isSubmitting: boolean;
  formatRupiah: (value: number) => string;
  formatRupiahPrefix: (value: number) => string;
  onChangeDiskon: (value: number | string) => void;
  onChangeMetodePembayaran: (value: string) => void;
  onChangeNominalBayar: (value: number | string) => void;
  onBatal: () => void;
  onBayar: () => void;
};

export default function PosCheckoutPanel({
  cart,
  nomorTransaksiPreview,
  tanggalPreview,
  adminPreview,
  lastInvoiceData,
  subtotal,
  diskon,
  total,
  metodePembayaran,
  nominalBayar,
  kembalian,
  isSubmitting,
  formatRupiah,
  formatRupiahPrefix,
  onChangeDiskon,
  onChangeMetodePembayaran,
  onChangeNominalBayar,
  onBatal,
  onBayar,
}: PosCheckoutPanelProps) {
  const isTransactionFinished = Boolean(lastInvoiceData);

  return (
    <Box
      style={{
        width: "38%",
        backgroundColor: "#F7F7FB",
        borderRadius: 16,
        minHeight: 690,
        padding: 18,
      }}
    >
      <Stack gap={18}>
        <Card radius="lg" withBorder p={0} style={{ overflow: "hidden" }}>
          <Box px="md" py={12} bg="#ECECF2">
            <Text fw={800} fz={20}>
              Keranjang
            </Text>
          </Box>

          <Stack gap={8} p="md">
            <Text fz={15}>NO. TRANSAKSI: {nomorTransaksiPreview}</Text>
            <Text fz={15}>TANGGAL: {tanggalPreview}</Text>
            <Text fz={15}>ADMIN: {adminPreview}</Text>

            {lastInvoiceData ? (
              <Badge color="green" variant="light" w="fit-content">
                Transaksi berhasil, nota siap dicetak
              </Badge>
            ) : null}
          </Stack>

          <Divider />

          <Table horizontalSpacing="md" verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nama Barang</Table.Th>
                <Table.Th>Qty</Table.Th>
                <Table.Th>Subtotal</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {cart.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text c="dimmed" ta="center">
                      Kosong
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                cart.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>{item.nama}</Table.Td>
                    <Table.Td>{item.qty}</Table.Td>
                    <Table.Td>{formatRupiah(item.harga * item.qty)}</Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>

          <Divider />

          <Stack gap={10} p="md">
            <Group justify="space-between">
              <Text>Subtotal:</Text>
              <Text>{formatRupiah(subtotal)}</Text>
            </Group>

            <Group justify="space-between" align="center">
              <Text>Diskon:</Text>
              <NumberInput
                value={diskon}
                onChange={onChangeDiskon}
                min={0}
                max={subtotal}
                allowDecimal={false}
                thousandSeparator="."
                decimalSeparator=","
                w={160}
                disabled={isSubmitting || cart.length === 0 || isTransactionFinished}
              />
            </Group>

            <Divider />

            <Group justify="space-between">
              <Text fw={800} fz={20}>
                Total:
              </Text>
              <Text fw={800} fz={22}>
                {formatRupiah(total)}
              </Text>
            </Group>

            <Text fw={700} mt="sm">
              Metode Pembayaran
            </Text>

            <Radio.Group
              value={metodePembayaran}
              onChange={onChangeMetodePembayaran}
            >
              <Group>
                <Radio
                  value="Cash"
                  label="Cash"
                  disabled={isSubmitting || isTransactionFinished}
                />
              </Group>
            </Radio.Group>

            <Group justify="space-between" align="center">
              <Text>Nominal Bayar</Text>
              <NumberInput
                value={metodePembayaran === "Cash" ? nominalBayar : total || 0}
                onChange={onChangeNominalBayar}
                min={0}
                allowDecimal={false}
                thousandSeparator="."
                decimalSeparator=","
                w={170}
                disabled={
                  isSubmitting ||
                  cart.length === 0 ||
                  metodePembayaran !== "Cash" ||
                  isTransactionFinished
                }
              />
            </Group>

            <Group justify="space-between">
              <Text>Kembalian</Text>
              <Text>{formatRupiahPrefix(kembalian)}</Text>
            </Group>
          </Stack>
        </Card>

        {!lastInvoiceData ? (
          <Group grow>
            <Button
              radius="xl"
              color="red"
              h={44}
              fw={800}
              fz={18}
              onClick={onBatal}
              disabled={isSubmitting}
            >
              Batal
            </Button>

            <Button
              radius="xl"
              h={44}
              fw={800}
              fz={18}
              fullWidth
              loading={isSubmitting}
              disabled={cart.length === 0 || isSubmitting}
              onClick={onBayar}
              style={{
                backgroundColor: "#0D4CB5",
              }}
            >
              Bayar
            </Button>
          </Group>
        ) : (
          <Stack gap={10}>
            <PDFDownloadLink
              document={<InvoicePenjualanPDF data={lastInvoiceData} />}
              fileName={`nota-penjualan-${lastInvoiceData.nomorTransaksi}.pdf`}
              style={{
                textDecoration: "none",
                width: "100%",
                display: "block",
              }}
            >
              {({ loading }) => (
                <Button
                  radius="xl"
                  h={44}
                  fw={800}
                  fz={18}
                  fullWidth
                  variant="outline"
                  disabled={loading}
                >
                  {loading ? "Membuat Nota..." : "Cetak Nota"}
                </Button>
              )}
            </PDFDownloadLink>

            <Button
              radius="xl"
              h={44}
              fw={800}
              fz={18}
              fullWidth
              onClick={onBatal}
              style={{
                backgroundColor: "#0D4CB5",
              }}
            >
              Transaksi Baru
            </Button>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}