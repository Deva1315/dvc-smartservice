/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { useParams, useRouter } from "next/navigation";
import {
  IconCalendarMonth,
  IconDeviceLaptop,
  IconMapPin,
  IconPhone,
  IconUser,
} from "@tabler/icons-react";
import DiagnosaLanjutanModal from "@/components/UI/dashboard/teknisi/antrian-tiket-servis/modal/DiagnosaLanjutanModal";
import {
  CardBox,
  CardSectionTitle,
  InfoRow,
  SimpleInfoRow,
} from "@/components/UI/dashboard/teknisi/antrian-tiket-servis/detail-tiket-servis/components/TicketDetailShared";
import TicketDiagnosaCard from "@/components/UI/dashboard/teknisi/antrian-tiket-servis/detail-tiket-servis/components/TicketDiagnosaCard";
import TicketSparepartSection from "@/components/UI/dashboard/teknisi/antrian-tiket-servis/detail-tiket-servis/components/TicketSparepartSection";
import TicketCostSummary from "@/components/UI/dashboard/teknisi/antrian-tiket-servis/detail-tiket-servis/components/TicketCostSummary";
import TicketJasaSection from "@/components/UI/dashboard/teknisi/antrian-tiket-servis/detail-tiket-servis/components/TicketJasaSection";
import { getCurrentSession } from "@/lib/auth/auth.client";
import {
  getJasaServis,
  type JasaServisApiItem,
} from "@/lib/admin-penjualan/admin-penjualan-jasa-servis.client";
import {
  getSparepart,
  type SparepartApiItem,
} from "@/lib/admin-gudang/admin-gudang-sparepart.client";
import {
  createDiagnosaLanjutan,
  getDetailTiketServis,
  hapusJasaDariTiket,
  hapusSparepartDariTiket,
  tambahJasaKeTiket,
  tambahSparepartKeTiket,
  updateStatusTiketServis,
  type DetailTiketServisApiItem,
  type StatusServis,
  type StatusVerifikasi,
} from "@/lib/teknisi/teknisi-tiket-servis.client";

type MasterOption = {
  value: string;
  label: string;
  harga: number;
  stock?: number;
};

type LoadingAction =
  | "fetch"
  | "status"
  | "diagnosa"
  | "tambah-jasa"
  | "hapus-jasa"
  | "tambah-sparepart"
  | "hapus-sparepart"
  | null;

const statusServisOptions: {
  value: StatusServis;
  label: string;
}[] = [
  { value: "Belum_Diproses", label: "Belum Diproses" },
  { value: "Diproses", label: "Diproses" },
  { value: "Menunggu_Sparepart", label: "Menunggu Sparepart" },
  { value: "Selesai", label: "Selesai" },
  { value: "Dibatalkan", label: "Dibatalkan" },
];

const allowedNextStatus: Record<StatusServis, StatusServis[]> = {
  Belum_Diproses: ["Diproses", "Dibatalkan"],
  Diproses: ["Menunggu_Sparepart", "Selesai", "Dibatalkan"],
  Menunggu_Sparepart: ["Diproses", "Selesai", "Dibatalkan"],
  Selesai: [],
  Diambil: [],
  Dibatalkan: [],
};

