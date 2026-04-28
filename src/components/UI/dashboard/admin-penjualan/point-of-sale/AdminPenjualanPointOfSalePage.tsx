"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
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
import { getCurrentSession } from "@/lib/auth/auth.client";
import {
  getPOSBarang,
  simpanPOSTransaksi,
  type POSBarangApiItem,
  type POSMetodePembayaran,
  type POSTransaksiApiItem,
} from "@/lib/admin-penjualan/admin-penjualan-point-of-sale.client";

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

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatRupiahPrefix(value: number) {
  return `Rp ${formatRupiah(value)}`;
}

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function numberInputToNumber(value: number | string) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDateDisplay(value: string | Date | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function mapBarangApiToBarang(item: POSBarangApiItem): Barang {
  return {
    id: String(item.id),
    nama: item.nama_barang,
    kode: item.kode_barang,
    harga: toNumber(item.harga),
    stok: toNumber(item.stock),
  };
}

function mapTransaksiToInvoiceData(
  transaksi: POSTransaksiApiItem
): InvoicePenjualanData {
  return {
    nomorTransaksi: transaksi.nomor_transaksi,
    tanggal: formatDateDisplay(transaksi.tanggal_transaksi),
    admin: transaksi.admin?.nama || "-",
    metodePembayaran: transaksi.metode_transaksi,
    items: transaksi.detail_transaksi.map((item) => ({
      nama: item.barang?.nama_barang || "Barang",
      qty: toNumber(item.jumlah),
      harga: toNumber(item.harga_satuan),
    })),
    diskon: toNumber(transaksi.diskon_transaksi),
    nominalBayar: toNumber(transaksi.nominal_bayar),
  };
}

function EmptyTableRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children: ReactNode;
}) {
  return (
    <Table.Tr>
      <Table.Td colSpan={colSpan}>
        <Text ta="center" c="dimmed" py="md">
          {children}
        </Text>
      </Table.Td>
    </Table.Tr>
  );
}

