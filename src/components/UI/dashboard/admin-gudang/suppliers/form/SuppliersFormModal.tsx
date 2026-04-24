/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, type FormEvent } from "react";
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

export type SuppliersFormInitialData = {
  id: string;
  nama: string;
  address: string | null;
  phone: string;
};

export type SuppliersFormPayload = {
  nama: string;
  address: string | null;
  phone: string;
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

function getModalTitle(formType: FormType) {
  return formType === "create" ? "Kelola Suppliers" : "Edit Suppliers";
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
    if (!opened) return;

    if (formType === "edit" && initialData) {
      setForm({
        nama: initialData.nama,
        address: initialData.address ?? "",
        phone: initialData.phone,
      });
      setErrors({});
      return;
    }

    setForm(initialFormState);
    setErrors({});
  }, [opened, formType, initialData]);

  function handleChange<K extends keyof SuppliersFormState>(
    key: K,
    value: SuppliersFormState[K]
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

    if (!form.nama.trim()) nextErrors.nama = "Nama wajib diisi";
    if (!form.phone.trim()) nextErrors.phone = "No HP wajib diisi";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const success = await onSubmit(
      {
        nama: form.nama.trim(),
        address: form.address.trim() ? form.address.trim() : null,
        phone: form.phone.trim(),
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
              <Label text="No HP" required />
              <TextInput
                value={form.phone}
                onChange={(event) =>
                  handleChange("phone", event.currentTarget.value)
                }
                radius="md"
                disabled={isSubmitting}
                error={errors.phone}
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
              <Label text="Alamat" />
              <Textarea
                value={form.address}
                onChange={(event) =>
                  handleChange("address", event.currentTarget.value)
                }
                placeholder="Masukkan Alamat Disini..."
                minRows={8}
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