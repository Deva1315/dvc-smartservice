"use client";

import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCalendarCheck,
  IconCash,
  IconClock,
  IconDeviceLaptop,
  IconRefresh,
  IconSearch,
  IconTicket,
  IconUser,
} from "@tabler/icons-react";
import {
  cekKlaimGaransiByNomorTiket,
  klaimGaransiByNomorTiket,
  type KlaimGaransiApiData,
  type StatusGaransiUi,
} from "@/lib/admin-penjualan/admin-penjualan-garansi-servis.client";

function getStatusColor(status: StatusGaransiUi) {
  const colors: Record<StatusGaransiUi, string> = {
    Aktif: "green",
    Habis: "yellow",
    Diklaim: "blue",
  };

  return colors[status];
}

function formatDateDisplay(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value: string | number | null | undefined) {
  const numberValue = Number(value || 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numberValue) ? numberValue : 0);
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Group gap={14} wrap="nowrap">
      <ThemeIcon variant="light" color="gray" radius="xl" size={34}>
        {icon}
      </ThemeIcon>

      <Stack gap={2}>
        <Text fz={13} fw={700} c="#6B7280">
          {label}
        </Text>
        <Text fz={17} fw={600} c="#111111">
          {value}
        </Text>
      </Stack>
    </Group>
  );
}

function getClaimDisabledMessage(data: KlaimGaransiApiData | null) {
  if (!data) {
    return "Masukkan nomor tiket terlebih dahulu untuk mengecek garansi.";
  }

  if (data.status_display === "Habis") {
    return "Garansi sudah habis sehingga tidak dapat diklaim.";
  }

  if (data.status_display === "Diklaim") {
    return "Garansi ini sudah pernah diklaim.";
  }

  if (!data.can_claim) {
    return "Garansi tidak dapat diklaim.";
  }

  return "";
}

