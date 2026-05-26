/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Box,
  Button,
  Group,
  Modal,
  NumberInput,
  Paper,
  SimpleGrid,
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

const errorStyle = {
  fontSize: 13,
  marginTop: 6,
};

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
    if (!opened) {
      return;
    }

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

  const submitLabel = formType === "create" ? "Simpan Jasa" : "Update Jasa";

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
      title={modalTitle}
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
                      Informasi Jasa Servis
                    </Text>

                    <Text fz="sm" c="#6B7280">
                      Lengkapi nama jasa, harga, deskripsi, dan jam operasional
                      layanan servis.
                    </Text>
                  </Stack>

                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                    <Stack gap={6}>
                      <FieldLabel label="Nama Jasa" required />

                      <TextInput
                        value={nama}
                        onChange={(event) => {
                          setNama(event.currentTarget.value);
                          clearFieldError("nama");
                        }}
                        placeholder="Contoh: Instalasi Windows"
                        radius="md"
                        disabled={isSubmitting}
                        error={errors.nama}
                        styles={{
                          input: {
                            ...inputBaseStyle,
                            border: errors.nama
                              ? "1px solid #FA5252"
                              : "1px solid #E5E7EB",
                          },
                          error: errorStyle,
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
                        prefix="Rp "
                        placeholder="Contoh: Rp 150.000"
                        radius="md"
                        disabled={isSubmitting}
                        error={errors.harga}
                        styles={{
                          input: {
                            ...inputBaseStyle,
                            border: errors.harga
                              ? "1px solid #FA5252"
                              : "1px solid #E5E7EB",
                          },
                          error: errorStyle,
                        }}
                      />
                    </Stack>
                  </SimpleGrid>

                  <Stack gap={6}>
                    <FieldLabel label="Deskripsi" />

                    <Textarea
                      value={deskripsi}
                      onChange={(event) => {
                        setDeskripsi(event.currentTarget.value);
                        clearFieldError("deskripsi");
                      }}
                      placeholder="Masukkan deskripsi jasa servis, cakupan pekerjaan, atau catatan layanan..."
                      minRows={5}
                      radius="md"
                      disabled={isSubmitting}
                      error={errors.deskripsi}
                      styles={{
                        input: {
                          backgroundColor: "#F9FAFB",
                          border: errors.deskripsi
                            ? "1px solid #FA5252"
                            : "1px solid #E5E7EB",
                          fontSize: 15,
                          color: "#111827",
                        },
                        error: errorStyle,
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
                          ...inputBaseStyle,
                          border: errors.jamOperasional
                            ? "1px solid #FA5252"
                            : "1px solid #E5E7EB",
                        },
                        error: errorStyle,
                      }}
                    />
                  </Stack>
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
                  {submitLabel}
                </Button>
              </Group>
            </Stack>
          </form>
        </Box>
      </Box>
    </Modal>
  );
}