"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Timeline,
  Title,
} from "@mantine/core";
import {
  IconBuildingStore,
  IconCpu,
  IconDeviceLaptop,
  IconMapPin,
  IconPhone,
  IconUser,
} from "@tabler/icons-react";

const teknisiOptions = [
  { value: "1", label: "Made Wirawan" },
  { value: "2", label: "Dewa Putra" },
  { value: "3", label: "Komang Arta" },
];

const dummyDetail = {
  nomorTiket: "TSK-20260423-001",
  namaPelanggan: "Anton Wijaya",
  noHp: "08123456789",
  alamat: "Jl. Imam Bonjol No. 10, Denpasar",
  perangkat: "Laptop - Asus VivoBook A412U",
  processor: "Intel Core i5",
  ram: "8GB RAM",
  storage: "SSD 256GB",
  keluhan: "Laptop mati total, tidak bisa dinyalakan sama sekali",
  dropPoint: "Cabang Denpasar",
  statusVerifikasi: "Menunggu",
  statusServis: "Belum Diproses",
  tanggalMasuk: "23-04-2024",
};

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card radius="lg" withBorder shadow="xs" p={0} bg="#F7F7FB">
      <Box px="lg" py={12} bg="#F0F0F5">
        <Text fw={800} fz={20}>
          {title}
        </Text>
      </Box>

      <Stack gap={0}>{children}</Stack>
    </Card>
  );
}

function InfoRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Group px="lg" py={14} gap={14} wrap="nowrap">
      <ThemeIcon variant="light" color="gray" radius="xl" size={28}>
        {icon}
      </ThemeIcon>

      <Text fz={16} fw={500}>
        {children}
      </Text>
    </Group>
  );
}

function StatusLine({
  label,
  date,
  active,
}: {
  label: string;
  date: string;
  active?: boolean;
}) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Group gap={10}>
        <Box
          w={10}
          h={10}
          style={{
            borderRadius: 999,
            backgroundColor: active ? "#E5B75D" : "#D1D5DB",
          }}
        />
        {active ? (
          <Badge color="yellow" variant="light" radius="xl" size="lg">
            {label}
          </Badge>
        ) : (
          <Text fz={16}>{label}</Text>
        )}
      </Group>

      <Text fz={15} c="dimmed">
        {date}
      </Text>
    </Group>
  );
}

export default function AdminPenjualanDetailTiketServisPage() {
  const router = useRouter();
  const params = useParams();
  const nomorTiket = String(params.nomorTiket || "");

  return (
    <Stack gap={24}>
      <Group justify="space-between" align="center">
        <Title order={1} fw={800}>
          Detail Tiket Servis
        </Title>

        <Button
          variant="light"
          color="gray"
          radius="xl"
          onClick={() => router.push("/admin_penjualan/tiket-servis")}
        >
          Kembali
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
        <Stack gap="lg" style={{ gridColumn: "span 2" }}>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <InfoCard title="Informasi Pelanggan">
              <InfoRow icon={<IconUser size={18} />}>
                {dummyDetail.namaPelanggan}
              </InfoRow>
              <Divider />
              <InfoRow icon={<IconPhone size={18} />}>
                {dummyDetail.noHp}
              </InfoRow>
              <Divider />
              <InfoRow icon={<IconMapPin size={18} />}>
                {dummyDetail.alamat}
              </InfoRow>
            </InfoCard>

            <InfoCard title="Informasi Perangkat">
              <InfoRow icon={<IconDeviceLaptop size={18} />}>
                {dummyDetail.perangkat}
              </InfoRow>
              <Divider />
              <InfoRow icon={<IconCpu size={18} />}>
                {dummyDetail.processor}
              </InfoRow>
              <Divider />
              <InfoRow icon={<IconCpu size={18} />}>{dummyDetail.ram}</InfoRow>
              <Divider />
              <InfoRow icon={<IconCpu size={18} />}>
                {dummyDetail.storage}
              </InfoRow>
            </InfoCard>
          </SimpleGrid>

          <InfoCard title="Keluhan">
            <Box px="lg" py={16}>
              <Text fz={17}>• {dummyDetail.keluhan}</Text>
            </Box>
          </InfoCard>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <InfoCard title="Drop Point">
              <InfoRow icon={<IconBuildingStore size={18} />}>
                {dummyDetail.dropPoint}
              </InfoRow>
            </InfoCard>

            <InfoCard title="Status Servis">
              <Stack px="lg" py="md" gap={14}>
                <StatusLine label="Tiket Dibuat" date="23-04-2024" />
                <StatusLine label="Menunggu Verifikasi" date="23-04-2024" />
                <StatusLine label="Menunggu Teknisi" date="23-04-2024" />
                <StatusLine label="Sedang Diproses" date="23-04-2024" active />
              </Stack>
            </InfoCard>
          </SimpleGrid>
        </Stack>

        <Stack gap="lg">
          <Card radius="lg" withBorder shadow="xs" p="lg" bg="#FFF9EF">
            <Stack gap="md">
              <Text fw={800} fz={20}>
                Verifikasi Tiket Servis
              </Text>

              <Text fw={700} fz={15}>
                Nomor Tiket
              </Text>

              <Badge color="blue" variant="light" radius="sm" size="lg">
                {decodeURIComponent(nomorTiket)}
              </Badge>

              <Select
                placeholder="Pilih Teknisi..."
                data={teknisiOptions}
                radius="md"
              />

              <Group grow>
                <Button color="red" radius="xl">
                  Tolak
                </Button>
                <Button color="blue" radius="xl">
                  Terima Tiket
                </Button>
              </Group>

              <Button variant="subtle" color="blue" radius="xl">
                Batalkan Servis
              </Button>
            </Stack>
          </Card>

          <Card radius="lg" withBorder shadow="xs" p={0} bg="#F7F7FB">
            <Box px="lg" py={12} bg="#F0F0F5">
              <Text fw={800} fz={20}>
                Riwayat Status
              </Text>
            </Box>

            <Box p="lg">
              <Timeline active={3} bulletSize={13} lineWidth={2}>
                <Timeline.Item title="Tiket Dibuat">
                  <Text c="dimmed" size="sm">
                    23-04-2024
                  </Text>
                </Timeline.Item>

                <Timeline.Item title="Menunggu Verifikasi">
                  <Text c="dimmed" size="sm">
                    23-04-2024
                  </Text>
                </Timeline.Item>

                <Timeline.Item title="Menunggu Teknisi">
                  <Text c="dimmed" size="sm">
                    23-04-2024
                  </Text>
                </Timeline.Item>

                <Timeline.Item title="Sedang Diproses">
                  <Text c="dimmed" size="sm">
                    23-04-2024
                  </Text>
                </Timeline.Item>
              </Timeline>
            </Box>
          </Card>
        </Stack>
      </SimpleGrid>
    </Stack>
  );
}