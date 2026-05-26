/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import type { FormType } from "@/types/form-types";
import {
  kategoriBarangFormSchema,
  validateWithZod,
} from "@/lib/validations";

export type KategoriBarangFormInitialData = {
  id: string;
  nama: string;
  deskripsi: string | null;
};

export type KategoriBarangFormPayload = {
  nama: string;
  deskripsi: string | null;
};

type KategoriBarangFormModalProps = {
  opened: boolean;
  onClose: () => void;
  formType: FormType;
  initialData: KategoriBarangFormInitialData | null;
  onSubmit: (
    payload: KategoriBarangFormPayload,
    formType: FormType
  ) => Promise<boolean>;
  isSubmitting?: boolean;
};

type KategoriBarangFormState = {
  nama: string;
  deskripsi: string;
};

const initialFormState: KategoriBarangFormState = {
  nama: "",
  deskripsi: "",
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
  return formType === "create"
    ? "Kelola Kategori Barang"
    : "Edit Kategori Barang";
}

function getSubmitLabel(formType: FormType) {
  return formType === "create" ? "Simpan Kategori" : "Update Kategori";
}

export default function KategoriBarangFormModal({
  opened,
  onClose,
  formType,
  initialData,
  onSubmit,
  isSubmitting = false,
}: KategoriBarangFormModalProps) {
  const [form, setForm] = useState<KategoriBarangFormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!opened) {
      return;
    }

    if (formType === "edit" && initialData) {
      setForm({
        nama: initialData.nama,
        deskripsi: initialData.deskripsi ?? "",
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

  function handleChange<K extends keyof KategoriBarangFormState>(
    key: K,
    value: KategoriBarangFormState[K]
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
    const parsed = validateWithZod(kategoriBarangFormSchema, form);

    if (!parsed.success) {
      setErrors(parsed.errors);
      return null;
    }

    setErrors({});
    return parsed.data;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validated = validate();

    if (!validated) {
      return;
    }

    const success = await onSubmit(
      {
        nama: validated.nama,
        deskripsi: validated.deskripsi ?? null,
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
      size="52rem"
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
                      Informasi Kategori
                    </Text>

                    <Text fz="sm" c="#6B7280">
                      Lengkapi nama kategori dan deskripsi singkat untuk
                      pengelompokan barang.
                    </Text>
                  </Stack>

                  <Stack gap={6}>
                    <FieldLabel label="Nama Kategori" required />

                    <TextInput
                      value={form.nama}
                      onChange={(event) =>
                        handleChange("nama", event.currentTarget.value)
                      }
                      placeholder="Contoh: Laptop, Printer, Aksesoris"
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
                    <FieldLabel label="Deskripsi" />

                    <Textarea
                      value={form.deskripsi}
                      onChange={(event) =>
                        handleChange("deskripsi", event.currentTarget.value)
                      }
                      placeholder="Masukkan deskripsi kategori barang..."
                      minRows={6}
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
                    minWidth: 160,
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