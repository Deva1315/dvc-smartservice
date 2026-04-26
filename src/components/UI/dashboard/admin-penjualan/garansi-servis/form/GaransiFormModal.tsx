/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
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
  if (Number.isNaN(date.getTime())) return "";

  date.setDate(date.getDate() + days);

  return date.toISOString().slice(0, 10);
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
    setTanggalMulai(new Date().toISOString().slice(0, 10));
  }, [opened]);

  async function handleSubmit() {
    if (!selectedTiket || !nomorTiket || !tanggalMulai || !tanggalBerakhir) {
      return;
    }

    const success = await onSubmit({
      nomorTiket,
      namaPelanggan: selectedTiket.namaPelanggan,
      perangkat: selectedTiket.perangkat,
      periodeHari: Number(periodeHari || 0),
      tanggalMulai,
      tanggalBerakhir,
    });

    if (success) {
      onClose();
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="58rem"
      radius="xl"
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
        <Stack gap={20}>
          <Stack gap={6}>
            <FieldLabel label="No Tiket" required />
            <Select
              value={nomorTiket}
              onChange={setNomorTiket}
              data={tiketOptions}
              searchable
              placeholder="Pilih tiket servis yang sudah selesai"
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
                onChange={setPeriodeHari}
                min={1}
                allowDecimal={false}
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
              <FieldLabel label="Tanggal Mulai" required />
              <TextInput
                type="date"
                value={tanggalMulai}
                onChange={(event) => setTanggalMulai(event.currentTarget.value)}
                rightSection={<IconCalendarMonth size={20} color="#8E8E8E" />}
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
              <FieldLabel label="Tanggal Berakhir" required />
              <TextInput
                type="date"
                value={tanggalBerakhir}
                readOnly
                rightSection={<IconCalendarMonth size={20} color="#8E8E8E" />}
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
          </SimpleGrid>

          <Group justify="flex-end" gap="lg" mt="lg">
            <Button
              radius="xl"
              onClick={onClose}
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
              radius="xl"
              loading={isSubmitting}
              onClick={handleSubmit}
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
      </Box>
    </Modal>
  );
}