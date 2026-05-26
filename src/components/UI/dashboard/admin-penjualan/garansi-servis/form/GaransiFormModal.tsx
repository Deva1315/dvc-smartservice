/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Box,
  Button,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconCalendarMonth } from "@tabler/icons-react";
import { garansiFormSchema, validateWithZod } from "@/lib/validations";

export type TiketSelesaiOption = {
  value: string;
  label: string;
  namaPelanggan: string;
  perangkat: string;
  tanggalServis: string;
};

export type GaransiFormPayload = {
  nomorTiket: string;
  namaPelanggan: string;
  perangkat: string;
  periodeHari: number;
  tanggalMulai: string;
  tanggalBerakhir: string;
};

type GaransiFormModalProps = {
  opened: boolean;
  onClose: () => void;
  tiketOptions: TiketSelesaiOption[];
  onSubmit: (payload: GaransiFormPayload) => Promise<boolean> | boolean;
  isSubmitting?: boolean;
};

function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <Text fw={700} fz="sm" c="#374151">
      {label}
      {required ? (
        <Text span c="#EF4444" ml={2}>
          *
        </Text>
      ) : null}
    </Text>
  );
}

const inputBaseStyle = {
  backgroundColor: "#F9FAFB",
  height: 46,
  fontSize: 15,
  color: "#111827",
};

const readOnlyInputStyle = {
  backgroundColor: "#F3F4F6",
  border: "1px solid #E5E7EB",
  height: 46,
  fontSize: 15,
  fontWeight: 600,
  color: "#6B7280",
};

const errorStyle = {
  fontSize: 13,
  marginTop: 6,
};

