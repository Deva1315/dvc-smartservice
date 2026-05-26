"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Group,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import type { FormType } from "@/types/form-types";
import { dropPointFormSchema, validateWithZod } from "@/lib/validations";

export type DropPointFormInitialData = {
  id?: string;
  nama_drop_point: string;
  alamat: string;
  phone: string | null;
  jam_operasional: string | null;
};

export type DropPointFormPayload = {
  nama_drop_point: string;
  alamat: string;
  phone: string | null;
  jam_operasional: string | null;
};

type FormState = {
  nama_drop_point: string;
  alamat: string;
  phone: string;
  jam_operasional: string;
};

const initialForm: FormState = {
  nama_drop_point: "",
  alamat: "",
  phone: "",
  jam_operasional: "",
};

interface DropPointFormModalProps {
  opened: boolean;
  onClose: () => void;
  formType: FormType;
  initialData?: DropPointFormInitialData | null;
  onSubmit: (
    payload: DropPointFormPayload,
    formType: FormType
  ) => Promise<boolean>;
}

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

function getModalTitle(formType: FormType) {
  return formType === "create" ? "Tambah Drop Point" : "Edit Drop Point";
}

function getSubmitLabel(formType: FormType) {
  return formType === "create" ? "Simpan Drop Point" : "Update Drop Point";
}

export default function DropPointFormModal({
  opened,
  onClose,
  formType,
  initialData = null,
  onSubmit,
}: DropPointFormModalProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!opened) {
      return;
    }

    setErrors({});

    if (formType === "edit" && initialData) {
      setForm({
        nama_drop_point: initialData.nama_drop_point,
        alamat: initialData.alamat,
        phone: initialData.phone ?? "",
        jam_operasional: initialData.jam_operasional ?? "",
      });
      return;
    }

    setForm(initialForm);
  }, [opened, formType, initialData]);

  function clearFieldError(field: string) {
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  }

  function handleChange<K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    clearFieldError(key);
  }

  function handleReset() {
    setErrors({});

    if (formType === "edit" && initialData) {
      setForm({
        nama_drop_point: initialData.nama_drop_point,
        alamat: initialData.alamat,
        phone: initialData.phone ?? "",
        jam_operasional: initialData.jam_operasional ?? "",
      });
      return;
    }

    setForm(initialForm);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = validateWithZod(dropPointFormSchema, form);

    if (!parsed.success) {
      setErrors(parsed.errors);
      return;
    }

    setErrors({});

    const payload: DropPointFormPayload = {
      nama_drop_point: parsed.data.nama_drop_point,
      alamat: parsed.data.alamat,
      phone: parsed.data.phone ?? null,
      jam_operasional: parsed.data.jam_operasional ?? null,
    };

    try {
      setIsSubmitting(true);

      const success = await onSubmit(payload, formType);

      if (!success) {
        return;
      }

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  const modalTitle = getModalTitle(formType);
  const submitLabel = getSubmitLabel(formType);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="60rem"
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
                      Informasi Drop Point
                    </Text>

                    <Text fz="sm" c="#6B7280">
                      Lengkapi nama, nomor telepon, jam operasional, dan alamat
                      Drop Point untuk kebutuhan penerimaan perangkat servis.
                    </Text>
                  </Stack>

                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                    <Stack gap={6}>
                      <FieldLabel label="Nama Drop Point" required />

                      <TextInput
                        value={form.nama_drop_point}
                        onChange={(event) =>
                          handleChange(
                            "nama_drop_point",
                            event.currentTarget.value
                          )
                        }
                        placeholder="Contoh: Drop Point Sukawati"
                        radius="md"
                        disabled={isSubmitting}
                        error={errors.nama_drop_point}
                        styles={{
                          input: {
                            ...inputBaseStyle,
                            border: errors.nama_drop_point
                              ? "1px solid #FA5252"
                              : "1px solid #E5E7EB",
                          },
                          error: errorStyle,
                        }}
                      />
                    </Stack>

                    <Stack gap={6}>
                      <FieldLabel label="No HP" />

                      <TextInput
                        value={form.phone}
                        onChange={(event) =>
                          handleChange("phone", event.currentTarget.value)
                        }
                        placeholder="Contoh: 081234567890"
                        radius="md"
                        disabled={isSubmitting}
                        error={errors.phone}
                        styles={{
                          input: {
                            ...inputBaseStyle,
                            border: errors.phone
                              ? "1px solid #FA5252"
                              : "1px solid #E5E7EB",
                          },
                          error: errorStyle,
                        }}
                      />
                    </Stack>

                    <Stack gap={6}>
                      <FieldLabel label="Jam Operasional" />

                      <TextInput
                        value={form.jam_operasional}
                        onChange={(event) =>
                          handleChange(
                            "jam_operasional",
                            event.currentTarget.value
                          )
                        }
                        placeholder="Contoh: 09.00 - 17.00"
                        radius="md"
                        disabled={isSubmitting}
                        error={errors.jam_operasional}
                        styles={{
                          input: {
                            ...inputBaseStyle,
                            border: errors.jam_operasional
                              ? "1px solid #FA5252"
                              : "1px solid #E5E7EB",
                          },
                          error: errorStyle,
                        }}
                      />
                    </Stack>
                  </SimpleGrid>

                  <Stack gap={6}>
                    <FieldLabel label="Alamat" required />

                    <Textarea
                      value={form.alamat}
                      onChange={(event) =>
                        handleChange("alamat", event.currentTarget.value)
                      }
                      placeholder="Masukkan alamat lengkap Drop Point..."
                      minRows={6}
                      radius="md"
                      disabled={isSubmitting}
                      error={errors.alamat}
                      styles={{
                        input: {
                          backgroundColor: "#F9FAFB",
                          border: errors.alamat
                            ? "1px solid #FA5252"
                            : "1px solid #E5E7EB",
                          fontSize: 15,
                          color: "#111827",
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
                  onClick={() => {
                    handleReset();
                    onClose();
                  }}
                  radius="md"
                  size="md"
                  variant="outline"
                  color="gray"
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
                    minWidth: 170,
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