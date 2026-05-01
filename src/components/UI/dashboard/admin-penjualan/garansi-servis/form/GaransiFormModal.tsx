/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Box,
  Button,
  Group,
  Modal,
  NumberInput,
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
    <Text fw={700} fz={15} c="#6B7280">
      {label}
      {required && (
        <Text span c="red" ml={2}>
          *
        </Text>
      )}
    </Text>
  );
}

function addDays(dateString: string, days: number) {
  if (!dateString || days <= 0) return "";

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
    if (!opened) return;

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
        body: {
          backgroundColor: "#D9D9D9",
          padding: 0,
        },
        header: {
          backgroundColor: "#D9D9D9",
          paddingBottom: 0,
        },
        content: {
          backgroundColor: "#D9D9D9",
        },
      }}
      title={
        <Text fw={800} fz={30} c="#000000">
          Buat Garansi
        </Text>
      }
    >
      <Box px="lg" pb="lg" pt="md">
        <form onSubmit={handleSubmit}>
          <Stack gap={20}>
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
                    height: 50,
                    border: errors.nomorTiket ? "1px solid #FA5252" : "none",
                    backgroundColor: "#FFFFFF",
                    fontSize: 16,
                  },
                  error: {
                    fontSize: 14,
                    marginTop: 6,
                  },
                }}
              />
            </Stack>

            <Stack gap={6}>
              <FieldLabel label="Nama Pelanggan" required />

              <TextInput
                value={selectedTiket?.namaPelanggan || ""}
                readOnly
                radius="md"
                styles={{
                  input: {
                    height: 50,
                    border: "none",
                    backgroundColor: "#FFFFFF",
                    fontSize: 16,
                  },
                }}
              />
            </Stack>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              <Stack gap={6}>
                <FieldLabel label="Perangkat" />

                <TextInput
                  value={selectedTiket?.perangkat || ""}
                  readOnly
                  radius="md"
                  styles={{
                    input: {
                      height: 50,
                      border: "none",
                      backgroundColor: "#FFFFFF",
                      fontSize: 16,
                    },
                  }}
                />
              </Stack>

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
                  radius="md"
                  disabled={isSubmitting}
                  error={errors.periodeHari}
                  styles={{
                    input: {
                      height: 50,
                      border: errors.periodeHari
                        ? "1px solid #FA5252"
                        : "none",
                      backgroundColor: "#FFFFFF",
                      fontSize: 16,
                    },
                    error: {
                      fontSize: 14,
                      marginTop: 6,
                    },
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
                  rightSection={<IconCalendarMonth size={20} color="#8E8E8E" />}
                  radius="md"
                  disabled={isSubmitting}
                  error={errors.tanggalMulai}
                  styles={{
                    input: {
                      height: 50,
                      border: errors.tanggalMulai
                        ? "1px solid #FA5252"
                        : "none",
                      backgroundColor: "#FFFFFF",
                      fontSize: 16,
                    },
                    error: {
                      fontSize: 14,
                      marginTop: 6,
                    },
                  }}
                />
              </Stack>

              <Stack gap={6}>
                <FieldLabel label="Tanggal Berakhir" required />

                <TextInput
                  type="date"
                  value={tanggalBerakhir}
                  readOnly
                  rightSection={<IconCalendarMonth size={20} color="#8E8E8E" />}
                  radius="md"
                  error={errors.tanggalBerakhir}
                  styles={{
                    input: {
                      height: 50,
                      border: errors.tanggalBerakhir
                        ? "1px solid #FA5252"
                        : "none",
                      backgroundColor: "#FFFFFF",
                      fontSize: 16,
                    },
                    error: {
                      fontSize: 14,
                      marginTop: 6,
                    },
                  }}
                />
              </Stack>
            </SimpleGrid>

            <Group justify="flex-end" gap="lg" mt="lg">
              <Button
                type="button"
                radius="xl"
                onClick={handleClose}
                disabled={isSubmitting}
                style={{
                  minWidth: 150,
                  height: 42,
                  backgroundColor: "#FF1008",
                  fontSize: 17,
                  fontWeight: 700,
                }}
              >
                Batal
              </Button>

              <Button
                type="submit"
                radius="xl"
                loading={isSubmitting}
                style={{
                  minWidth: 150,
                  height: 42,
                  backgroundColor: "#0D4CB5",
                  fontSize: 17,
                  fontWeight: 700,
                }}
              >
                Simpan
              </Button>
            </Group>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
}