function addDays(dateString: string, days: number) {
  if (!dateString || days <= 0) {
    return "";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  date.setDate(date.getDate() + days);

  return date.toISOString().slice(0, 10);
}

function getTodayInputDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function GaransiFormModal({
  opened,
  onClose,
  tiketOptions,
  onSubmit,
  isSubmitting = false,
}: GaransiFormModalProps) {
  const [nomorTiket, setNomorTiket] = useState<string | null>(null);
  const [periodeHari, setPeriodeHari] = useState<number | string>(30);
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedTiket = useMemo(() => {
    return tiketOptions.find((item) => item.value === nomorTiket) || null;
  }, [nomorTiket, tiketOptions]);

  const tanggalBerakhir = useMemo(() => {
    return addDays(tanggalMulai, Number(periodeHari || 0));
  }, [tanggalMulai, periodeHari]);

  useEffect(() => {
    if (!opened) {
      return;
    }

    setNomorTiket(null);
    setPeriodeHari(30);
    setTanggalMulai(getTodayInputDate());
    setErrors({});
  }, [opened]);

  function clearFieldError(field: string) {
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  }

  function handleClose() {
    setErrors({});
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = validateWithZod(garansiFormSchema, {
      nomorTiket,
      periodeHari,
      tanggalMulai,
      tanggalBerakhir,
    });

    if (!parsed.success) {
      setErrors(parsed.errors);
      return;
    }

    if (!selectedTiket) {
      setErrors((prev) => ({
        ...prev,
        nomorTiket: "No tiket wajib dipilih.",
      }));
      return;
    }

    setErrors({});

    const success = await onSubmit({
      nomorTiket: parsed.data.nomorTiket,
      namaPelanggan: selectedTiket.namaPelanggan,
      perangkat: selectedTiket.perangkat,
      periodeHari: parsed.data.periodeHari,
      tanggalMulai: String(parsed.data.tanggalMulai),
      tanggalBerakhir: String(parsed.data.tanggalBerakhir),
    });

    if (success) {
      handleClose();
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      centered
      size="58rem"
      radius="xl"
      closeOnClickOutside={!isSubmitting}
      closeButtonProps={{
        size: "lg",
        radius: "xl",
      }}
      styles={{
        content: {
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
        },
        header: {
          backgroundColor: "#FFFFFF",
          padding: "26px 30px 10px",
          borderBottom: "1px solid #F1F5F9",
        },
        body: {
          padding: 0,
          backgroundColor: "#FFFFFF",
        },
        title: {
          color: "#111827",
          fontWeight: 800,
          fontSize: 24,
          lineHeight: 1.2,
        },
        close: {
          color: "#6B7280",
        },
      }}
      title="Buat Garansi"
    >
      <Box
        style={{
          maxHeight: "calc(100vh - 150px)",
          overflowY: "auto",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Box px={{ base: 20, sm: 30 }} py={26}>
          <form onSubmit={handleSubmit}>
            <Stack gap={30}>
              <Paper
                radius="lg"
                p={{ base: "md", sm: "lg" }}
                withBorder
                style={{
                  borderColor: "#E5E7EB",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <Stack gap="md">
                  <Stack gap={4}>
                    <Text fw={800} fz="lg" c="#111827">
                      Informasi Tiket Servis
                    </Text>

                    <Text fz="sm" c="#6B7280">
                      Pilih tiket servis yang sudah selesai untuk dibuatkan
                      garansi.
                    </Text>
                  </Stack>

                  <Stack gap={6}>
                    <FieldLabel label="No Tiket" required />

                    <Select
                      value={nomorTiket}
                      onChange={(value) => {
                        setNomorTiket(value);
                        clearFieldError("nomorTiket");
                      }}
                      data={tiketOptions}
                      searchable
                      placeholder="Pilih tiket servis yang sudah selesai"
                      radius="md"
                      disabled={isSubmitting}
                      error={errors.nomorTiket}
                      styles={{
                        input: {
                          ...inputBaseStyle,
                          border: errors.nomorTiket
                            ? "1px solid #FA5252"
                            : "1px solid #E5E7EB",
                        },
                        dropdown: {
                          backgroundColor: "#FFFFFF",
                        },
                        option: {
                          color: "#111827",
                          fontSize: 14,
                        },
                        error: errorStyle,
                      }}
                    />
                  </Stack>

                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                    <Stack gap={6}>
                      <FieldLabel label="Nama Pelanggan" />

                      <TextInput
                        value={selectedTiket?.namaPelanggan || ""}
                        readOnly
                        placeholder="Terisi otomatis setelah tiket dipilih"
                        radius="md"
                        styles={{
                          input: readOnlyInputStyle,
                        }}
                      />
                    </Stack>

                    <Stack gap={6}>
                      <FieldLabel label="Perangkat" />

                      <TextInput
                        value={selectedTiket?.perangkat || ""}
                        readOnly
                        placeholder="Terisi otomatis setelah tiket dipilih"
                        radius="md"
                        styles={{
                          input: readOnlyInputStyle,
                        }}
                      />
                    </Stack>
                  </SimpleGrid>
                </Stack>
              </Paper>

              <Paper
                radius="lg"
                p={{ base: "md", sm: "lg" }}
                withBorder
                style={{
                  borderColor: "#E5E7EB",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <Stack gap="md">
                  <Stack gap={4}>
                    <Text fw={800} fz="lg" c="#111827">
                      Periode Garansi
                    </Text>

                    <Text fz="sm" c="#6B7280">
                      Tentukan lama periode garansi dan tanggal mulai garansi.
                      Tanggal berakhir akan dihitung otomatis.
                    </Text>
                  </Stack>

                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
                    <Stack gap={6}>
                      <FieldLabel label="Periode Garansi (Hari)" required />

                      <NumberInput
                        value={periodeHari}
                        onChange={(value) => {
                          setPeriodeHari(value);
                          clearFieldError("periodeHari");
                          clearFieldError("tanggalBerakhir");
                        }}
                        min={1}
                        allowDecimal={false}
                        placeholder="Contoh: 30"
                        radius="md"
                        disabled={isSubmitting}
                        error={errors.periodeHari}
                        styles={{
                          input: {
                            ...inputBaseStyle,
                            border: errors.periodeHari
                              ? "1px solid #FA5252"
                              : "1px solid #E5E7EB",
                          },
                          error: errorStyle,
                        }}
                      />
                    </Stack>

                    <Stack gap={6}>
                      <FieldLabel label="Tanggal Mulai" required />

                      <TextInput
                        type="date"
                        value={tanggalMulai}
                        onChange={(event) => {
                          setTanggalMulai(event.currentTarget.value);
                          clearFieldError("tanggalMulai");
                          clearFieldError("tanggalBerakhir");
                        }}
                        rightSection={
                          <IconCalendarMonth size={18} color="#6B7280" />
                        }
                        radius="md"
                        disabled={isSubmitting}
                        error={errors.tanggalMulai}
                        styles={{
                          input: {
                            ...inputBaseStyle,
                            border: errors.tanggalMulai
                              ? "1px solid #FA5252"
                              : "1px solid #E5E7EB",
                          },
                          error: errorStyle,
                        }}
                      />
                    </Stack>

                    <Stack gap={6}>
                      <FieldLabel label="Tanggal Berakhir" required />

                      <TextInput
                        type="date"
                        value={tanggalBerakhir}
                        readOnly
                        rightSection={
                          <IconCalendarMonth size={18} color="#6B7280" />
                        }
                        radius="md"
                        error={errors.tanggalBerakhir}
                        styles={{
                          input: {
                            ...readOnlyInputStyle,
                            border: errors.tanggalBerakhir
                              ? "1px solid #FA5252"
                              : "1px solid #E5E7EB",
                          },
                          error: errorStyle,
                        }}
                      />
                    </Stack>
                  </SimpleGrid>
                </Stack>
              </Paper>

              <Group
                justify="flex-end"
                gap="md"
                pt={8}
                style={{
                  position: "sticky",
                  bottom: 0,
                  backgroundColor: "#FFFFFF",
                  paddingTop: 18,
                  borderTop: "1px solid #F1F5F9",
                  zIndex: 2,
                }}
              >
                <Button
                  type="button"
                  radius="md"
                  size="md"
                  variant="outline"
                  color="gray"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  style={{
                    minWidth: 130,
                    height: 46,
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  Batal
                </Button>

                <Button
                  type="submit"
                  radius="md"
                  size="md"
                  loading={isSubmitting}
                  style={{
                    minWidth: 150,
                    height: 46,
                    backgroundColor: "#0D4CB5",
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  Simpan Garansi
                </Button>
              </Group>
            </Stack>
          </form>
        </Box>
      </Box>
    </Modal>
  );
}