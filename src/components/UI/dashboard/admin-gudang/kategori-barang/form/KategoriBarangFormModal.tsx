/* eslint-disable react-hooks/set-state-in-effect */
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
  Textarea,
} from "@mantine/core";
import type { FormType } from "@/types/form-types";
import FormFieldLabel from "@/components/UI/common/form/FormFieldLabel";
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

function getModalTitle(formType: FormType) {
  return formType === "create"
    ? "Kelola Kategori Barang"
    : "Edit Kategori Barang";
}

function getSubmitLabel(formType: FormType) {
  return formType === "create" ? "Simpan" : "Update";
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
    if (!opened) return;

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
      size="70rem"
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
              <FormFieldLabel label="Nama" required size="lg" color="#6B7280" />

              <TextInput
                value={form.nama}
                onChange={(event) =>
                  handleChange("nama", event.currentTarget.value)
                }
                radius="md"
                disabled={isSubmitting}
                error={errors.nama}
                styles={{
                  input: {
                    backgroundColor: "#FFFFFF",
                    border: errors.nama ? "1px solid #FA5252" : "none",
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

            <Stack gap={8}>
              <FormFieldLabel label="Deskripsi" size="lg" color="#6B7280" />

              <Textarea
                value={form.deskripsi}
                onChange={(event) =>
                  handleChange("deskripsi", event.currentTarget.value)
                }
                placeholder="Masukkan Deskripsi Kategori Disini..."
                minRows={10}
                radius="md"
                disabled={isSubmitting}
                error={errors.deskripsi}
                styles={{
                  input: {
                    backgroundColor: "#FFFFFF",
                    border: errors.deskripsi ? "1px solid #FA5252" : "none",
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
                  minWidth: 160,
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
                  minWidth: 160,
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