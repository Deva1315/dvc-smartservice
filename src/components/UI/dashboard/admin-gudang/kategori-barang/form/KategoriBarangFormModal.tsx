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

function Label({
  text,
  required = false,
}: {
  text: string;
  required?: boolean;
}) {
  return (
    <Text fw={700} c="#6B7280" size="lg">
      {text} {required ? <span style={{ color: "red" }}>*</span> : null}
    </Text>
  );
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

  function handleChange<K extends keyof KategoriBarangFormState>(
    key: K,
    value: KategoriBarangFormState[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function handleReset() {
    setForm(initialFormState);
    setErrors({});
  }

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (!form.nama.trim()) {
      nextErrors.nama = "Nama wajib diisi";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const success = await onSubmit(
      {
        nama: form.nama.trim(),
        deskripsi: form.deskripsi.trim() ? form.deskripsi.trim() : null,
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
              <Label text="Nama" required />
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
                    border: "none",
                    height: 58,
                    fontSize: 18,
                    color: "#111111",
                  },
                }}
              />
            </Stack>

            <Stack gap={8}>
              <Label text="Deskripsi" />
              <Textarea
                value={form.deskripsi}
                onChange={(event) =>
                  handleChange("deskripsi", event.currentTarget.value)
                }
                placeholder="Masukkan Deskripsi Kategori Disini..."
                minRows={10}
                radius="md"
                disabled={isSubmitting}
                styles={{
                  input: {
                    backgroundColor: "#FFFFFF",
                    border: "none",
                    fontSize: 18,
                    color: "#111111",
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