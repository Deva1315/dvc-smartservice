"use client";

import { useMemo, useState } from "react";
import {
  ActionIcon,
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
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import InvoicePenjualanPDF, {
  type InvoicePenjualanData,
} from "@/components/UI/dashboard/admin-penjualan/point-of-sale/InvoicePenjualanPDF";

type Barang = {
  id: string;
  nama: string;
  kode: string;
  harga: number;
  stok: number;
};

type CartItem = Barang & {
  qty: number;
};

const dummyBarang: Barang[] = [
  {
    id: "1",
    nama: "Monitor Samsung 24 inch",
    kode: "MON-001",
    harga: 1750000,
    stok: 5,
  },
  {
    id: "2",
    nama: "Laptop Acer Aspire 5",
    kode: "LAP-002",
    harga: 7200000,
    stok: 8,
  },
  {
    id: "3",
    nama: "HP Xiaomi Redmi Note 12",
    kode: "HP-003",
    harga: 3400000,
    stok: 12,
  },
  {
    id: "4",
    nama: "Hard Disk Eksternal Seagate 1TB",
    kode: "HDD-004",
    harga: 850000,
    stok: 7,
  },
];

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRupiahPrefix(value: number) {
  return `Rp ${formatRupiah(value)}`;
}

function generateNomorTransaksi() {
  return "INV-20260424-001";
}

export default function AdminPenjualanPointOfSalePage() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [metodePembayaran, setMetodePembayaran] = useState<"Cash" | "Transfer">(
    "Cash"
  );
  const [diskon, setDiskon] = useState<number | string>(0);
  const [nominalBayar, setNominalBayar] = useState<number | string>(0);

  const nomorTransaksi = generateNomorTransaksi();

  const filteredBarang = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return dummyBarang;

    return dummyBarang.filter(
      (item) =>
        item.nama.toLowerCase().includes(keyword) ||
        item.kode.toLowerCase().includes(keyword)
    );
  }, [search]);

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.harga * item.qty, 0);
  }, [cart]);

  const diskonNumber = Number(diskon || 0);
  const total = Math.max(subtotal - diskonNumber, 0);
  const nominalBayarNumber = Number(nominalBayar || 0);
  const kembalian =
    metodePembayaran === "Cash" ? Math.max(nominalBayarNumber - total, 0) : 0;

  const invoiceData: InvoicePenjualanData = {
    nomorTransaksi,
    tanggal: "24-04-2026",
    admin: "Admin Penjualan",
    metodePembayaran,
    items: cart.map((item) => ({
      nama: item.nama,
      qty: item.qty,
      harga: item.harga,
    })),
    diskon: diskonNumber,
    nominalBayar: nominalBayarNumber,
  };

  function handleTambahBarang(barang: Barang) {
    if (barang.stok <= 0) {
      notifications.show({
        title: "Stok habis",
        message: "Barang ini tidak memiliki stok.",
        color: "red",
      });
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === barang.id);

      if (existing) {
        if (existing.qty + 1 > barang.stok) {
          notifications.show({
            title: "Stok tidak cukup",
            message: "Jumlah melebihi stok barang.",
            color: "red",
          });
          return prev;
        }

        return prev.map((item) =>
          item.id === barang.id ? { ...item, qty: item.qty + 1 } : item
        );
      }

      return [...prev, { ...barang, qty: 1 }];
    });
  }

  function handleChangeQty(id: string, value: number | string) {
    const nextQty = typeof value === "number" ? value : 1;

    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        if (nextQty > item.stok) {
          notifications.show({
            title: "Stok tidak cukup",
            message: `Stok tersedia hanya ${item.stok}.`,
            color: "red",
          });

          return item;
        }

        return {
          ...item,
          qty: Math.max(nextQty, 1),
        };
      })
    );
  }

  function handleHapusItem(id: string) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  function handleBatal() {
    setCart([]);
    setDiskon(0);
    setNominalBayar(0);
    setMetodePembayaran("Cash");
  }

  function validateTransaksi() {
    if (cart.length === 0) {
      notifications.show({
        title: "Gagal",
        message: "Keranjang masih kosong.",
        color: "red",
      });
      return false;
    }

    if (diskonNumber > subtotal) {
      notifications.show({
        title: "Gagal",
        message: "Diskon tidak boleh melebihi subtotal.",
        color: "red",
      });
      return false;
    }

    if (metodePembayaran === "Cash" && nominalBayarNumber < total) {
      notifications.show({
        title: "Gagal",
        message: "Nominal bayar belum mencukupi.",
        color: "red",
      });
      return false;
    }

    return true;
  }

  function handleBayar() {
    const isValid = validateTransaksi();

    if (!isValid) {
      return;
    }

    notifications.show({
      title: "Berhasil",
      message: "Transaksi POS berhasil diproses dan invoice dibuat.",
      color: "green",
    });
  }

  return (
    <Group align="flex-start" gap={0} wrap="nowrap">
      <Box
        style={{
          width: "62%",
          paddingRight: 24,
        }}
      >
        <Stack gap={26}>
          <TextInput
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
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
                {filteredBarang.map((item) => (
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
                        onClick={() => handleTambahBarang(item)}
                      >
                        Tambah
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>

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
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Text ta="center" c="dimmed" py="md">
                        Belum ada barang di transaksi
                      </Text>
                    </Table.Td>
                  </Table.Tr>
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
                          onChange={(value) => handleChangeQty(item.id, value)}
                          min={1}
                          max={item.stok}
                          allowDecimal={false}
                          w={80}
                        />
                      </Table.Td>
                      <Table.Td>{formatRupiah(item.harga * item.qty)}</Table.Td>
                      <Table.Td>
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => handleHapusItem(item.id)}
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
        </Stack>
      </Box>

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
              <Text fz={15}>NO. TRANSAKSI: {nomorTransaksi}</Text>
              <Text fz={15}>TANGGAL: 24-04-2026</Text>
              <Text fz={15}>ADMIN: Admin Penjualan</Text>
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
                  onChange={setDiskon}
                  min={0}
                  max={subtotal}
                  allowDecimal={false}
                  thousandSeparator="."
                  decimalSeparator=","
                  w={160}
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
                onChange={(value) =>
                  setMetodePembayaran(value as "Cash" | "Transfer")
                }
              >
                <Group>
                  <Radio value="Cash" label="Cash" />
                  <Radio value="Transfer" label="Transfer" />
                </Group>
              </Radio.Group>

              <Group justify="space-between" align="center">
                <Text>Nominal Bayar</Text>
                <NumberInput
                  value={nominalBayar}
                  onChange={setNominalBayar}
                  min={0}
                  allowDecimal={false}
                  thousandSeparator="."
                  decimalSeparator=","
                  w={170}
                />
              </Group>

              <Group justify="space-between">
                <Text>Kembalian</Text>
                <Text>{formatRupiahPrefix(kembalian)}</Text>
              </Group>
            </Stack>
          </Card>

          <Group grow>
            <Button
              radius="xl"
              color="red"
              h={44}
              fw={800}
              fz={18}
              onClick={handleBatal}
            >
              Batal
            </Button>

            <Box style={{ flex: 1 }}>
              <PDFDownloadLink
                document={<InvoicePenjualanPDF data={invoiceData} />}
                fileName={`invoice-penjualan-${invoiceData.nomorTransaksi}.pdf`}
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
                    disabled={loading || cart.length === 0}
                    onClick={handleBayar}
                    style={{
                      backgroundColor: "#0D4CB5",
                    }}
                  >
                    {loading ? "Membuat Invoice..." : "Bayar"}
                  </Button>
                )}
              </PDFDownloadLink>
            </Box>
          </Group>
        </Stack>
      </Box>
    </Group>
  );
}