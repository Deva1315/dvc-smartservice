/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Group,
  Modal,
  PasswordInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import type { FormType } from "@/types/form-types";

export type PegawaiRoleOption = {
  value: string;
  label: string;
};

export type PegawaiFormInitialData = {
  id?: string;
  nama: string;
  email: string;
  phone: string;
  address: string | null;
  id_roles: string;
  photo_profile_path: string | null;
};

export type PegawaiFormPayload = {
  nama: string;
  email: string;
  password: string | null;
  phone: string;
  address: string | null;
  id_roles: string;
  photoFile: File | null;
  photoPreviewUrl: string | null;
  removePhoto: boolean;
};

type FormState = {
  nama: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  id_roles: string | null;
  photoFile: File | null;
  photoPreviewUrl: string | null;
  removePhoto: boolean;
};

const initialForm: FormState = {
  nama: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  id_roles: null,
  photoFile: null,
  photoPreviewUrl: null,
  removePhoto: false,
};

interface PegawaiFormModalProps {
  opened: boolean;
  onClose: () => void;
  formType: FormType;
  roleOptions: PegawaiRoleOption[];
  initialData?: PegawaiFormInitialData | null;
  onSubmit: (payload: PegawaiFormPayload, formType: FormType) => Promise<boolean>;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Gagal membaca file"));
    };

    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

export default function PegawaiFormModal({
  opened,
  onClose,
  formType,
  roleOptions,
  initialData = null,
  onSubmit,
}: PegawaiFormModalProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!opened) return;

    if (formType === "edit" && initialData) {
      setForm({
        nama: initialData.nama,
        email: initialData.email,
        password: "",
        phone: initialData.phone,
        address: initialData.address ?? "",
        id_roles: initialData.id_roles,
        photoFile: null,
        photoPreviewUrl: initialData.photo_profile_path ?? null,
        removePhoto: false,
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
        nama: initialData.nama,
        email: initialData.email,
        password: "",
        phone: initialData.phone,
        address: initialData.address ?? "",
        id_roles: initialData.id_roles,
        photoFile: null,
        photoPreviewUrl: initialData.photo_profile_path ?? null,
        removePhoto: false,
      });
      return;
    }

    setForm(initialForm);
  };

  const handleChooseImage = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({
      ...prev,
      photoFile: null,
      photoPreviewUrl: null,
      removePhoto: true,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputElement = event.currentTarget;
    const selectedFile = inputElement.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      alert("File harus berupa gambar.");
      inputElement.value = "";
      return;
    }

    try {
      const previewUrl = await fileToDataUrl(selectedFile);

      setForm((prev) => ({
        ...prev,
        photoFile: selectedFile,
        photoPreviewUrl: previewUrl,
        removePhoto: false,
      }));
    } catch {
      alert("Gagal membaca file gambar.");
      inputElement.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !form.nama.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.id_roles
    ) {
      alert("Mohon lengkapi field yang wajib diisi.");
      return;
    }

    if (formType === "create" && !form.password.trim()) {
      alert("Password wajib diisi saat menambah pegawai.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email.trim())) {
      alert("Format email tidak valid.");
      return;
    }

    const payload: PegawaiFormPayload = {
      nama: form.nama.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password.trim() ? form.password.trim() : null,
      phone: form.phone.trim(),
      address: form.address.trim() ? form.address.trim() : null,
      id_roles: form.id_roles,
      photoFile: form.photoFile,
      photoPreviewUrl: form.photoPreviewUrl,
      removePhoto: form.removePhoto,
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
    formType === "create" ? "Kelola Pegawai" : "Edit Pegawai";

  const submitLabel = formType === "create" ? "Simpan" : "Update";

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
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              <Stack gap={8}>
                <Text fw={700} c="#6B7280" size="lg">
                  Nama <span style={{ color: "red" }}>*</span>
                </Text>
                <TextInput
                  value={form.nama}
                  onChange={(event) =>
                    handleChange("nama", event.currentTarget.value)
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
                  Email <span style={{ color: "red" }}>*</span>
                </Text>
                <TextInput
                  value={form.email}
                  onChange={(event) =>
                    handleChange("email", event.currentTarget.value)
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
                  No HP <span style={{ color: "red" }}>*</span>
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
                  Password{" "}
                  <span style={{ color: "red" }}>
                    {formType === "create" ? "*" : ""}
                  </span>
                </Text>
                <PasswordInput
                  value={form.password}
                  onChange={(event) =>
                    handleChange("password", event.currentTarget.value)
                  }
                  placeholder={
                    formType === "edit"
                      ? "Kosongkan jika tidak ingin mengubah password"
                      : ""
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
                    innerInput: {
                      fontSize: 18,
                    },
                  }}
                />
              </Stack>

              <Stack gap={8} style={{ maxWidth: 360 }}>
                <Text fw={700} c="#6B7280" size="lg">
                  Jabatan <span style={{ color: "red" }}>*</span>
                </Text>
                <Select
                  value={form.id_roles}
                  onChange={(value) => handleChange("id_roles", value)}
                  data={roleOptions}
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
                    dropdown: {
                      backgroundColor: "#FFFFFF",
                    },
                    option: {
                      color: "#111111",
                      fontSize: 16,
                    },
                  }}
                />
              </Stack>
            </SimpleGrid>

            <Stack gap={8}>
              <Text fw={700} c="#6B7280" size="lg">
                Address
              </Text>
              <Textarea
                value={form.address}
                onChange={(event) =>
                  handleChange("address", event.currentTarget.value)
                }
                placeholder="Masukkan alamat disini...."
                minRows={7}
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
                Foto
              </Text>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />

              <Box
                onClick={isSubmitting ? undefined : handleChooseImage}
                style={{
                  width: "100%",
                  minHeight: 190,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  overflow: "hidden",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {form.photoPreviewUrl ? (
                  <img
                    src={form.photoPreviewUrl}
                    alt="Preview foto pegawai"
                    style={{
                      width: "100%",
                      height: 190,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <Stack align="center" gap={6}>
                    <IconPlus size={72} stroke={1.6} color="#EAEAEA" />
                    <Text c="#B0B0B0" size="sm">
                      Klik untuk upload foto profil
                    </Text>
                  </Stack>
                )}
              </Box>

              {form.photoPreviewUrl && (
                <Group justify="flex-end">
                  <Button
                    type="button"
                    variant="subtle"
                    color="red"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                  >
                    Hapus Foto
                  </Button>
                </Group>
              )}
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