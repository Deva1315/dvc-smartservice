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
  IconDeviceLaptop,
  IconRefresh,
  IconSearch,
  IconTicket,
  IconUser,
} from "@tabler/icons-react";

type StatusGaransi = "Aktif" | "Habis" | "Diklaim";

type GaransiData = {
  nomorTiket: string;
  namaPelanggan: string;
  perangkat: string;
  tanggalServis: string;
  periodeHari: number;
  tanggalBerakhir: string;
  status: StatusGaransi;
};

const dummyGaransiData: GaransiData[] = [
  {
    nomorTiket: "TSK-20260423-001",
    namaPelanggan: "Anton Wijaya",
    perangkat: "Laptop - Asus VivoBook A412U",
    tanggalServis: "23-04-2026",
    periodeHari: 30,
    tanggalBerakhir: "23-05-2026",
    status: "Aktif",
  },
  {
    nomorTiket: "TSK-20260423-002",
    namaPelanggan: "Rina Susanti",
    perangkat: "Laptop - Lenovo Ideapad 330",
    tanggalServis: "23-04-2026",
    periodeHari: 30,
    tanggalBerakhir: "23-05-2026",
    status: "Habis",
  },
  {
    nomorTiket: "TSK-20260423-003",
    namaPelanggan: "Danu Pratama",
    perangkat: "PC - Custom",
    tanggalServis: "23-04-2026",
    periodeHari: 60,
    tanggalBerakhir: "22-06-2026",
    status: "Diklaim",
  },
];

function getStatusColor(status: StatusGaransi) {
  const colors: Record<StatusGaransi, string> = {
    Aktif: "green",
    Habis: "yellow",
    Diklaim: "blue",
  };

  return colors[status];
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

export default function AdminPenjualanKlaimGaransiPage() {
  const [nomorTiket, setNomorTiket] = useState("");
  const [selectedGaransi, setSelectedGaransi] = useState<GaransiData | null>(
    null
  );
  const [isChecking, setIsChecking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const isKlaimDisabled =
    !selectedGaransi || selectedGaransi.status !== "Aktif";

  function handleCekGaransi() {
    setIsChecking(true);

    const foundGaransi = dummyGaransiData.find(
      (item) =>
        item.nomorTiket.toLowerCase() === nomorTiket.trim().toLowerCase()
    );

    setTimeout(() => {
      setIsChecking(false);

      if (!foundGaransi) {
        setSelectedGaransi(null);
        notifications.show({
          title: "Tidak ditemukan",
          message: "Data garansi dengan nomor tiket tersebut tidak ditemukan.",
          color: "red",
        });
        return;
      }

      setSelectedGaransi(foundGaransi);
      notifications.show({
        title: "Berhasil",
        message: "Data garansi ditemukan.",
        color: "green",
      });
    }, 300);
  }

  function handleReset() {
    setNomorTiket("");
    setSelectedGaransi(null);
  }

  function handleKlaimGaransi() {
    if (!selectedGaransi || selectedGaransi.status !== "Aktif") {
      return;
    }

    setIsClaiming(true);

    setTimeout(() => {
      setSelectedGaransi({
        ...selectedGaransi,
        status: "Diklaim",
      });

      setIsClaiming(false);

      notifications.show({
        title: "Berhasil",
        message: "Garansi berhasil diklaim.",
        color: "green",
      });
    }, 300);
  }

  return (
    <Stack gap={28}>
      <Group justify="space-between" align="center">
        <TextInput
          value={nomorTiket}
          onChange={(event) => setNomorTiket(event.currentTarget.value)}
          placeholder="Masukkan No Tiket"
          leftSection={<IconSearch size={20} color="#555555" />}
          radius="xl"
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
                  value={selectedGaransi.nomorTiket}
                />

                <InfoRow
                  icon={<IconUser size={19} />}
                  label="Nama Pelanggan"
                  value={selectedGaransi.namaPelanggan}
                />

                <InfoRow
                  icon={<IconDeviceLaptop size={19} />}
                  label="Perangkat"
                  value={selectedGaransi.perangkat}
                />

                <InfoRow
                  icon={<IconCalendarCheck size={19} />}
                  label="Tanggal Servis"
                  value={selectedGaransi.tanggalServis}
                />
              </Stack>

              <Badge
                color={getStatusColor(selectedGaransi.status)}
                variant="filled"
                radius="md"
                size="lg"
                style={{
                  textTransform: "none",
                }}
              >
                {selectedGaransi.status}
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
              <Text fz={17} fw={600} c="#111111">
                Masa Garansi {selectedGaransi.periodeHari} Hari (
                {selectedGaransi.tanggalBerakhir})
              </Text>
            </Box>
          </Stack>
        )}
      </Card>

      <Group justify="flex-end" gap="lg">
        <Button
          radius="xl"
          onClick={handleReset}
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