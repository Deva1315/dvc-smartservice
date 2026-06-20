/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState } from "react";
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
  Textarea,
  ThemeIcon,
  Timeline,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconBuildingStore,
  IconCpu,
  IconDeviceLaptop,
  IconMapPin,
  IconPhone,
  IconUser,
} from "@tabler/icons-react";
import {
  getDetailAdminPenjualanTiketServis,
  getTeknisiAdminPenjualan,
  verifikasiAdminPenjualanTiketServis,
  type DetailTiketServisApiItem,
  type TeknisiApiItem,
} from "@/lib/admin-penjualan/admin-penjualan-tiket-servis.client";

type SelectOption = {
  value: string;
  label: string;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getStatusVerifikasiColor(status: string) {
  if (status === "Diterima") return "green";
  if (status === "Ditolak") return "red";
  return "yellow";
}

function getStatusServisColor(status: string) {
  if (status === "Selesai") return "green";
  if (status === "Diproses") return "blue";
  if (status === "Menunggu_Sparepart") return "yellow";
  if (status === "Diambil") return "teal";
  if (status === "Dibatalkan") return "red";
  return "gray";
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

function splitAiListText(value: string | null | undefined) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((item) =>
      item
        .replace(/^[-•]\s*/, "")
        .replace(/^\d+[.)]\s*/, "")
        .trim()
    )
    .filter(Boolean);
}

