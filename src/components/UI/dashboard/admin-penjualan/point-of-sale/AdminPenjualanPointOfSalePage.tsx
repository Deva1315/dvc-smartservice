/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Group, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import PosProductTable from "@/components/UI/dashboard/admin-penjualan/point-of-sale/components/PosProductTable";
import PosCartTable from "@/components/UI/dashboard/admin-penjualan/point-of-sale/components/PosCartTable";
import PosCheckoutPanel from "@/components/UI/dashboard/admin-penjualan/point-of-sale/components/PosCheckoutPanel";
import type { InvoicePenjualanData } from "@/components/UI/dashboard/admin-penjualan/point-of-sale/InvoicePenjualanPDF";
import { getCurrentSession } from "@/lib/auth/auth.client";
import {
  batalPOSTransaksi,
  bayarPOSTransaksi,
  buatDraftPOSTransaksi,
  getPOSBarang,
  type POSBarangApiItem,
  type POSMetodePembayaran,
  type POSTransaksiApiItem,
} from "@/lib/admin-penjualan/admin-penjualan-point-of-sale.client";
import { posCheckoutFormSchema, validateWithZod } from "@/lib/validations";

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

type ActiveTransaksi = {
  id: string;
  nomor_transaksi: string;
  tanggal_transaksi: string;
};

const DEFAULT_NAMA_CUSTOMER = "Pelanggan Umum";

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

function mapTransaksiToActiveTransaksi(
  transaksi: POSTransaksiApiItem
): ActiveTransaksi {
  return {
    id: String(transaksi.id),
    nomor_transaksi: transaksi.nomor_transaksi,
    tanggal_transaksi: String(transaksi.tanggal_transaksi),
  };
}

