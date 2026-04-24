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

export default function DropPointFormModal({
  opened,
  onClose,
  formType,
  initialData = null,
  onSubmit,
}: DropPointFormModalProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!opened) return;

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

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReset = () => {
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
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.nama_drop_point.trim() || !form.alamat.trim()) {
      alert("Nama drop point dan alamat wajib diisi.");
      return;
    }

    const payload: DropPointFormPayload = {
      nama_drop_point: form.nama_drop_point.trim(),
      alamat: form.alamat.trim(),
      phone: form.phone.trim() ? form.phone.trim() : null,
      jam_operasional: form.jam_operasional.trim()
        ? form.jam_operasional.trim()
        : null,
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
    formType === "create" ? "Tambah Drop Point" : "Edit Drop Point";

  const submitLabel = formType === "create" ? "Simpan" : "Update";

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
          <Stack gap={24}>
            <Stack gap={8}>
              <Text fw={700} c="#6B7280" size="lg">
                Nama Drop Point <span style={{ color: "red" }}>*</span>
              </Text>
              <TextInput
                value={form.nama_drop_point}
                onChange={(event) =>
                  handleChange("nama_drop_point", event.currentTarget.value)
                }
                radius="md"
                disabled={isSubmitting}
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
              <Text fw={700} c="#6B7280" size="lg">
                Alamat <span style={{ color: "red" }}>*</span>
              </Text>
              <Textarea
                value={form.alamat}
                onChange={(event) =>
                  handleChange("alamat", event.currentTarget.value)
                }
                minRows={4}
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

            <Stack gap={8}>
              <Text fw={700} c="#6B7280" size="lg">
                Phone
              </Text>
              <TextInput
                value={form.phone}
                onChange={(event) =>
                  handleChange("phone", event.currentTarget.value)
                }
                radius="md"
                disabled={isSubmitting}
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
              <Text fw={700} c="#6B7280" size="lg">
                Jam Operasional
              </Text>
              <Textarea
                value={form.jam_operasional}
                onChange={(event) =>
                  handleChange("jam_operasional", event.currentTarget.value)
                }
                placeholder={"Contoh:\nSen-Jum: 08:00-17:00\nSab: 08:00-14:00"}
                minRows={4}
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