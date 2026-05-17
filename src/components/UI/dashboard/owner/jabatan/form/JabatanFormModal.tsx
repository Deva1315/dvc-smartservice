"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Group,
  Modal,
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
    if (!opened) return;

    setErrors({});

    if (formType === "edit" && initialData) {
      setForm({
        nama_roles: initialData.nama_roles,
      });
      return;
    }

    setForm(initialForm);
  }, [opened, formType, initialData]);

  const clearFieldError = (field: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleChange = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    clearFieldError(key);
  };

  const handleReset = () => {
    setErrors({});

    if (formType === "edit" && initialData) {
      setForm({
        nama_roles: initialData.nama_roles,
      });
      return;
    }

    setForm(initialForm);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
  };

  const modalTitle =
    formType === "create" ? "Tambah Jabatan" : "Edit Jabatan";

  const submitLabel = formType === "create" ? "Simpan" : "Update";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="42rem"
      radius="xl"
      closeOnClickOutside={!isSubmitting}
      closeButtonProps={{
        size: "lg",
        radius: "xl",
      }}
      styles={{
        body: {
          padding: 0,
          backgroundColor: "#D9D9D9",
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
        <Text fw={800} fz={26} c="#000000">
          {modalTitle}
        </Text>
      }
    >
      <Box
        p="lg"
        bg="#D9D9D9"
        style={{
          border: "1px solid #D9D9D9",
          borderRadius: 16,
        }}
      >
        <form onSubmit={handleSubmit}>
          <Stack gap={28}>
            <Stack gap={8}>
              <Text fw={700} c="#6B7280" size="lg">
                Nama Jabatan <span style={{ color: "red" }}>*</span>
              </Text>

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
                    backgroundColor: "#FFFFFF",
                    border: errors.nama_roles ? "1px solid #FA5252" : "none",
                    height: 58,
                    fontSize: 18,
                    color: "#111111",
                  },
                  error: {
                    fontSize: 14,
                    marginTop: 6,
                  },
                }}
              />
            </Stack>

            <Group justify="flex-end" mt={8} gap="lg">
              <Button
                type="button"
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                radius="xl"
                disabled={isSubmitting}
                style={{
                  minWidth: 140,
                  height: 46,
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
                  minWidth: 140,
                  height: 46,
                  backgroundColor: "#0D4CB5",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {submitLabel}
              </Button>
            </Group>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
}