export default function AdminPenjualanKlaimGaransiPage() {
  const [nomorTiket, setNomorTiket] = useState("");
  const [selectedGaransi, setSelectedGaransi] =
    useState<KlaimGaransiApiData | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const isKlaimDisabled =
    !selectedGaransi ||
    selectedGaransi.status_display !== "Aktif" ||
    !selectedGaransi.can_claim ||
    isChecking ||
    isClaiming;

  const disabledMessage = getClaimDisabledMessage(selectedGaransi);

  async function handleCekGaransi() {
    const trimmedNomorTiket = nomorTiket.trim();

    if (!trimmedNomorTiket) {
      notifications.show({
        title: "Gagal",
        message: "Nomor tiket wajib diisi.",
        color: "red",
      });
      return;
    }

    try {
      setIsChecking(true);

      const result = await cekKlaimGaransiByNomorTiket(trimmedNomorTiket);
      const data = result.data as KlaimGaransiApiData;

      setSelectedGaransi(data);

      notifications.show({
        title: "Berhasil",
        message: "Data garansi ditemukan.",
        color: "green",
      });
    } catch (error) {
      setSelectedGaransi(null);

      notifications.show({
        title: "Tidak ditemukan",
        message:
          error instanceof Error
            ? error.message
            : "Data garansi dengan nomor tiket tersebut tidak ditemukan.",
        color: "red",
      });
    } finally {
      setIsChecking(false);
    }
  }

  function handleReset() {
    setNomorTiket("");
    setSelectedGaransi(null);
  }

  async function handleKlaimGaransi() {
    if (!selectedGaransi || isKlaimDisabled) {
      return;
    }

    try {
      setIsClaiming(true);

      const result = await klaimGaransiByNomorTiket(
        selectedGaransi.nomor_tiket
      );
      const data = result.data as KlaimGaransiApiData;

      setSelectedGaransi(data);

      notifications.show({
        title: result.success ? "Berhasil" : "Gagal",
        message: result.message || "Garansi berhasil diklaim.",
        color: result.success ? "green" : "red",
      });
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal melakukan klaim garansi.",
        color: "red",
      });
    } finally {
      setIsClaiming(false);
    }
  }

  return (
    <Stack gap={28}>
      <Group justify="space-between" align="center">
        <TextInput
          value={nomorTiket}
          onChange={(event) => setNomorTiket(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleCekGaransi();
            }
          }}
          placeholder="Masukkan No Tiket"
          leftSection={<IconSearch size={20} color="#555555" />}
          radius="xl"
          disabled={isChecking || isClaiming}
          style={{
            width: "70%",
            maxWidth: 720,
          }}
          styles={{
            input: {
              height: 58,
              fontSize: 17,
              backgroundColor: "#FFFFFF",
            },
          }}
        />

        <Button
          radius="xl"
          leftSection={<IconRefresh size={18} stroke={2.2} />}
          loading={isChecking}
          disabled={isClaiming}
          onClick={handleCekGaransi}
          style={{
            height: 40,
            minWidth: 160,
            backgroundColor: "#0D4CB5",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          Cek Garansi
        </Button>
      </Group>

      <Card
        radius="lg"
        withBorder
        shadow="xs"
        p={0}
        style={{
          overflow: "hidden",
          backgroundColor: "#F7F7FB",
          minHeight: 230,
        }}
      >
        <Box px="lg" py={14} bg="#F0F0F5">
          <Text fw={800} fz={22} c="#111111">
            Informasi Tiket
          </Text>
        </Box>

        {!selectedGaransi ? (
          <Box p="lg">
            <Text fz={16} c="#6B7280">
              Masukkan nomor tiket terlebih dahulu untuk mengecek garansi.
            </Text>
          </Box>
        ) : (
          <Stack gap={18} p="lg">
            <Group justify="space-between" align="flex-start">
              <Stack gap={18}>
                <InfoRow
                  icon={<IconTicket size={19} />}
                  label="No Tiket"
                  value={selectedGaransi.nomor_tiket}
                />

                <InfoRow
                  icon={<IconUser size={19} />}
                  label="Nama Pelanggan"
                  value={selectedGaransi.nama_pelanggan}
                />

                <InfoRow
                  icon={<IconDeviceLaptop size={19} />}
                  label="Perangkat"
                  value={selectedGaransi.perangkat}
                />

                <InfoRow
                  icon={<IconCalendarCheck size={19} />}
                  label="Tanggal Servis"
                  value={formatDateDisplay(selectedGaransi.tanggal_servis)}
                />

                <InfoRow
                  icon={<IconCash size={19} />}
                  label="Total Pembayaran"
                  value={formatCurrency(selectedGaransi.total_pembayaran)}
                />

                {selectedGaransi.tanggal_klaim ? (
                  <InfoRow
                    icon={<IconClock size={19} />}
                    label="Tanggal Klaim"
                    value={formatDateDisplay(selectedGaransi.tanggal_klaim)}
                  />
                ) : null}
              </Stack>

              <Badge
                color={getStatusColor(selectedGaransi.status_display)}
                variant="filled"
                radius="md"
                size="lg"
                style={{
                  textTransform: "none",
                }}
              >
                {selectedGaransi.status_display}
              </Badge>
            </Group>

            <Box
              mt={8}
              px="md"
              py={14}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                border: "1px solid #E5E7EB",
              }}
            >
              <Stack gap={6}>
                <Text fz={17} fw={600} c="#111111">
                  Masa Garansi {selectedGaransi.periode_hari} Hari (
                  {formatDateDisplay(selectedGaransi.tanggal_akhir)})
                </Text>

                <Text fz={15} c="#6B7280">
                  Berlaku mulai{" "}
                  {formatDateDisplay(selectedGaransi.tanggal_mulai)} sampai{" "}
                  {formatDateDisplay(selectedGaransi.tanggal_akhir)}
                </Text>

                {selectedGaransi.keterangan_garansi ? (
                  <Text fz={15} c="#6B7280">
                    Keterangan: {selectedGaransi.keterangan_garansi}
                  </Text>
                ) : null}

                {disabledMessage && selectedGaransi.status_display !== "Aktif" ? (
                  <Text fz={15} fw={600} c="red">
                    {disabledMessage}
                  </Text>
                ) : null}
              </Stack>
            </Box>
          </Stack>
        )}
      </Card>

      <Group justify="flex-end" gap="lg">
        <Button
          radius="xl"
          onClick={handleReset}
          disabled={isChecking || isClaiming}
          style={{
            minWidth: 160,
            height: 44,
            backgroundColor: "#FF1008",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          Batal
        </Button>

        <Button
          radius="xl"
          loading={isClaiming}
          disabled={isKlaimDisabled}
          onClick={handleKlaimGaransi}
          style={{
            minWidth: 160,
            height: 44,
            backgroundColor: isKlaimDisabled ? "#9CA3AF" : "#0D4CB5",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          Klaim
        </Button>
      </Group>
    </Stack>
  );
}