function getDiagnosaKerusakanAwalAi(detail: DetailTiketServisApiItem | null) {
  if (!detail?.diagnosa_ai) {
    return null;
  }

  const solusi = splitAiListText(detail.diagnosa_ai.kemungkinan_solusi);
  const saran = splitAiListText(detail.diagnosa_ai.saran_tindakan);

  return solusi[0] || saran[0] || null;
}

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

      <Box
        style={{
          fontSize: 16,
          fontWeight: 500,
          color: "#111111",
        }}
      >
        {children || "-"}
      </Box>
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
  const decodedNomorTiket = decodeURIComponent(nomorTiket);

  const [detail, setDetail] = useState<DetailTiketServisApiItem | null>(null);
  const [teknisiOptions, setTeknisiOptions] = useState<SelectOption[]>([]);
  const [selectedTeknisi, setSelectedTeknisi] = useState<string | null>(null);
  const [alasanPenolakan, setAlasanPenolakan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const perangkat = useMemo(() => {
    if (!detail) return "-";

    return detail.merk_perangkat
      ? `${detail.jenis_perangkat} - ${detail.merk_perangkat}`
      : detail.jenis_perangkat;
  }, [detail]);

  const isMenungguVerifikasi = detail?.status_verifikasi === "Menunggu";

  const diagnosaKerusakanAwalAi = useMemo(() => {
    return getDiagnosaKerusakanAwalAi(detail);
  }, [detail]);

  async function fetchDetail() {
    try {
      setIsLoading(true);

      const result = await getDetailAdminPenjualanTiketServis(decodedNomorTiket);
      setDetail(result.data || null);
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil detail tiket servis.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchTeknisiOptions() {
    try {
      const result = await getTeknisiAdminPenjualan();

      setTeknisiOptions(
        (result.data || []).map((item: TeknisiApiItem) => ({
          value: item.id,
          label: `${item.nama} - ${item.email}`,
        }))
      );
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data teknisi.",
        color: "red",
      });
    }
  }

  useEffect(() => {
    fetchDetail();
    fetchTeknisiOptions();
  }, []);

  async function handleTerimaTiket() {
    if (!selectedTeknisi) {
      notifications.show({
        title: "Gagal",
        message: "Teknisi wajib dipilih sebelum menerima tiket.",
        color: "red",
      });
      return;
    }

    try {
      setIsVerifying(true);

      await verifikasiAdminPenjualanTiketServis(decodedNomorTiket, {
        status_verifikasi: "Diterima",
        id_user: selectedTeknisi,
      });

      notifications.show({
        title: "Berhasil",
        message: "Tiket berhasil diterima dan ditugaskan ke teknisi.",
        color: "green",
      });

      await fetchDetail();
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error ? error.message : "Gagal menerima tiket servis.",
        color: "red",
      });
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleTolakTiket() {
    if (!alasanPenolakan.trim()) {
      notifications.show({
        title: "Gagal",
        message: "Alasan penolakan wajib diisi.",
        color: "red",
      });
      return;
    }

    try {
      setIsVerifying(true);

      await verifikasiAdminPenjualanTiketServis(decodedNomorTiket, {
        status_verifikasi: "Ditolak",
        alasan_penolakan: alasanPenolakan,
      });

      notifications.show({
        title: "Berhasil",
        message: "Tiket servis berhasil ditolak.",
        color: "green",
      });

      await fetchDetail();
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error ? error.message : "Gagal menolak tiket servis.",
        color: "red",
      });
    } finally {
      setIsVerifying(false);
    }
  }

  if (isLoading && !detail) {
    return (
      <Text fw={700} fz={18} color="#111111">
        Memuat detail tiket servis...
      </Text>
    );
  }

  if (!detail) {
    return (
      <Stack gap="md">
        <Text fw={700} fz={18} color="#111111">
          Detail tiket servis tidak ditemukan.
        </Text>

        <Button
          variant="light"
          color="gray"
          radius="xl"
          w="fit-content"
          onClick={() => router.push("/admin_penjualan/tiket-servis")}
        >
          Kembali
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap={24}>
      <Group justify="space-between" align="center">
        <Title order={1} fw={800} style={{ color: "#111111" }}>
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
                {detail.nama_cust}
              </InfoRow>

              <Divider />

              <InfoRow icon={<IconPhone size={18} />}>
                {detail.phone_cust}
              </InfoRow>

              <Divider />

              <InfoRow icon={<IconMapPin size={18} />}>
                {detail.alamat_cust || "-"}
              </InfoRow>
            </InfoCard>

            <InfoCard title="Informasi Perangkat">
              <InfoRow icon={<IconDeviceLaptop size={18} />}>
                {perangkat}
              </InfoRow>

              <Divider />

              <InfoRow icon={<IconCpu size={18} />}>
                <Group gap={8}>
                  <Text span>Status Verifikasi:</Text>
                  <Badge
                    color={getStatusVerifikasiColor(detail.status_verifikasi)}
                    variant="light"
                    radius="xl"
                  >
                    {detail.status_verifikasi}
                  </Badge>
                </Group>
              </InfoRow>

              <Divider />

              <InfoRow icon={<IconCpu size={18} />}>
                <Group gap={8}>
                  <Text span>Status Servis:</Text>
                  <Badge
                    color={getStatusServisColor(detail.status_servis)}
                    variant="light"
                    radius="xl"
                  >
                    {getStatusServisLabel(detail.status_servis)}
                  </Badge>
                </Group>
              </InfoRow>
            </InfoCard>
          </SimpleGrid>

          <InfoCard title="Keluhan">
            <Box px="lg" py={16}>
              <Text fz={17}>• {detail.keluhan}</Text>
            </Box>
          </InfoCard>

          {diagnosaKerusakanAwalAi ? (
            <InfoCard title="Diagnosa Kerusakan Awal dari AI">
              <Box px="lg" py={16}>
                <Stack gap={8}>
                  <Text
                    fz={17}
                    style={{
                      whiteSpace: "pre-line",
                    }}
                  >
                    • {diagnosaKerusakanAwalAi}
                  </Text>

                  <Text fz={13} c="dimmed">
                    Diagnosa awal ini diambil dari solusi terbaik Diagnosa AI
                    dan tetap perlu dikonfirmasi oleh teknisi.
                  </Text>
                </Stack>
              </Box>
            </InfoCard>
          ) : null}

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <InfoCard title="Drop Point">
              <InfoRow icon={<IconBuildingStore size={18} />}>
                {detail.drop_point
                  ? `${detail.drop_point.nama_drop_point} - ${detail.drop_point.alamat}`
                  : "Tidak melalui drop point"}
              </InfoRow>
            </InfoCard>

            <InfoCard title="Status Servis">
              <Stack px="lg" py="md" gap={14}>
                <StatusLine
                  label="Tiket Dibuat"
                  date={formatDate(detail.tanggal_masuk)}
                />

                <StatusLine
                  label={`Verifikasi ${detail.status_verifikasi}`}
                  date={formatDate(detail.tanggal_verifikasi)}
                  active={detail.status_verifikasi === "Menunggu"}
                />

                <StatusLine
                  label={getStatusServisLabel(detail.status_servis)}
                  date={formatDate(detail.tanggal_masuk)}
                  active={detail.status_verifikasi === "Diterima"}
                />
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
                {detail.nomor_tiket}
              </Badge>

              <Text fw={700} fz={15}>
                Status Verifikasi
              </Text>

              <Badge
                color={getStatusVerifikasiColor(detail.status_verifikasi)}
                variant="filled"
                radius="md"
                w="fit-content"
              >
                {detail.status_verifikasi}
              </Badge>

              <Select
                label="Teknisi"
                placeholder="Pilih Teknisi..."
                data={teknisiOptions}
                value={selectedTeknisi}
                onChange={setSelectedTeknisi}
                disabled={!isMenungguVerifikasi}
                searchable
              />

              <Textarea
                label="Alasan Penolakan"
                placeholder="Isi alasan jika tiket ditolak..."
                value={alasanPenolakan}
                onChange={(event) =>
                  setAlasanPenolakan(event.currentTarget.value)
                }
                disabled={!isMenungguVerifikasi}
                minRows={3}
              />

              <Group grow>
                <Button
                  color="red"
                  radius="xl"
                  loading={isVerifying}
                  disabled={!isMenungguVerifikasi}
                  onClick={handleTolakTiket}
                >
                  Tolak
                </Button>

                <Button
                  color="blue"
                  radius="xl"
                  loading={isVerifying}
                  disabled={!isMenungguVerifikasi}
                  onClick={handleTerimaTiket}
                >
                  Terima Tiket
                </Button>
              </Group>

              {detail.status_verifikasi === "Ditolak" && (
                <Text c="red" fw={600}>
                  Alasan: {detail.alasan_penolakan || "-"}
                </Text>
              )}
            </Stack>
          </Card>

          <Card radius="lg" withBorder shadow="xs" p={0} bg="#F7F7FB">
            <Box px="lg" py={12} bg="#F0F0F5">
              <Text fw={800} fz={20}>
                Riwayat Status
              </Text>
            </Box>

            <Box p="lg">
              <Timeline
                active={detail.status_verifikasi === "Diterima" ? 2 : 1}
                bulletSize={13}
                lineWidth={2}
              >
                <Timeline.Item title="Tiket Dibuat">
                  <Text c="dimmed" size="sm">
                    {formatDate(detail.tanggal_masuk)}
                  </Text>
                </Timeline.Item>

                <Timeline.Item title={`Verifikasi ${detail.status_verifikasi}`}>
                  <Text c="dimmed" size="sm">
                    {formatDate(detail.tanggal_verifikasi)}
                  </Text>
                </Timeline.Item>

                <Timeline.Item
                  title={getStatusServisLabel(detail.status_servis)}
                >
                  <Text c="dimmed" size="sm">
                    {formatDate(detail.tanggal_masuk)}
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