/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, type FormEvent } from "react";
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
import { jasaServisFormSchema, validateWithZod } from "@/lib/validations";

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!opened) return;

    setErrors({});

    if (formType === "edit" && initialData) {
      setNama(initialData.nama);
      setHarga(initialData.harga);
      setDeskripsi(initialData.deskripsi || "");
      setJamOperasional(initialData.jamOperasional || "");
      return;
    }

    setNama("");
    setHarga("");
    setDeskripsi("");
    setJamOperasional("");
  }, [opened, formType, initialData]);

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

    const parsed = validateWithZod(jasaServisFormSchema, {
      nama,
      harga,
      deskripsi,
      jamOperasional,
    });

    if (!parsed.success) {
      setErrors(parsed.errors);
      return;
    }

    setErrors({});

    const success = await onSubmit(
      {
        nama: parsed.data.nama,
        harga: parsed.data.harga,
        deskripsi: parsed.data.deskripsi ?? null,
        jamOperasional: parsed.data.jamOperasional ?? "",
      },
      formType
    );

    if (success) {
      handleClose();
    }
  }

  const modalTitle =
    formType === "create" ? "Kelola Jasa Servis" : "Edit Jasa Servis";

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
        <Text fw={800} fz={34} c="#000000">
          {modalTitle}
        </Text>
      }
    >
      <Box px="lg" pb="lg" pt="md">
        <form onSubmit={handleSubmit}>
          <Stack gap={16}>
            <Stack gap={6}>
              <FieldLabel label="Nama" required />

              <TextInput
                value={nama}
                onChange={(event) => {
                  setNama(event.currentTarget.value);
                  clearFieldError("nama");
                }}
                radius="md"
                disabled={isSubmitting}
                error={errors.nama}
                styles={{
                  input: {
                    height: 58,
                    border: errors.nama ? "1px solid #FA5252" : "none",
                    backgroundColor: "#FFFFFF",
                    fontSize: 18,
                  },
                  error: {
                    fontSize: 14,
                    marginTop: 6,
                  },
                }}
              />
            </Stack>

            <Stack gap={6}>
              <FieldLabel label="Harga" required />

              <NumberInput
                value={harga}
                onChange={(value) => {
                  setHarga(value);
                  clearFieldError("harga");
                }}
                min={0}
                allowDecimal={false}
                thousandSeparator="."
                decimalSeparator=","
                radius="md"
                disabled={isSubmitting}
                error={errors.harga}
                styles={{
                  input: {
                    height: 58,
                    border: errors.harga ? "1px solid #FA5252" : "none",
                    backgroundColor: "#FFFFFF",
                    fontSize: 18,
                  },
                  error: {
                    fontSize: 14,
                    marginTop: 6,
                  },
                }}
              />
            </Stack>

            <Stack gap={6}>
              <FieldLabel label="Deskripsi" />

              <Textarea
                value={deskripsi}
                onChange={(event) => {
                  setDeskripsi(event.currentTarget.value);
                  clearFieldError("deskripsi");
                }}
                placeholder="Masukkan deskripsi jasa disini..."
                minRows={6}
                radius="md"
                disabled={isSubmitting}
                error={errors.deskripsi}
                styles={{
                  input: {
                    border: errors.deskripsi ? "1px solid #FA5252" : "none",
                    backgroundColor: "#FFFFFF",
                    fontSize: 18,
                  },
                  error: {
                    fontSize: 14,
                    marginTop: 6,
                  },
                }}
              />
            </Stack>

            <Stack gap={6}>
              <FieldLabel label="Jam Operasional" />

              <TextInput
                value={jamOperasional}
                onChange={(event) => {
                  setJamOperasional(event.currentTarget.value);
                  clearFieldError("jamOperasional");
                }}
                placeholder="Contoh: 09:00 - 17:00"
                radius="md"
                disabled={isSubmitting}
                error={errors.jamOperasional}
                styles={{
                  input: {
                    height: 58,
                    border: errors.jamOperasional
                      ? "1px solid #FA5252"
                      : "none",
                    backgroundColor: "#FFFFFF",
                    fontSize: 18,
                  },
                  error: {
                    fontSize: 14,
                    marginTop: 6,
                  },
                }}
              />
            </Stack>

            <Group justify="flex-end" gap="lg" mt="lg">
              <Button
                type="button"
                radius="xl"
                onClick={handleClose}
                disabled={isSubmitting}
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
                type="submit"
                radius="xl"
                loading={isSubmitting}
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
        </form>
      </Box>
    </Modal>
  );
}