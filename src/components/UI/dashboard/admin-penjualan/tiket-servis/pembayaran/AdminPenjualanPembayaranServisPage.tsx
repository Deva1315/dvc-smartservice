/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useParams, useRouter } from "next/navigation";
import {
  IconDeviceLaptop,
  IconTicket,
  IconUser,
} from "@tabler/icons-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import NotaPembayaranServisPDF, {
  type NotaPembayaranServisData,
} from "@/components/UI/dashboard/admin-penjualan/tiket-servis/pembayaran/NotaPembayaranServisPDF";
import {
  getPembayaranServisDetail,
  simpanPembayaranServis,
  type PembayaranServisDetailData,
} from "@/lib/admin-penjualan/admin-penjualan-tiket-servis.client";

function formatRupiah(value: number | string) {
  const numberValue = Number(value || 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numberValue) ? numberValue : 0);
}

function formatTanggal(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getPerangkatDisplay(data: PembayaranServisDetailData) {
  return data.tiket.merk_perangkat
    ? `${data.tiket.jenis_perangkat} - ${data.tiket.merk_perangkat}`
    : data.tiket.jenis_perangkat;
}

function getStatusServisLabel(status: string) {
  const labels: Record<string, string> = {
    Belum_Diproses: "Belum Diproses",
    Diproses: "Diproses",
    Menunggu_Sparepart: "Menunggu Sparepart",
    Selesai: "Selesai",
    Diambil: "Diambil",
    Dibatalkan: "Dibatalkan",
  };

  return labels[status] || status;
}

function getStatusServisColor(status: string) {
  if (status === "Selesai") return "green";
  if (status === "Diambil") return "teal";
  if (status === "Diproses") return "blue";
  if (status === "Menunggu_Sparepart") return "yellow";
  if (status === "Dibatalkan") return "red";
  return "gray";
}

export default function AdminPenjualanPembayaranServisPage() {
  const params = useParams();
  const router = useRouter();

  const nomorTiket = decodeURIComponent(String(params.nomorTiket || ""));

  const [data, setData] = useState<PembayaranServisDetailData | null>(null);
  const [metode, setMetode] = useState("Cash");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPaid = data?.pembayaran?.status_pembayaran === "Dibayar";
  const canPay =
    data?.tiket.status_verifikasi === "Diterima" &&
    data?.tiket.status_servis === "Selesai" &&
    !isPaid;

  const statusPembayaranLabel = isPaid ? "Lunas" : "Belum Lunas";
  const statusPembayaranColor = isPaid ? "green" : "orange";

  const notaData = useMemo<NotaPembayaranServisData | null>(() => {
    if (!data) return null;

    return {
      nomorTiket: data.tiket.nomor_tiket,
      tanggalBayar: formatTanggal(
        data.pembayaran?.tanggal_pembayaran || new Date().toISOString()
      ),
      namaPelanggan: data.tiket.nama_cust,
      noTelepon: data.tiket.phone_cust,
      perangkat: getPerangkatDisplay(data),
      metodePembayaran: data.pembayaran?.metode_pembayaran || metode,
      items: [
        ...data.rincian_jasa.map((item) => ({
          nama: item.nama,
          qty: null,
          harga: item.harga,
        })),
        ...data.rincian_sparepart.map((item) => ({
          nama: item.nama,
          qty: item.jumlah,
          harga: item.harga,
        })),
      ],
    };
  }, [data, metode]);

  async function fetchPembayaran() {
    try {
      setIsLoading(true);

      const result = await getPembayaranServisDetail(nomorTiket);
      const nextData = result.data as PembayaranServisDetailData;

      setData(nextData);

      if (nextData.pembayaran?.metode_pembayaran) {
        setMetode(nextData.pembayaran.metode_pembayaran);
      }
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data pembayaran servis.",
        color: "red",
      });

      setData(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchPembayaran();
  }, []);

  async function handleSimpanPembayaran() {
    if (!data) return;

    if (!canPay) {
      notifications.show({
        title: "Gagal",
        message:
          isPaid
            ? "Tiket servis ini sudah dibayar."
            : "Pembayaran hanya bisa dilakukan jika status servis sudah Selesai.",
        color: "red",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      await simpanPembayaranServis(nomorTiket, {
        metode_pembayaran: metode,
      });

      notifications.show({
        title: "Berhasil",
        message: "Pembayaran servis berhasil disimpan.",
        color: "green",
      });

      await fetchPembayaran();
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan pembayaran servis.",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <Stack gap={16}>
        <Card radius="lg" withBorder>
          <Text fw={600}>Memuat data pembayaran servis...</Text>
        </Card>
      </Stack>
    );
  }

  if (!data) {
    return (
      <Stack gap={16}>
        <Card radius="lg" withBorder>
          <Stack gap={16} align="center">
            <Text fw={700}>Data pembayaran servis tidak ditemukan.</Text>

            <Button
              variant="light"
              onClick={() => router.push("/admin_penjualan/tiket-servis")}
            >
              Kembali ke Tiket Servis
            </Button>
          </Stack>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack gap={24}>
      <Group justify="space-between" align="center">
        <Text fw={800} fz={28}>
        </Text>

        <Button
          variant="light"
          color="gray"
          radius="xl"
          onClick={() => router.push("/admin_penjualan/tiket-servis")}
        >
          Kembali
        </Button>
      </Group>

      <Group align="flex-start" gap={20}>
        <Stack style={{ flex: 2 }} gap={16}>
          <Card radius="lg" withBorder>
            <Stack gap={12}>
              <Text fw={800} fz={20}>
                Informasi Tiket
              </Text>

              <Group>
                <IconTicket size={18} />
                <Text fw={700}>{data.tiket.nomor_tiket}</Text>
              </Group>

              <Group>
                <IconUser size={18} />
                <Text>{data.tiket.nama_cust}</Text>
              </Group>

              <Group>
                <IconDeviceLaptop size={18} />
                <Text>{getPerangkatDisplay(data)}</Text>
              </Group>

              <Group gap={8}>
                <Text>Status Servis:</Text>
                <Badge
                  color={getStatusServisColor(data.tiket.status_servis)}
                  variant="light"
                  radius="xl"
                >
                  {getStatusServisLabel(data.tiket.status_servis)}
                </Badge>
              </Group>

              {data.tiket.status_servis !== "Selesai" && !isPaid ? (
                <Text c="red" fw={600}>
                  Tiket hanya dapat dibayar jika status servis sudah Selesai.
                </Text>
              ) : null}
            </Stack>
          </Card>

          <Group align="flex-start" gap={16}>
            <Card radius="lg" withBorder style={{ flex: 1 }}>
              <Stack gap={12}>
                <Text fw={800} fz={18}>
                  Rincian Jasa
                </Text>

                <Divider />

                {data.rincian_jasa.length > 0 ? (
                  data.rincian_jasa.map((item) => (
                    <Group key={item.id} justify="space-between">
                      <Text>{item.nama}</Text>
                      <Text>{formatRupiah(item.subtotal)}</Text>
                    </Group>
                  ))
                ) : (
                  <Text c="dimmed">Belum ada jasa servis.</Text>
                )}

                <Divider />

                <Group justify="space-between">
                  <Text fw={700}>Subtotal</Text>
                  <Text fw={700}>{formatRupiah(data.subtotal_jasa)}</Text>
                </Group>
              </Stack>
            </Card>

            <Card radius="lg" withBorder style={{ flex: 1 }}>
              <Stack gap={12}>
                <Text fw={800} fz={18}>
                  Rincian Sparepart
                </Text>

                <Divider />

                {data.rincian_sparepart.length > 0 ? (
                  data.rincian_sparepart.map((item) => (
                    <Group key={item.id} justify="space-between">
                      <Text>
                        {item.nama} x{item.jumlah}
                      </Text>
                      <Text>{formatRupiah(item.subtotal)}</Text>
                    </Group>
                  ))
                ) : (
                  <Text c="dimmed">Belum ada sparepart.</Text>
                )}

                <Divider />

                <Group justify="space-between">
                  <Text fw={700}>Subtotal</Text>
                  <Text fw={700}>{formatRupiah(data.subtotal_sparepart)}</Text>
                </Group>
              </Stack>
            </Card>
          </Group>
        </Stack>

        <Stack style={{ flex: 1 }} gap={16}>
          <Card radius="lg" withBorder>
            <Stack gap={12}>
              <Text fw={800} fz={20}>
                Ringkasan Pembayaran
              </Text>

              <Group justify="space-between">
                <Text>Subtotal Jasa</Text>
                <Text>{formatRupiah(data.subtotal_jasa)}</Text>
              </Group>

              <Group justify="space-between">
                <Text>Subtotal Sparepart</Text>
                <Text>{formatRupiah(data.subtotal_sparepart)}</Text>
              </Group>

              <Divider />

              <Group justify="space-between">
                <Text fw={800}>Total</Text>
                <Text fw={800}>{formatRupiah(data.total_pembayaran)}</Text>
              </Group>
            </Stack>
          </Card>

          <Card radius="lg" withBorder>
            <Stack gap={14}>
              <Text fw={800} fz={20}>
                Pembayaran
              </Text>

              <Select
                label="Metode Pembayaran"
                data={[
                  { value: "Cash", label: "Cash" },
                  { value: "Transfer", label: "Transfer" },
                  { value: "QRIS", label: "QRIS" },
                  { value: "Debit", label: "Debit" },
                ]}
                value={metode}
                onChange={(val) => setMetode(val || "Cash")}
                disabled={isPaid || isSubmitting}
              />

              <TextInput
                label="Nominal Bayar"
                value={formatRupiah(data.total_pembayaran)}
                readOnly
              />

              <Group justify="space-between">
                <Text>Status Pembayaran</Text>
                <Badge color={statusPembayaranColor} variant="light" radius="xl">
                  {statusPembayaranLabel}
                </Badge>
              </Group>

              {data.pembayaran ? (
                <Stack gap={4}>
                  <Text fz={14} c="dimmed">
                    Tanggal Bayar:{" "}
                    {formatTanggal(data.pembayaran.tanggal_pembayaran)}
                  </Text>
                  <Text fz={14} c="dimmed">
                    Kasir: {data.pembayaran.users?.nama || "-"}
                  </Text>
                </Stack>
              ) : null}

              <Button
                fullWidth
                mt="md"
                loading={isSubmitting}
                disabled={!canPay || isSubmitting}
                onClick={handleSimpanPembayaran}
              >
                {isPaid ? "Sudah Dibayar" : "Simpan Pembayaran"}
              </Button>

              {notaData && isPaid ? (
                <PDFDownloadLink
                  document={<NotaPembayaranServisPDF data={notaData} />}
                  fileName={`nota-servis-${notaData.nomorTiket}.pdf`}
                  style={{
                    textDecoration: "none",
                  }}
                >
                  {({ loading }) => (
                    <Button variant="outline" fullWidth disabled={loading}>
                      {loading ? "Membuat Nota..." : "Cetak Nota"}
                    </Button>
                  )}
                </PDFDownloadLink>
              ) : (
                <Button variant="outline" fullWidth disabled>
                  Cetak Nota
                </Button>
              )}
            </Stack>
          </Card>
        </Stack>
      </Group>
    </Stack>
  );
}