export default function AdminPenjualanPointOfSalePage() {
  const [search, setSearch] = useState("");
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [metodePembayaran, setMetodePembayaran] =
    useState<POSMetodePembayaran>("Cash");
  const [diskon, setDiskon] = useState<number | string>(0);
  const [nominalBayar, setNominalBayar] = useState<number | string>(0);
  const [adminName, setAdminName] = useState("-");
  const [isLoadingBarang, setIsLoadingBarang] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastInvoiceData, setLastInvoiceData] =
    useState<InvoicePenjualanData | null>(null);

  const filteredBarang = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return barangList;

    return barangList.filter(
      (item) =>
        item.nama.toLowerCase().includes(keyword) ||
        item.kode.toLowerCase().includes(keyword)
    );
  }, [barangList, search]);

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.harga * item.qty, 0);
  }, [cart]);

  const diskonNumber = numberInputToNumber(diskon);
  const total = Math.max(subtotal - diskonNumber, 0);
  const nominalBayarNumber =
    metodePembayaran === "Cash" ? numberInputToNumber(nominalBayar) : total;
  const kembalian =
    metodePembayaran === "Cash" ? Math.max(nominalBayarNumber - total, 0) : 0;

  const nomorTransaksiPreview =
    lastInvoiceData?.nomorTransaksi || "Otomatis setelah bayar";

  const tanggalPreview =
    lastInvoiceData?.tanggal || formatDateDisplay(new Date());

  const adminPreview = lastInvoiceData?.admin || adminName;

  async function fetchBarang() {
    try {
      setIsLoadingBarang(true);

      const result = await getPOSBarang({
        limit: 100,
      });

      const data = (result.data || []) as POSBarangApiItem[];

      setBarangList(data.map(mapBarangApiToBarang));
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data barang POS.",
        color: "red",
      });
    } finally {
      setIsLoadingBarang(false);
    }
  }

  async function fetchSession() {
    const result = await getCurrentSession().catch(() => null);

    if (result?.success && result.authenticated) {
      setAdminName(result.user.nama);
    }
  }

  useEffect(() => {
    fetchBarang();
    fetchSession();
  }, []);

  function clearLastInvoice() {
    if (lastInvoiceData) {
      setLastInvoiceData(null);
    }
  }

  function handleTambahBarang(barang: Barang) {
    clearLastInvoice();

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
    clearLastInvoice();

    const nextQty = typeof value === "number" ? value : Number(value || 1);

    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        if (!Number.isFinite(nextQty) || nextQty <= 0) {
          return {
            ...item,
            qty: 1,
          };
        }

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
    clearLastInvoice();
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  function handleBatal() {
    setCart([]);
    setDiskon(0);
    setNominalBayar(0);
    setMetodePembayaran("Cash");
    setLastInvoiceData(null);
  }

  function handleChangeDiskon(value: number | string) {
    clearLastInvoice();
    setDiskon(value);
  }

  function handleChangeNominalBayar(value: number | string) {
    clearLastInvoice();
    setNominalBayar(value);
  }

  function handleChangeMetodePembayaran(value: string) {
    clearLastInvoice();
    const nextMetode = value as POSMetodePembayaran;

    setMetodePembayaran(nextMetode);

    if (nextMetode !== "Cash") {
      setNominalBayar(0);
    }
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

  async function handleBayar() {
    const isValid = validateTransaksi();

    if (!isValid) {
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await simpanPOSTransaksi({
        metode_transaksi: metodePembayaran,
        diskon_transaksi: diskonNumber,
        nominal_bayar: nominalBayarNumber,
        detail_items: cart.map((item) => ({
          id_barang: item.id,
          jumlah: item.qty,
        })),
      });

      const transaksi = result.data as POSTransaksiApiItem;
      const invoiceData = mapTransaksiToInvoiceData(transaksi);

      setLastInvoiceData(invoiceData);
      setCart([]);
      setDiskon(0);
      setNominalBayar(0);
      setMetodePembayaran("Cash");

      await fetchBarang();

      notifications.show({
        title: "Berhasil",
        message:
          "Transaksi POS berhasil disimpan. Invoice sudah siap dicetak.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan transaksi POS.",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
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
                {isLoadingBarang ? (
                  <EmptyTableRow colSpan={5}>Memuat data barang...</EmptyTableRow>
                ) : filteredBarang.length === 0 ? (
                  <EmptyTableRow colSpan={5}>
                    Data barang tidak ditemukan
                  </EmptyTableRow>
                ) : (
                  filteredBarang.map((item) => (
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
                          onChange={(value) => handleChangeQty(item.id, value)}
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
                          onClick={() => handleHapusItem(item.id)}
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
              <Text fz={15}>NO. TRANSAKSI: {nomorTransaksiPreview}</Text>
              <Text fz={15}>TANGGAL: {tanggalPreview}</Text>
              <Text fz={15}>ADMIN: {adminPreview}</Text>

              {lastInvoiceData ? (
                <Badge color="green" variant="light" w="fit-content">
                  Invoice terakhir siap dicetak
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
                  onChange={handleChangeDiskon}
                  min={0}
                  max={subtotal}
                  allowDecimal={false}
                  thousandSeparator="."
                  decimalSeparator=","
                  w={160}
                  disabled={isSubmitting || cart.length === 0}
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
                onChange={handleChangeMetodePembayaran}
              >
                <Group>
                  <Radio value="Cash" label="Cash" disabled={isSubmitting} />
                  {/* <Radio
                    value="Transfer"
                    label="Transfer"
                    disabled={isSubmitting}
                  /> */}
                </Group>
              </Radio.Group>

              <Group justify="space-between" align="center">
                <Text>Nominal Bayar</Text>
                <NumberInput
                  value={
                    metodePembayaran === "Cash" ? nominalBayar : total || 0
                  }
                  onChange={handleChangeNominalBayar}
                  min={0}
                  allowDecimal={false}
                  thousandSeparator="."
                  decimalSeparator=","
                  w={170}
                  disabled={
                    isSubmitting ||
                    cart.length === 0 ||
                    metodePembayaran !== "Cash"
                  }
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
              onClick={handleBayar}
              style={{
                backgroundColor: "#0D4CB5",
              }}
            >
              Bayar
            </Button>
          </Group>

          {lastInvoiceData ? (
            <PDFDownloadLink
              document={<InvoicePenjualanPDF data={lastInvoiceData} />}
              fileName={`invoice-penjualan-${lastInvoiceData.nomorTransaksi}.pdf`}
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
                  {loading ? "Membuat Invoice..." : "Cetak Invoice Terakhir"}
                </Button>
              )}
            </PDFDownloadLink>
          ) : null}
        </Stack>
      </Box>
    </Group>
  );
}