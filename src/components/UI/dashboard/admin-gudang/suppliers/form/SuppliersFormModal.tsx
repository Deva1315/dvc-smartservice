/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, type FormEvent } from "react";
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
import { suppliersFormSchema, validateWithZod } from "@/lib/validations";

export type SuppliersFormInitialData = {
  id: string;
  nama: string;
  address: string | null;
  phone: string | null;
};

export type SuppliersFormPayload = {
  nama: string;
  address: string | null;
  phone: string | null;
};

type SuppliersFormModalProps = {
  opened: boolean;
  onClose: () => void;
  formType: FormType;
  initialData: SuppliersFormInitialData | null;
  onSubmit: (
    payload: SuppliersFormPayload,
    formType: FormType
  ) => Promise<boolean>;
  isSubmitting?: boolean;
};

type SuppliersFormState = {
  nama: string;
  address: string;
  phone: string;
};

const initialFormState: SuppliersFormState = {
  nama: "",
  address: "",
  phone: "",
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

function getModalTitle(formType: FormType) {
  return formType === "create" ? "Kelola Supplier" : "Edit Supplier";
}

function getSubmitLabel(formType: FormType) {
  return formType === "create" ? "Simpan Supplier" : "Update Supplier";
}

export default function SuppliersFormModal({
  opened,
  onClose,
  formType,
  initialData,
  onSubmit,
  isSubmitting = false,
}: SuppliersFormModalProps) {
  const [form, setForm] = useState<SuppliersFormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!opened) {
      return;
    }

    if (formType === "edit" && initialData) {
      setForm({
        nama: initialData.nama,
        address: initialData.address ?? "",
        phone: initialData.phone ?? "",
      });
      setErrors({});
      return;
    }

    setForm(initialFormState);
    setErrors({});
  }, [opened, formType, initialData]);

  function clearFieldError(field: string) {
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  }

  function handleChange<K extends keyof SuppliersFormState>(
    key: K,
    value: SuppliersFormState[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    clearFieldError(key);
  }

  function handleReset() {
    setForm(initialFormState);
    setErrors({});
  }

  function validate() {
    const parsed = validateWithZod(suppliersFormSchema, form);

    if (!parsed.success) {
      setErrors(parsed.errors);
      return null;
    }

    setErrors({});
    return parsed.data;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validated = validate();

    if (!validated) {
      return;
    }

    const success = await onSubmit(
      {
        nama: validated.nama,
        address: validated.address ?? null,
        phone: validated.phone ?? null,
      },
      formType
    );

    if (!success) {
      return;
    }

    onClose();
  }

  const modalTitle = getModalTitle(formType);
  const submitLabel = getSubmitLabel(formType);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
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
                      Informasi Supplier
                    </Text>

                    <Text fz="sm" c="#6B7280">
                      Lengkapi nama supplier, nomor telepon, dan alamat untuk
                      kebutuhan pengelolaan barang.
                    </Text>
                  </Stack>

                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                    <Stack gap={6}>
                      <FieldLabel label="Nama Supplier" required />

                      <TextInput
                        value={form.nama}
                        onChange={(event) =>
                          handleChange("nama", event.currentTarget.value)
                        }
                        placeholder="Contoh: PT Sumber Komputer"
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
                  </SimpleGrid>

                  <Stack gap={6}>
                    <FieldLabel label="Alamat" />

                    <Textarea
                      value={form.address}
                      onChange={(event) =>
                        handleChange("address", event.currentTarget.value)
                      }
                      placeholder="Masukkan alamat supplier..."
                      minRows={6}
                      radius="md"
                      disabled={isSubmitting}
                      error={errors.address}
                      styles={{
                        input: {
                          backgroundColor: "#F9FAFB",
                          border: errors.address
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