function toNumber(value: string | number | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDisplayDate(dateString: string | null | undefined) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function toDateValue(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string") {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }

  return null;
}

function toIsoDateTime(value: Date | null) {
  if (!value) return null;

  if (Number.isNaN(value.getTime())) {
    return null;
  }

  return value.toISOString();
}

function isSameDateTime(
  nextValue: Date | null,
  currentValue: string | null | undefined
) {
  const currentDate = toDateValue(currentValue);

  if (!nextValue && !currentDate) return true;
  if (!nextValue || !currentDate) return false;

  return nextValue.getTime() === currentDate.getTime();
}

function formatDisplayDateTime(dateString: string | null | undefined) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusServisLabel(status: StatusServis) {
  switch (status) {
    case "Belum_Diproses":
      return "Belum Diproses";
    case "Diproses":
      return "Diproses";
    case "Menunggu_Sparepart":
      return "Menunggu Sparepart";
    case "Selesai":
      return "Selesai";
    case "Diambil":
      return "Diambil";
    case "Dibatalkan":
      return "Dibatalkan";
    default:
      return status;
  }
}

function getStatusServisColor(status: StatusServis) {
  switch (status) {
    case "Belum_Diproses":
      return "gray";
    case "Diproses":
      return "blue";
    case "Menunggu_Sparepart":
      return "yellow";
    case "Selesai":
      return "green";
    case "Diambil":
      return "teal";
    case "Dibatalkan":
      return "red";
    default:
      return "gray";
  }
}

function getStatusVerifikasiLabel(status: StatusVerifikasi) {
  switch (status) {
    case "Menunggu":
      return "Menunggu";
    case "Diterima":
      return "Diterima";
    case "Ditolak":
      return "Ditolak";
    default:
      return status;
  }
}

function getStatusVerifikasiColor(status: StatusVerifikasi) {
  switch (status) {
    case "Menunggu":
      return "orange";
    case "Diterima":
      return "green";
    case "Ditolak":
      return "red";
    default:
      return "gray";
  }
}

function getPerangkatDisplay(
  detail: Pick<DetailTiketServisApiItem, "jenis_perangkat" | "merk_perangkat">
) {
  if (!detail.merk_perangkat) {
    return detail.jenis_perangkat;
  }

  return `${detail.jenis_perangkat} - ${detail.merk_perangkat}`;
}

function getDropPointDisplay(detail: DetailTiketServisApiItem) {
  if (!detail.drop_point) {
    return "Tidak melalui drop point";
  }

  if (detail.id_drop_point) {
    return `${detail.id_drop_point} - ${detail.drop_point.nama_drop_point}`;
  }

  return detail.drop_point.nama_drop_point;
}

function getReferensiSolusiAwal(detail: DetailTiketServisApiItem) {
  const diagnosaAi = detail.diagnosa_ai;

  if (!diagnosaAi) {
    return "-";
  }

  const items = [
    diagnosaAi.kemungkinan_penyebab
      ? `Kemungkinan penyebab: ${diagnosaAi.kemungkinan_penyebab}`
      : "",
    diagnosaAi.kemungkinan_solusi
      ? `Solusi awal: ${diagnosaAi.kemungkinan_solusi}`
      : "",
    diagnosaAi.saran_tindakan
      ? `Saran tindakan: ${diagnosaAi.saran_tindakan}`
      : "",
  ].filter(Boolean);

  if (items.length > 0) {
    return items.join("\n");
  }

  return diagnosaAi.gejala || "-";
}

function mapJasaMasterOptions(data: JasaServisApiItem[]): MasterOption[] {
  return data.map((item) => ({
    value: item.id,
    label: item.nama_jasa_servis,
    harga: toNumber(item.harga),
  }));
}

function mapSparepartMasterOptions(data: SparepartApiItem[]): MasterOption[] {
  return data.map((item) => ({
    value: item.id,
    label: item.nama_sparepart,
    harga: toNumber(item.harga),
    stock: toNumber(item.stock),
  }));
}

export default function DetailTiketServisPage() {
  const params = useParams();
  const router = useRouter();

  const nomorTiketParam =
    typeof params?.id === "string" ? decodeURIComponent(params.id) : "";

  const [estimasiWaktu, setEstimasiWaktu] = useState<Date | null>(null);
  const [detail, setDetail] = useState<DetailTiketServisApiItem | null>(null);
  const [statusServis, setStatusServis] = useState<StatusServis | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [jasaMasterOptions, setJasaMasterOptions] = useState<MasterOption[]>([]);
  const [sparepartMasterOptions, setSparepartMasterOptions] = useState<
    MasterOption[]
  >([]);
  const [openedDiagnosaModal, setOpenedDiagnosaModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);

  async function fetchDetail() {
    const result = await getDetailTiketServis(nomorTiketParam);
    const nextDetail = result.data as DetailTiketServisApiItem;

    setDetail(nextDetail);
    setStatusServis(nextDetail.status_servis);
    setEstimasiWaktu(toDateValue(nextDetail.estimasi_waktu));

    return nextDetail;
  }

  async function fetchInitialData() {
    if (!nomorTiketParam) return;

    try {
      setIsLoading(true);
      setLoadingAction("fetch");

      const [detailResult, jasaResult, sparepartResult, sessionResult] =
        await Promise.all([
          getDetailTiketServis(nomorTiketParam),
          getJasaServis(),
          getSparepart(),
          getCurrentSession().catch(() => null),
        ]);

      const nextDetail = detailResult.data as DetailTiketServisApiItem;

      setDetail(nextDetail);
      setStatusServis(nextDetail.status_servis);
      setEstimasiWaktu(toDateValue(nextDetail.estimasi_waktu));
      setJasaMasterOptions(mapJasaMasterOptions(jasaResult.data || []));
      setSparepartMasterOptions(
        mapSparepartMasterOptions(sparepartResult.data || [])
      );

      if (sessionResult?.success && sessionResult.authenticated) {
        setCurrentUserId(sessionResult.user.id);
      }
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal memuat detail tiket servis.",
        color: "red",
      });

      setDetail(null);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  }

  useEffect(() => {
    fetchInitialData();
  }, [nomorTiketParam]);

  const jasaServis = useMemo(() => {
    return (
      detail?.detail_tiket_servis.filter((item) => item.id_jasa_servis) || []
    );
  }, [detail]);

  const sparepartDigunakan = useMemo(() => {
    return (
      detail?.detail_tiket_servis.filter((item) => item.id_sparepart) || []
    );
  }, [detail]);

  const totalJasa = useMemo(() => {
    return jasaServis.reduce((total, item) => {
      const subtotal = toNumber(item.subtotal);

      if (subtotal > 0) {
        return total + subtotal;
      }

      return total + toNumber(item.jumlah) * toNumber(item.harga);
    }, 0);
  }, [jasaServis]);

  const totalSparepart = useMemo(() => {
    return sparepartDigunakan.reduce((total, item) => {
      const subtotal = toNumber(item.subtotal);

      if (subtotal > 0) {
        return total + subtotal;
      }

      return total + toNumber(item.jumlah) * toNumber(item.harga);
    }, 0);
  }, [sparepartDigunakan]);

  const totalEstimasi = useMemo(() => {
    if (!detail) return 0;

    if (detail.estimasi_biaya !== null && detail.estimasi_biaya !== undefined) {
      return toNumber(detail.estimasi_biaya);
    }

    return totalJasa + totalSparepart;
  }, [detail, totalJasa, totalSparepart]);

  const latestDiagnosa = detail?.diagnosa_lanjutan?.[0] || null;
  const dropPointDisplay = detail ? getDropPointDisplay(detail) : "-";
  const perangkatDisplay = detail ? getPerangkatDisplay(detail) : "-";

  const isStatusEditable =
    detail?.status_verifikasi === "Diterima" &&
    detail.status_servis !== "Selesai" &&
    detail.status_servis !== "Diambil" &&
    detail.status_servis !== "Dibatalkan";

  const canModifyDetail =
    detail?.status_verifikasi === "Diterima" &&
    (detail.status_servis === "Diproses" ||
      detail.status_servis === "Menunggu_Sparepart");

  const currentAllowedStatusOptions = useMemo(() => {
    if (!detail) return statusServisOptions;

    const nextStatuses = allowedNextStatus[detail.status_servis] || [];

    return statusServisOptions.filter(
      (item) =>
        item.value === detail.status_servis || nextStatuses.includes(item.value)
    );
  }, [detail]);

  async function handleUpdateStatus() {
    if (!detail || !statusServis) return;

    if (!isStatusEditable) {
      notifications.show({
        title: "Gagal",
        message: "Status servis hanya bisa diubah jika tiket masih aktif.",
        color: "red",
      });
      return;
    }

    const isStatusChanged = statusServis !== detail.status_servis;
    const isEstimasiChanged = !isSameDateTime(
      estimasiWaktu,
      detail.estimasi_waktu
    );

    if (!isStatusChanged && !isEstimasiChanged) {
      notifications.show({
        title: "Gagal",
        message: "Tidak ada perubahan status atau estimasi waktu.",
        color: "red",
      });
      return;
    }

    const estimasiWaktuIso = toIsoDateTime(estimasiWaktu);

    if (estimasiWaktu && !estimasiWaktuIso) {
      notifications.show({
        title: "Gagal",
        message: "Estimasi waktu harus berupa tanggal dan jam yang valid.",
        color: "red",
      });
      return;
    }

    try {
      setLoadingAction("status");

      await updateStatusTiketServis(nomorTiketParam, {
        status_servis: statusServis,
        estimasi_waktu: statusServis === "Dibatalkan" ? null : estimasiWaktuIso,
      });

      await fetchDetail();

      notifications.show({
        title: "Berhasil",
        message:
          statusServis === "Dibatalkan"
            ? "Tiket berhasil dibatalkan dan stok sparepart dikembalikan."
            : "Status dan estimasi waktu servis berhasil diperbarui.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal memperbarui status dan estimasi waktu tiket servis.",
        color: "red",
      });
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleSaveDiagnosa(payload: {
    diagnosaLanjutan: string;
    catatanTeknisi: string;
  }) {
    if (!currentUserId) {
      notifications.show({
        title: "Gagal",
        message: "Session teknisi tidak ditemukan. Silakan login ulang.",
        color: "red",
      });
      return false;
    }

    try {
      setLoadingAction("diagnosa");

      await createDiagnosaLanjutan(nomorTiketParam, {
        id_user: currentUserId,
        hasil_diagnosa: payload.diagnosaLanjutan,
        catatan_teknisi: payload.catatanTeknisi || null,
      });

      await fetchDetail();

      notifications.show({
        title: "Berhasil",
        message: "Diagnosa lanjutan teknisi berhasil disimpan.",
        color: "green",
      });

      return true;
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan diagnosa lanjutan.",
        color: "red",
      });

      return false;
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleTambahJasa(itemId: string) {
    if (!canModifyDetail) {
      notifications.show({
        title: "Gagal",
        message:
          "Jasa hanya bisa ditambahkan saat status servis Diproses atau Menunggu Sparepart.",
        color: "red",
      });
      return;
    }

    try {
      setLoadingAction("tambah-jasa");

      await tambahJasaKeTiket(nomorTiketParam, {
        id_jasa_servis: itemId,
        jumlah: 1,
      });

      await fetchDetail();

      notifications.show({
        title: "Berhasil",
        message: "Jasa servis berhasil ditambahkan.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menambahkan jasa servis.",
        color: "red",
      });
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleTambahSparepart(itemId: string) {
    if (!canModifyDetail) {
      notifications.show({
        title: "Gagal",
        message:
          "Sparepart hanya bisa ditambahkan saat status servis Diproses atau Menunggu Sparepart.",
        color: "red",
      });
      return;
    }

    try {
      setLoadingAction("tambah-sparepart");

      await tambahSparepartKeTiket(nomorTiketParam, {
        id_sparepart: itemId,
        jumlah: 1,
      });

      await fetchDetail();

      notifications.show({
        title: "Berhasil",
        message: "Sparepart berhasil ditambahkan ke tiket.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menambahkan sparepart ke tiket.",
        color: "red",
      });
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleHapusJasa(detailId: string) {
    try {
      setLoadingAction("hapus-jasa");

      await hapusJasaDariTiket(nomorTiketParam, detailId);
      await fetchDetail();

      notifications.show({
        title: "Berhasil",
        message: "Jasa servis berhasil dihapus dari tiket.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menghapus jasa servis.",
        color: "red",
      });
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleHapusSparepart(detailId: string) {
    try {
      setLoadingAction("hapus-sparepart");

      await hapusSparepartDariTiket(nomorTiketParam, detailId);
      await fetchDetail();

      notifications.show({
        title: "Berhasil",
        message: "Sparepart berhasil dihapus dan stok dikembalikan.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menghapus sparepart.",
        color: "red",
      });
    } finally {
      setLoadingAction(null);
    }
  }

  if (isLoading) {
    return (
      <Stack gap={18}>
        <Title order={1} fw={800}>
          Detail Tiket Servis
        </Title>

        <Paper
          radius="xl"
          p="xl"
          style={{
            border: "1px solid #ECECF3",
            backgroundColor: "#FFFFFF",
          }}
        >
          <Text fw={700} fz={18}>
            Memuat detail tiket servis...
          </Text>
        </Paper>
      </Stack>
    );
  }

  if (!detail) {
    return (
      <Stack gap={18}>
        <Title order={1} fw={800}>
          Detail Tiket Servis
        </Title>

        <Paper
          radius="xl"
          p="xl"
          style={{
            border: "1px solid #ECECF3",
            backgroundColor: "#FFFFFF",
          }}
        >
          <Stack gap={12} align="center">
            <Text fw={700} fz={20}>
              Tiket servis tidak ditemukan
            </Text>
            <Button
              radius="xl"
              onClick={() => router.push("/teknisi/antrian-tiket-servis")}
              style={{
                backgroundColor: "#0D4CB5",
              }}
            >
              Kembali ke Antrian
            </Button>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  return (
    <>
      <Stack gap={18}>
        <Group justify="space-between" align="center">
          <Title order={1} fw={800} c="#000000">
            Detail Tiket Servis
          </Title>

          <Button
            variant="light"
            color="gray"
            radius="xl"
            onClick={() => router.push("/teknisi/antrian-tiket-servis")}
          >
            Kembali
          </Button>
        </Group>

        <Box
          p="md"
          style={{
            backgroundColor: "#F2F2F6",
            borderRadius: 16,
            border: "1px solid #E8E8EF",
          }}
        >
          <Grid gap="md">
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <CardBox>
                <Stack gap={14}>
                  <CardSectionTitle>Informasi Pelanggan</CardSectionTitle>
                  <Divider color="#ECECF3" />

                  <InfoRow icon={<IconUser size={22} />} text={detail.nama_cust} />
                  <InfoRow
                    icon={<IconPhone size={22} />}
                    text={detail.phone_cust}
                  />
                  <InfoRow
                    icon={<IconMapPin size={22} />}
                    text={detail.alamat_cust || "-"}
                  />
                </Stack>
              </CardBox>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 4 }}>
              <CardBox>
                <Stack gap={14}>
                  <CardSectionTitle>Informasi Perangkat</CardSectionTitle>
                  <Divider color="#ECECF3" />

                  <InfoRow
                    icon={<IconDeviceLaptop size={22} />}
                    text={perangkatDisplay}
                  />

                  <SimpleInfoRow
                    label="Jenis Perangkat"
                    value={detail.jenis_perangkat}
                  />
                  <SimpleInfoRow
                    label="Merk Perangkat"
                    value={detail.merk_perangkat}
                  />
                  <SimpleInfoRow
                    label="Sumber Tiket"
                    value={detail.sumber_tiket}
                  />
                  <SimpleInfoRow label="Drop Point" value={dropPointDisplay} />
                </Stack>
              </CardBox>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 4 }}>
              <CardBox bg="#F7F3EB">
                <Stack gap={16}>
                  <CardSectionTitle>Tindakan Teknisi</CardSectionTitle>

                  <Select
                    value={statusServis}
                    onChange={(value) =>
                      setStatusServis((value as StatusServis) || null)
                    }
                    data={currentAllowedStatusOptions}
                    disabled={!isStatusEditable || loadingAction !== null}
                    styles={{
                      input: {
                        height: 44,
                        borderRadius: 12,
                      },
                    }}
                  />

                  <DateTimePicker
                    value={estimasiWaktu}
                    onChange={(value) => setEstimasiWaktu(toDateValue(value))}
                    placeholder="Pilih estimasi selesai"
                    valueFormat="DD/MM/YYYY HH:mm"
                    clearable
                    leftSection={<IconCalendarMonth size={18} />}
                    disabled={!isStatusEditable || loadingAction !== null}
                    timePickerProps={{
                      withDropdown: true,
                      format: "24h",
                      popoverProps: {
                        withinPortal: false,
                      },
                    }}
                    styles={{
                      input: {
                        height: 44,
                        borderRadius: 12,
                      },
                    }}
                  />

                  <Badge
                    color={getStatusVerifikasiColor(detail.status_verifikasi)}
                    variant="light"
                    radius="xl"
                    size="lg"
                    w="fit-content"
                  >
                    Verifikasi:{" "}
                    {getStatusVerifikasiLabel(detail.status_verifikasi)}
                  </Badge>

                  <Divider color="#E8DCC5" />

                  <Button
                    radius="md"
                    onClick={handleUpdateStatus}
                    disabled={
                      !isStatusEditable || !statusServis || loadingAction !== null
                    }
                    loading={loadingAction === "status"}
                    style={{
                      backgroundColor: "#FFFFFF",
                      color: "#224B8F",
                      border: "1px solid #DFDFE8",
                      height: 44,
                    }}
                  >
                    Simpan Perubahan
                  </Button>
                </Stack>
              </CardBox>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 8 }}>
              <CardBox>
                <Stack gap={12}>
                  <CardSectionTitle>Keluhan Pelanggan</CardSectionTitle>
                  <Divider color="#ECECF3" />
                  <Text fz={17} c="#4B5563">
                    • {detail.keluhan}
                  </Text>
                </Stack>
              </CardBox>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 4 }}>
              <CardBox>
                <Stack gap={12}>
                  <CardSectionTitle>Riwayat Status</CardSectionTitle>
                  <Divider color="#ECECF3" />

                  <Group justify="space-between" align="center">
                    <Group gap={10} wrap="nowrap">
                      <Text c="#9CA3AF" fz={22}>
                        •
                      </Text>
                      <Text fz={16} c="#4B5563">
                        Tiket Dibuat
                      </Text>
                    </Group>

                    <Text fz={14} c="#6B7280">
                      {formatDisplayDate(detail.tanggal_masuk)}
                    </Text>
                  </Group>

                  <Group justify="space-between" align="center">
                    <Group gap={10} wrap="nowrap">
                      <Text c="#9CA3AF" fz={22}>
                        •
                      </Text>
                      <Text fz={16} c="#4B5563">
                        Verifikasi {detail.status_verifikasi}
                      </Text>
                    </Group>

                    <Text fz={14} c="#6B7280">
                      {formatDisplayDate(detail.tanggal_verifikasi)}
                    </Text>
                  </Group>

                  <Group justify="space-between" align="center">
                    <Group gap={10} wrap="nowrap">
                      <Text c="#9CA3AF" fz={22}>
                        •
                      </Text>

                      <Badge
                        color={getStatusServisColor(detail.status_servis)}
                        variant="light"
                        radius="xl"
                        size="lg"
                      >
                        {getStatusServisLabel(detail.status_servis)}
                      </Badge>
                    </Group>

                    <Text fz={14} c="#6B7280">
                      {formatDisplayDate(detail.tanggal_masuk)}
                    </Text>
                  </Group>
                </Stack>
              </CardBox>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 8 }}>
              <CardBox>
                <Stack gap={12}>
                  <CardSectionTitle>Referensi Solusi Awal</CardSectionTitle>
                  <Divider color="#ECECF3" />
                  <Text fz={17} c="#4B5563" style={{ whiteSpace: "pre-line" }}>
                    • {getReferensiSolusiAwal(detail)}
                  </Text>
                </Stack>
              </CardBox>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 5 }}>
              <TicketDiagnosaCard
                latestDiagnosa={latestDiagnosa}
                canModifyDetail={canModifyDetail}
                loadingAction={loadingAction}
                onOpenDiagnosaModal={() => setOpenedDiagnosaModal(true)}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 4 }}>
              <TicketSparepartSection
                sparepartMasterOptions={sparepartMasterOptions}
                sparepartDigunakan={sparepartDigunakan}
                canModifyDetail={canModifyDetail}
                loadingAction={loadingAction}
                onTambahSparepart={handleTambahSparepart}
                onHapusSparepart={handleHapusSparepart}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 3 }}>
              <TicketCostSummary
                totalJasa={totalJasa}
                totalSparepart={totalSparepart}
                estimasiWaktuText={formatDisplayDateTime(detail.estimasi_waktu)}
                totalEstimasi={totalEstimasi}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <TicketJasaSection
                jasaMasterOptions={jasaMasterOptions}
                jasaServis={jasaServis}
                canModifyDetail={canModifyDetail}
                loadingAction={loadingAction}
                onTambahJasa={handleTambahJasa}
                onHapusJasa={handleHapusJasa}
              />
            </Grid.Col>
          </Grid>
        </Box>
      </Stack>

      <DiagnosaLanjutanModal
        opened={openedDiagnosaModal}
        onClose={() => setOpenedDiagnosaModal(false)}
        noTiket={detail.nomor_tiket}
        pelanggan={detail.nama_cust}
        perangkat={perangkatDisplay}
        statusSaatIni={detail.status_servis}
        initialDiagnosaLanjutan={latestDiagnosa?.hasil_diagnosa || ""}
        initialCatatanTeknisi={latestDiagnosa?.catatan_teknisi || ""}
        onSave={handleSaveDiagnosa}
      />
    </>
  );
}