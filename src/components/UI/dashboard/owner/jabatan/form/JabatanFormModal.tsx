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
} from "@mantine/core";
import type { FormType } from "@/types/form-types";
import { jabatanFormSchema, validateWithZod } from "@/lib/validations";

export type JabatanFormInitialData = {
  id?: string;
  nama_roles: string;
};

export type JabatanFormPayload = {
  nama_roles: string;
};

type FormState = {
  nama_roles: string;
};

const initialForm: FormState = {
  nama_roles: "",
};

interface JabatanFormModalProps {
  opened: boolean;
  onClose: () => void;
  formType: FormType;
  initialData?: JabatanFormInitialData | null;
  onSubmit: (
    payload: JabatanFormPayload,
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
  return formType === "create" ? "Tambah Jabatan" : "Edit Jabatan";
}

function getSubmitLabel(formType: FormType) {
  return formType === "create" ? "Simpan Jabatan" : "Update Jabatan";
}

export default function JabatanFormModal({
  opened,
  onClose,
  formType,
  initialData = null,
  onSubmit,
}: JabatanFormModalProps) {
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
        nama_roles: initialData.nama_roles,
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
        nama_roles: initialData.nama_roles,
      });
      return;
    }

    setForm(initialForm);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = validateWithZod(jabatanFormSchema, form);

    if (!parsed.success) {
      setErrors(parsed.errors);
      return;
    }

    setErrors({});

    const payload: JabatanFormPayload = {
      nama_roles: parsed.data.nama_roles,
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
      size="46rem"
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
                      Informasi Jabatan
                    </Text>

                    <Text fz="sm" c="#6B7280">
                      Lengkapi nama jabatan yang akan digunakan untuk pembagian
                      role dan hak akses pegawai.
                    </Text>
                  </Stack>

                  <Stack gap={6}>
                    <FieldLabel label="Nama Jabatan" required />

                    <TextInput
                      value={form.nama_roles}
                      onChange={(event) =>
                        handleChange("nama_roles", event.currentTarget.value)
                      }
                      placeholder="Contoh: Admin Penjualan"
                      radius="md"
                      disabled={isSubmitting}
                      error={errors.nama_roles}
                      styles={{
                        input: {
                          ...inputBaseStyle,
                          border: errors.nama_roles
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