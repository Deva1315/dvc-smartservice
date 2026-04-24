"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Menu,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useParams, useRouter } from "next/navigation";
import {
  IconCalendarMonth,
  IconDeviceLaptop,
  IconMapPin,
  IconPhone,
  IconPlus,
  IconUser,
} from "@tabler/icons-react";
import DiagnosaLanjutanModal from "@/components/UI/dashboard/teknisi/antrian-tiket-servis/modal/DiagnosaLanjutanModal";
import { formatCurrency } from "@/utils/currency-format/format-currency";
import {
  findTeknisiTicketByNomorTiket,
  formatDisplayDate,
  getDropPointDisplay,
  getPerangkatDisplay,
  getStatusServisColor,
  getStatusServisLabel,
  getStatusVerifikasiColor,
  getStatusVerifikasiLabel,
  getTotalEstimasi,
  getTotalJasa,
  getTotalSparepart,
  jasaServisMasterOptions,
  sparepartMasterOptions,
  statusServisOptions,
  type TeknisiJasaServisItem,
  type TeknisiRiwayatStatusItem,
  type TeknisiSparepartItem,
  type TeknisiStatusServis,
} from "@/lib/dummy/tiket-servis-teknisi.mock";

function CardSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text fw={700} fz={18} c="#2B2B2B">
      {children}
    </Text>
  );
}

function CardBox({
  children,
  bg = "#F7F7FB",
}: {
  children: React.ReactNode;
  bg?: string;
}) {
  return (
    <Paper
      radius="lg"
      p="md"
      style={{
        backgroundColor: bg,
        border: "1px solid #ECECF3",
        height: "100%",
      }}
    >
      {children}
    </Paper>
  );
}

function InfoRow({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <Group gap={10} wrap="nowrap" align="flex-start">
      <Box c="#6B7280" pt={2}>
        {icon}
      </Box>
      <Text fz={16} c="#4B5563">
        {text}
      </Text>
    </Group>
  );
}

function SimpleInfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <Group justify="space-between" align="flex-start" wrap="nowrap">
      <Text fw={600} fz={15} c="#6B7280">
        {label}
      </Text>
      <Text fz={16} c="#2B2B2B" ta="right">
        {value || "-"}
      </Text>
    </Group>
  );
}

function getHariIniIso() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

