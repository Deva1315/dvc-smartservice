/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import type { FormType } from "@/types/form-types";

export type JasaServisFormInitialData = {
  id?: string;
  slug?: string;
  nama: string;
  harga: number;
  deskripsi: string | null;
  jamOperasional: string;
};

export type JasaServisFormPayload = {
  nama: string;
  harga: number;
  deskripsi: string | null;
  jamOperasional: string;
};

type JasaServisFormModalProps = {
  opened: boolean;
  onClose: () => void;
  formType: FormType;
  initialData: JasaServisFormInitialData | null;
  onSubmit: (
    payload: JasaServisFormPayload,
    formType: FormType
  ) => Promise<boolean> | boolean;
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
    <Text fw={700} fz={16} c="#6B7280">
      {label}
      {required && (
        <Text span c="red" ml={2}>
          *
        </Text>
      )}
    </Text>
  );
}

export default function JasaServisFormModal({
  opened,
  onClose,
  formType,
  initialData,
  onSubmit,
  isSubmitting = false,
}: JasaServisFormModalProps) {
  const [nama, setNama] = useState("");
  const [harga, setHarga] = useState<number | string>("");
  const [deskripsi, setDeskripsi] = useState("");
  const [jamOperasional, setJamOperasional] = useState("");

  useEffect(() => {
    if (!opened) return;

    if (formType === "edit" && initialData) {
      setNama(initialData.nama);
      setHarga(initialData.harga);
      setDeskripsi(initialData.deskripsi || "");
      setJamOperasional(initialData.jamOperasional);
      return;
    }

    setNama("");
    setHarga("");
    setDeskripsi("");
    setJamOperasional("");
  }, [opened, formType, initialData]);

  async function handleSubmit() {
    const success = await onSubmit(
      {
        nama,
        harga: typeof harga === "number" ? harga : Number(harga || 0),
        deskripsi: deskripsi.trim() || null,
        jamOperasional,
      },
      formType
    );

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
        <Text fw={800} fz={34} c="#000000">
          Kelola Jasa Servis
        </Text>
      }
    >
      <Box px="lg" pb="lg" pt="md">
        <Stack gap={16}>
          <Stack gap={6}>
            <FieldLabel label="Nama" required />
            <TextInput
              value={nama}
              onChange={(event) => setNama(event.currentTarget.value)}
              radius="md"
              styles={{
                input: {
                  height: 58,
                  border: "none",
                  backgroundColor: "#FFFFFF",
                  fontSize: 18,
                },
              }}
            />
          </Stack>

          <Stack gap={6}>
            <FieldLabel label="Harga" required />
            <NumberInput
              value={harga}
              onChange={setHarga}
              min={0}
              allowDecimal={false}
              thousandSeparator="."
              decimalSeparator=","
              radius="md"
              styles={{
                input: {
                  height: 58,
                  border: "none",
                  backgroundColor: "#FFFFFF",
                  fontSize: 18,
                },
              }}
            />
          </Stack>

          <Stack gap={6}>
            <FieldLabel label="Deskripsi" />
            <Textarea
              value={deskripsi}
              onChange={(event) => setDeskripsi(event.currentTarget.value)}
              placeholder="Masukkan deskripsi jasa disini..."
              minRows={6}
              radius="md"
              styles={{
                input: {
                  border: "none",
                  backgroundColor: "#FFFFFF",
                  fontSize: 18,
                },
              }}
            />
          </Stack>

          <Stack gap={6}>
            <FieldLabel label="Jam Operasional" required />
            <TextInput
              value={jamOperasional}
              onChange={(event) => setJamOperasional(event.currentTarget.value)}
              placeholder="Contoh: 09:00 - 17:00"
              radius="md"
              styles={{
                input: {
                  height: 58,
                  border: "none",
                  backgroundColor: "#FFFFFF",
                  fontSize: 18,
                },
              }}
            />
          </Stack>

          <Group justify="flex-end" gap="lg" mt="lg">
            <Button
              radius="xl"
              onClick={onClose}
              style={{
                minWidth: 160,
                height: 42,
                backgroundColor: "#FF1008",
                fontSize: 18,
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
                minWidth: 160,
                height: 42,
                backgroundColor: "#0D4CB5",
                fontSize: 18,
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