function mapTransaksiToInvoiceData(
  transaksi: POSTransaksiApiItem
): InvoicePenjualanData {
  return {
    nomorTransaksi: transaksi.nomor_transaksi,
    tanggal: formatDateDisplay(transaksi.tanggal_transaksi),
    tanggalRaw: String(transaksi.tanggal_transaksi),
    namaCustomer: transaksi.nama_cust || "Pelanggan Umum",
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

export default function AdminPenjualanPointOfSalePage() {
  const [search, setSearch] = useState("");
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [metodePembayaran, setMetodePembayaran] =
    useState<POSMetodePembayaran>("Cash");
  const [diskon, setDiskon] = useState<number | string>(0);
  const [nominalBayar, setNominalBayar] = useState<number | string>(0);
  const [adminName, setAdminName] = useState("-");
  const [namaCustomer, setNamaCustomer] = useState(DEFAULT_NAMA_CUSTOMER);
  const [isLoadingBarang, setIsLoadingBarang] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreparingTransaksi, setIsPreparingTransaksi] = useState(false);
  const [activeTransaksi, setActiveTransaksi] =
    useState<ActiveTransaksi | null>(null);
  const [lastInvoiceData, setLastInvoiceData] =
    useState<InvoicePenjualanData | null>(null);
  const [checkoutErrors, setCheckoutErrors] = useState<Record<string, string>>(
    {}
  );

  const hasPreparedInitialTransaksiRef = useRef(false);
  const draftRequestRef = useRef<Promise<ActiveTransaksi> | null>(null);

  const isTransactionBusy = isSubmitting || isPreparingTransaksi;

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
    lastInvoiceData?.nomorTransaksi ||
    activeTransaksi?.nomor_transaksi ||
    "Menyiapkan nomor INV...";

  const tanggalPreview =
    lastInvoiceData?.tanggal ||
    formatDateDisplay(activeTransaksi?.tanggal_transaksi || new Date());

  const adminPreview = lastInvoiceData?.admin || adminName;

  function clearCheckoutFieldError(field: string) {
    setCheckoutErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  }

  async function createDraftTransaksi() {
    if (draftRequestRef.current) {
      return draftRequestRef.current;
    }

    const draftPromise = buatDraftPOSTransaksi()
      .then((result) => {
        const transaksi = result.data as POSTransaksiApiItem;
        const nextActiveTransaksi = mapTransaksiToActiveTransaksi(transaksi);

        setActiveTransaksi(nextActiveTransaksi);

        return nextActiveTransaksi;
      })
      .finally(() => {
        draftRequestRef.current = null;
      });

    draftRequestRef.current = draftPromise;

    return draftPromise;
  }

  async function prepareInitialTransaksi(force = false) {
    if (!force && hasPreparedInitialTransaksiRef.current) {
      return;
    }

    try {
      hasPreparedInitialTransaksiRef.current = true;
      setIsPreparingTransaksi(true);

      await createDraftTransaksi();
    } catch (error) {
      hasPreparedInitialTransaksiRef.current = false;

      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal membuat nomor transaksi POS.",
        color: "red",
      });
    } finally {
      setIsPreparingTransaksi(false);
    }
  }

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
    prepareInitialTransaksi();
  }, []);

  function clearLastInvoice() {
    if (lastInvoiceData) {
      setLastInvoiceData(null);
    }
  }

  async function ensureDraftTransaksi() {
    if (activeTransaksi && !lastInvoiceData) {
      return activeTransaksi;
    }

    try {
      setIsPreparingTransaksi(true);
      hasPreparedInitialTransaksiRef.current = true;

      return await createDraftTransaksi();
    } finally {
      setIsPreparingTransaksi(false);
    }
  }

  async function handleTambahBarang(barang: Barang) {
    clearLastInvoice();
    clearCheckoutFieldError("cartLength");

    if (barang.stok <= 0) {
      notifications.show({
        title: "Stok habis",
        message: "Barang ini tidak memiliki stok.",
        color: "red",
      });
      return;
    }

    try {
      await ensureDraftTransaksi();

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
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal membuat nomor transaksi POS.",
        color: "red",
      });
    }
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

    setCart((prev) => {
      const nextCart = prev.filter((item) => item.id !== id);

      if (nextCart.length > 0) {
        clearCheckoutFieldError("cartLength");
      }

      return nextCart;
    });
  }

  async function handleBatal() {
    const draftTransaksiId = activeTransaksi?.id;
    const isAfterPayment = Boolean(lastInvoiceData);
    const shouldDeleteDraft = Boolean(draftTransaksiId && !isAfterPayment);

    try {
      setIsSubmitting(true);

      if (shouldDeleteDraft && draftTransaksiId) {
        await batalPOSTransaksi(draftTransaksiId);
      }

      setCart([]);
      setDiskon(0);
      setNominalBayar(0);
      setMetodePembayaran("Cash");
      setNamaCustomer(DEFAULT_NAMA_CUSTOMER);
      setActiveTransaksi(null);
      setLastInvoiceData(null);
      setCheckoutErrors({});

      hasPreparedInitialTransaksiRef.current = false;
      await prepareInitialTransaksi(true);

      notifications.show({
        title: isAfterPayment ? "Transaksi baru" : "Transaksi dibatalkan",
        message: isAfterPayment
          ? "Nomor transaksi baru berhasil dibuat."
          : "Draft transaksi dihapus dan nomor transaksi baru berhasil dibuat.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal membatalkan transaksi POS.",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChangeDiskon(value: number | string) {
    clearLastInvoice();
    setDiskon(value);
    clearCheckoutFieldError("diskon");
  }

  function handleChangeNominalBayar(value: number | string) {
    clearLastInvoice();
    setNominalBayar(value);
    clearCheckoutFieldError("nominalBayar");
  }

  function handleChangeMetodePembayaran(value: string) {
    clearLastInvoice();

    const nextMetode = value as POSMetodePembayaran;
    setMetodePembayaran(nextMetode);

    clearCheckoutFieldError("metodePembayaran");
    clearCheckoutFieldError("nominalBayar");

    if (nextMetode !== "Cash") {
      setNominalBayar(0);
    }
  }

  function handleChangeNamaCustomer(value: string) {
    clearLastInvoice();
    setNamaCustomer(value);
    clearCheckoutFieldError("namaCustomer");
  }

  function validateTransaksi() {
    const parsed = validateWithZod(posCheckoutFormSchema, {
      namaCustomer,
      metodePembayaran,
      diskon: diskonNumber,
      nominalBayar: nominalBayarNumber,
      total,
      cartLength: cart.length,
    });

    if (!parsed.success) {
      setCheckoutErrors(parsed.errors);

      notifications.show({
        title: "Validasi gagal",
        message: parsed.message,
        color: "red",
      });

      return false;
    }

    if (diskonNumber > subtotal) {
      setCheckoutErrors((prev) => ({
        ...prev,
        diskon: "Diskon tidak boleh melebihi subtotal.",
      }));

      notifications.show({
        title: "Validasi gagal",
        message: "Diskon tidak boleh melebihi subtotal.",
        color: "red",
      });

      return false;
    }

    setCheckoutErrors({});
    return true;
  }

  async function handleBayar() {
    const isValid = validateTransaksi();

    if (!isValid) {
      return;
    }

    try {
      setIsSubmitting(true);

      const draftTransaksi = activeTransaksi || (await ensureDraftTransaksi());

      const result = await bayarPOSTransaksi(draftTransaksi.id, {
        nama_cust: namaCustomer.trim() || DEFAULT_NAMA_CUSTOMER,
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
      setActiveTransaksi(null);
      setCart([]);
      setDiskon(0);
      setNominalBayar(0);
      setMetodePembayaran("Cash");
      setNamaCustomer(transaksi.nama_cust || DEFAULT_NAMA_CUSTOMER);
      setCheckoutErrors({});
      hasPreparedInitialTransaksiRef.current = false;

      await fetchBarang();

      notifications.show({
        title: "Berhasil",
        message: "Transaksi POS berhasil dibayar. Invoice sudah siap dicetak.",
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
          <PosProductTable
            search={search}
            onSearchChange={setSearch}
            data={filteredBarang}
            isLoading={isLoadingBarang}
            isSubmitting={isTransactionBusy}
            formatRupiah={formatRupiah}
            onTambahBarang={handleTambahBarang}
          />

          <PosCartTable
            cart={cart}
            isSubmitting={isTransactionBusy}
            formatRupiah={formatRupiah}
            onChangeQty={handleChangeQty}
            onHapusItem={handleHapusItem}
          />
        </Stack>
      </Box>

      <PosCheckoutPanel
        cart={cart}
        nomorTransaksiPreview={nomorTransaksiPreview}
        tanggalPreview={tanggalPreview}
        adminPreview={adminPreview}
        namaCustomer={namaCustomer}
        lastInvoiceData={lastInvoiceData}
        subtotal={subtotal}
        diskon={diskon}
        total={total}
        metodePembayaran={metodePembayaran}
        nominalBayar={nominalBayar}
        kembalian={kembalian}
        isSubmitting={isTransactionBusy}
        errors={checkoutErrors}
        formatRupiah={formatRupiah}
        formatRupiahPrefix={formatRupiahPrefix}
        onChangeNamaCustomer={handleChangeNamaCustomer}
        onChangeDiskon={handleChangeDiskon}
        onChangeMetodePembayaran={handleChangeMetodePembayaran}
        onChangeNominalBayar={handleChangeNominalBayar}
        onBatal={handleBatal}
        onBayar={handleBayar}
      />
    </Group>
  );
}