export default function DetailTiketServisPage() {
  const params = useParams();
  const router = useRouter();

  const nomorTiketParam =
    typeof params?.id === "string" ? decodeURIComponent(params.id) : "";

  const ticket = useMemo(
    () => findTeknisiTicketByNomorTiket(nomorTiketParam),
    [nomorTiketParam]
  );

  const [statusServis, setStatusServis] = useState<TeknisiStatusServis>(
    ticket?.statusServis ?? "Belum_Diproses"
  );
  const [estimasiWaktu, setEstimasiWaktu] = useState(
    ticket?.estimasiWaktu ?? ""
  );
  const [diagnosaLanjutan, setDiagnosaLanjutan] = useState(
    ticket?.diagnosaLanjutan ?? ""
  );
  const [catatanTeknisi, setCatatanTeknisi] = useState(
    ticket?.catatanTeknisi ?? ""
  );
  const [jasaServis, setJasaServis] = useState<TeknisiJasaServisItem[]>(
    ticket?.jasaServis ?? []
  );
  const [sparepartDigunakan, setSparepartDigunakan] = useState<
    TeknisiSparepartItem[]
  >(ticket?.sparepartDigunakan ?? []);
  const [riwayatStatus, setRiwayatStatus] = useState<TeknisiRiwayatStatusItem[]>(
    ticket?.riwayatStatus ?? []
  );
  const [openedDiagnosaModal, setOpenedDiagnosaModal] = useState(false);

  if (!ticket) {
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

  const totalJasa = getTotalJasa(jasaServis);
  const totalSparepart = getTotalSparepart(sparepartDigunakan);
  const totalEstimasi = getTotalEstimasi(jasaServis, sparepartDigunakan);
  const dropPointDisplay = getDropPointDisplay(ticket);

  const isStatusEditable = ticket.statusVerifikasi === "Diterima";

  function handleUpdateStatus() {
    if (!isStatusEditable) {
      notifications.show({
        title: "Gagal",
        message: "Status servis hanya bisa diubah jika tiket sudah diterima.",
        color: "red",
      });
      return;
    }

    setRiwayatStatus((prev) => {
      const nextLabel = getStatusServisLabel(statusServis);

      const existsSameLast =
        prev.length > 0 && prev[prev.length - 1]?.label === nextLabel;

      const resetPrev = prev.map((item) => ({
        ...item,
        highlighted: false,
      }));

      if (existsSameLast) {
        return resetPrev.map((item, index) =>
          index === resetPrev.length - 1
            ? { ...item, highlighted: true }
            : item
        );
      }

      return [
        ...resetPrev,
        {
          id: crypto.randomUUID(),
          label: nextLabel,
          date: getHariIniIso(),
          highlighted: true,
        },
      ];
    });

    notifications.show({
      title: "Berhasil",
      message: "Status tiket servis berhasil diperbarui.",
      color: "green",
    });
  }

  function handleSaveDiagnosa(payload: {
    diagnosaLanjutan: string;
    catatanTeknisi: string;
  }) {
    setDiagnosaLanjutan(payload.diagnosaLanjutan);
    setCatatanTeknisi(payload.catatanTeknisi);

    notifications.show({
      title: "Berhasil",
      message: "Diagnosa lanjutan teknisi berhasil disimpan.",
      color: "green",
    });
  }

  function handleTambahJasa(itemId: string) {
    const found = jasaServisMasterOptions.find((item) => item.value === itemId);
    if (!found) return;

    setJasaServis((prev) => {
      const existing = prev.find((item) => item.idJasaServis === found.value);

      if (existing) {
        return prev.map((item) =>
          item.idJasaServis === found.value
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          idJasaServis: found.value,
          nama: found.label,
          qty: 1,
          harga: found.harga,
        },
      ];
    });

    notifications.show({
      title: "Berhasil",
      message: "Jasa servis berhasil ditambahkan.",
      color: "green",
    });
  }

  function handleTambahSparepart(itemId: string) {
    const found = sparepartMasterOptions.find((item) => item.value === itemId);
    if (!found) return;

    setSparepartDigunakan((prev) => {
      const existing = prev.find((item) => item.idSparepart === found.value);

      if (existing) {
        return prev.map((item) =>
          item.idSparepart === found.value
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          idSparepart: found.value,
          nama: found.label,
          qty: 1,
          harga: found.harga,
        },
      ];
    });

    notifications.show({
      title: "Berhasil",
      message: "Sparepart berhasil ditambahkan ke tiket.",
      color: "green",
    });
  }

  function handleHapusJasa(idItem: string) {
    setJasaServis((prev) => prev.filter((item) => item.id !== idItem));
  }

  function handleHapusSparepart(idItem: string) {
    setSparepartDigunakan((prev) => prev.filter((item) => item.id !== idItem));
  }

  return (
    <>
      <Stack gap={18}>
        <Title order={1} fw={800} c="#000000">
          Detail Tiket Servis
        </Title>

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

                  <InfoRow
                    icon={<IconUser size={22} />}
                    text={ticket.namaCust}
                  />
                  <InfoRow
                    icon={<IconPhone size={22} />}
                    text={ticket.phoneCust}
                  />
                  <InfoRow
                    icon={<IconMapPin size={22} />}
                    text={ticket.alamatCust}
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
                    text={getPerangkatDisplay(ticket)}
                  />

                  <SimpleInfoRow
                    label="Jenis Perangkat"
                    value={ticket.jenisPerangkat}
                  />
                  <SimpleInfoRow
                    label="Merk Perangkat"
                    value={ticket.merkPerangkat}
                  />
                  <SimpleInfoRow
                    label="Sumber Tiket"
                    value={ticket.sumberTiket}
                  />
                  <SimpleInfoRow
                    label="Drop Point"
                    value={dropPointDisplay || "-"}
                  />
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
                      setStatusServis(
                        (value as TeknisiStatusServis) ?? "Belum_Diproses"
                      )
                    }
                    data={statusServisOptions}
                    disabled={!isStatusEditable}
                    styles={{
                      input: {
                        height: 44,
                        borderRadius: 12,
                      },
                    }}
                  />

                  <TextInput
                    value={estimasiWaktu}
                    onChange={(event) =>
                      setEstimasiWaktu(event.currentTarget.value)
                    }
                    placeholder="Estimasi waktu pengerjaan"
                    leftSection={<IconCalendarMonth size={18} />}
                    disabled={!isStatusEditable}
                    styles={{
                      input: {
                        height: 44,
                        borderRadius: 12,
                      },
                    }}
                  />

                  <Badge
                    color={getStatusVerifikasiColor(ticket.statusVerifikasi)}
                    variant="light"
                    radius="xl"
                    size="lg"
                    w="fit-content"
                  >
                    Verifikasi: {getStatusVerifikasiLabel(ticket.statusVerifikasi)}
                  </Badge>

                  <Divider color="#E8DCC5" />

                  <Button
                    radius="md"
                    onClick={handleUpdateStatus}
                    disabled={!isStatusEditable}
                    style={{
                      backgroundColor: "#FFFFFF",
                      color: "#224B8F",
                      border: "1px solid #DFDFE8",
                      height: 44,
                    }}
                  >
                    Ubah Status
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
                    • {ticket.keluhan}
                  </Text>
                </Stack>
              </CardBox>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 4 }}>
              <CardBox>
                <Stack gap={12}>
                  <CardSectionTitle>Riwayat Status</CardSectionTitle>
                  <Divider color="#ECECF3" />

                  {riwayatStatus.map((item) => (
                    <Group key={item.id} justify="space-between" align="center">
                      <Group gap={10} wrap="nowrap">
                        <Text c="#9CA3AF" fz={22}>
                          •
                        </Text>

                        {item.highlighted ? (
                          <Badge
                            color={getStatusServisColor(statusServis)}
                            variant="light"
                            radius="xl"
                            size="lg"
                          >
                            {item.label}
                          </Badge>
                        ) : (
                          <Text fz={16} c="#4B5563">
                            {item.label}
                          </Text>
                        )}
                      </Group>

                      <Text fz={14} c="#6B7280">
                        {formatDisplayDate(item.date)}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </CardBox>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 8 }}>
              <CardBox>
                <Stack gap={12}>
                  <CardSectionTitle>Referensi Solusi Awal</CardSectionTitle>
                  <Divider color="#ECECF3" />
                  <Text fz={17} c="#4B5563">
                    • {ticket.referensiSolusiAwal || "-"}
                  </Text>
                </Stack>
              </CardBox>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 5 }}>
              <CardBox>
                <Stack gap={14}>
                  <Group justify="space-between" align="center">
                    <CardSectionTitle>Diagnosa Lanjutan Teknisi</CardSectionTitle>
                    <Button
                      size="xs"
                      radius="md"
                      onClick={() => setOpenedDiagnosaModal(true)}
                      style={{
                        backgroundColor: "#0D4CB5",
                      }}
                    >
                      {diagnosaLanjutan ? "Edit" : "Isi Diagnosa"}
                    </Button>
                  </Group>

                  <Divider color="#ECECF3" />

                  {diagnosaLanjutan ? (
                    <Stack gap={10}>
                      <Text fw={700} fz={17} c="#224B8F">
                        Diagnosa Teknisi
                      </Text>

                      <Text fz={16} c="#4B5563">
                        {diagnosaLanjutan}
                      </Text>

                      {catatanTeknisi ? (
                        <Text fz={15} c="#6B7280">
                          Catatan: {catatanTeknisi}
                        </Text>
                      ) : null}
                    </Stack>
                  ) : (
                    <Text fz={16} c="#9CA3AF">
                      Belum ada diagnosa lanjutan teknisi.
                    </Text>
                  )}
                </Stack>
              </CardBox>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 4 }}>
              <CardBox>
                <Stack gap={14}>
                  <Group justify="space-between" align="center">
                    <CardSectionTitle>Sparepart Digunakan</CardSectionTitle>

                    <Menu shadow="md" width={240} withinPortal={false}>
                      <Menu.Target>
                        <Button
                          size="xs"
                          radius="md"
                          leftSection={<IconPlus size={14} />}
                          style={{
                            backgroundColor: "#0D4CB5",
                          }}
                        >
                          Tambah
                        </Button>
                      </Menu.Target>

                      <Menu.Dropdown>
                        {sparepartMasterOptions.map((item) => (
                          <Menu.Item
                            key={item.value}
                            onClick={() => handleTambahSparepart(item.value)}
                          >
                            {item.label}
                          </Menu.Item>
                        ))}
                      </Menu.Dropdown>
                    </Menu>
                  </Group>

                  <Divider color="#ECECF3" />

                  {sparepartDigunakan.length > 0 ? (
                    <Stack gap={10}>
                      {sparepartDigunakan.map((item) => (
                        <Group
                          key={item.id}
                          justify="space-between"
                          align="center"
                          wrap="nowrap"
                        >
                          <Stack gap={2} style={{ minWidth: 0 }}>
                            <Text fw={600} fz={16} c="#4B5563">
                              {item.nama}
                            </Text>
                            <Text fz={14} c="#6B7280">
                              Qty {item.qty}
                            </Text>
                          </Stack>

                          <Group gap={8} wrap="nowrap">
                            <Text fz={16} c="#4B5563">
                              {formatCurrency(item.qty * item.harga, {
                                locale: "id-ID",
                                prefix: "Rp ",
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })}
                            </Text>

                            <UnstyledButton
                              onClick={() => handleHapusSparepart(item.id)}
                            >
                              <Text c="#D32F2F" fw={700}>
                                ×
                              </Text>
                            </UnstyledButton>
                          </Group>
                        </Group>
                      ))}
                    </Stack>
                  ) : (
                    <Text fz={16} c="#9CA3AF">
                      Belum ada sparepart yang digunakan.
                    </Text>
                  )}
                </Stack>
              </CardBox>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 3 }}>
              <CardBox>
                <Stack gap={12}>
                  <CardSectionTitle>Estimasi Biaya</CardSectionTitle>
                  <Divider color="#ECECF3" />

                  <Group justify="space-between">
                    <Text fz={16} c="#4B5563">
                      Jasa
                    </Text>
                    <Text fz={16} c="#4B5563">
                      {formatCurrency(totalJasa, {
                        locale: "id-ID",
                        prefix: "Rp ",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </Text>
                  </Group>

                  <Group justify="space-between">
                    <Text fz={16} c="#4B5563">
                      Total Sparepart
                    </Text>
                    <Text fz={16} c="#4B5563">
                      {formatCurrency(totalSparepart, {
                        locale: "id-ID",
                        prefix: "Rp ",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </Text>
                  </Group>

                  <Group justify="space-between">
                    <Text fz={16} c="#4B5563">
                      Estimasi Waktu
                    </Text>
                    <Text fz={16} c="#4B5563">
                      {estimasiWaktu || "-"}
                    </Text>
                  </Group>

                  <Divider color="#ECECF3" />

                  <Group justify="space-between">
                    <Text fw={800} fz={18} c="#2B2B2B">
                      Total Estimasi
                    </Text>
                    <Text fw={800} fz={18} c="#2B2B2B">
                      {formatCurrency(totalEstimasi, {
                        locale: "id-ID",
                        prefix: "Rp ",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </Text>
                  </Group>
                </Stack>
              </CardBox>
            </Grid.Col>

            <Grid.Col span={12}>
              <CardBox>
                <Stack gap={14}>
                  <Group justify="space-between" align="center">
                    <CardSectionTitle>Jasa Servis</CardSectionTitle>

                    <Menu shadow="md" width={280} withinPortal={false}>
                      <Menu.Target>
                        <Button
                          size="xs"
                          radius="md"
                          leftSection={<IconPlus size={14} />}
                          style={{
                            backgroundColor: "#0D4CB5",
                          }}
                        >
                          Tambah Jasa
                        </Button>
                      </Menu.Target>

                      <Menu.Dropdown>
                        {jasaServisMasterOptions.map((item) => (
                          <Menu.Item
                            key={item.value}
                            onClick={() => handleTambahJasa(item.value)}
                          >
                            {item.label}
                          </Menu.Item>
                        ))}
                      </Menu.Dropdown>
                    </Menu>
                  </Group>

                  <Divider color="#ECECF3" />

                  <Box
                    style={{
                      border: "1px solid #ECECF3",
                      borderRadius: 12,
                      overflow: "hidden",
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <Table
                      horizontalSpacing="md"
                      verticalSpacing="md"
                      highlightOnHover={false}
                    >
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Nama Jasa</Table.Th>
                          <Table.Th>Qty</Table.Th>
                          <Table.Th>Harga</Table.Th>
                          <Table.Th>Total</Table.Th>
                          <Table.Th>Aksi</Table.Th>
                        </Table.Tr>
                      </Table.Thead>

                      <Table.Tbody>
                        {jasaServis.length > 0 ? (
                          jasaServis.map((item) => (
                            <Table.Tr key={item.id}>
                              <Table.Td>
                                <Text fz={16} c="#4B5563">
                                  {item.nama}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text fz={16} c="#4B5563">
                                  {item.qty}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text fz={16} c="#4B5563">
                                  {formatCurrency(item.harga, {
                                    locale: "id-ID",
                                    prefix: "Rp ",
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  })}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text fw={700} fz={16} c="#2B2B2B">
                                  {formatCurrency(item.qty * item.harga, {
                                    locale: "id-ID",
                                    prefix: "Rp ",
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  })}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <UnstyledButton
                                  onClick={() => handleHapusJasa(item.id)}
                                >
                                  <Text c="#D32F2F" fw={700}>
                                    ×
                                  </Text>
                                </UnstyledButton>
                              </Table.Td>
                            </Table.Tr>
                          ))
                        ) : (
                          <Table.Tr>
                            <Table.Td colSpan={5}>
                              <Text ta="center" c="#9CA3AF">
                                Belum ada jasa servis.
                              </Text>
                            </Table.Td>
                          </Table.Tr>
                        )}
                      </Table.Tbody>
                    </Table>
                  </Box>
                </Stack>
              </CardBox>
            </Grid.Col>
          </Grid>
        </Box>
      </Stack>

      <DiagnosaLanjutanModal
        opened={openedDiagnosaModal}
        onClose={() => setOpenedDiagnosaModal(false)}
        noTiket={ticket.nomorTiket}
        pelanggan={ticket.namaCust}
        perangkat={getPerangkatDisplay(ticket)}
        statusSaatIni={statusServis}
        initialDiagnosaLanjutan={diagnosaLanjutan}
        initialCatatanTeknisi={catatanTeknisi}
        onSave={handleSaveDiagnosa}
      />
    </>
  );
}