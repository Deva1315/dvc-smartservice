/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Box, Button, Group, Modal, Stack } from "@mantine/core";
import { barangFormSchema, validateWithZod } from "@/lib/validations";
import {
  initialBarangFormState,
  type BarangFormModalProps,
  type BarangFormState,
} from "@/types/barang-form.types";
import {
  getBarangModalTitle,
  getBarangSubmitLabel,
} from "@/utils/admin-gudang/barang-form.helpers";
import BarangMainInfoSection from "./BarangMainInfoSection";
import BarangClassificationSection from "./BarangClassificationSection";
import BarangDescriptionPhotoSection from "./BarangDescriptionPhotoSection";

export type {
  BarangFormInitialData,
  BarangFormPayload,
} from "@/types/barang-form.types";

import {
  fileToDataUrl,
  IMAGE_UPLOAD_LIMITS,
  validateImageFile,
} from "@/utils/shared/image-upload.helpers";

export default function BarangFormModal({
  opened,
  onClose,
  formType,
  initialData,
  kategoriOptions,
  supplierOptions,
  onSubmit,
  isSubmitting = false,
}: BarangFormModalProps) {
  const [form, setForm] = useState<BarangFormState>(initialBarangFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!opened) {
      return;
    }

    if (formType === "edit" && initialData) {
      setForm({
        nama: initialData.nama,
        kode: initialData.kode,
        merk: initialData.merk,
        stok: initialData.stok,
        harga: initialData.harga,
        kategori: initialData.kategori,
        supplier: initialData.supplier,
        deskripsi: initialData.deskripsi ?? "",
        fotoBase64: initialData.foto,
      });

      setErrors({});
      return;
    }

    setForm(initialBarangFormState);
    setErrors({});
  }, [opened, formType, initialData]);

  function clearFieldError(field: string) {
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  }

  function handleChange<K extends keyof BarangFormState>(
    key: K,
    value: BarangFormState[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    clearFieldError(key);
  }

  function handleReset() {
    setForm(initialBarangFormState);
    setErrors({});
  }

  function validate() {
    const parsed = validateWithZod(barangFormSchema, form);

    if (!parsed.success) {
      setErrors(parsed.errors);
      return null;
    }

    setErrors({});
    return parsed.data;
  }

 async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
  const selectedFile = event.currentTarget.files?.[0];
  const inputElement = event.currentTarget;

  if (!selectedFile) {
    return;
  }

  const validation = validateImageFile({
    file: selectedFile,
    maxSizeMb: IMAGE_UPLOAD_LIMITS.BARANG_MB,
  });

  if (!validation.valid) {
    setErrors((prev) => ({
      ...prev,
      fotoBase64: validation.message,
    }));

    inputElement.value = "";
    return;
  }

  try {
    const previewUrl = await fileToDataUrl(selectedFile);

    setForm((prev) => ({
      ...prev,
      fotoBase64: previewUrl,
    }));

    clearFieldError("fotoBase64");
  } catch {
    setErrors((prev) => ({
      ...prev,
      fotoBase64: "Gagal membaca file gambar.",
    }));

    inputElement.value = "";
  }
}

  function handleRemoveImage() {
    setForm((prev) => ({
      ...prev,
      fotoBase64: null,
    }));

    clearFieldError("fotoBase64");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validated = validate();

    if (!validated) {
      return;
    }

    try {
      const success = await onSubmit(
        {
          nama: validated.nama,
          kode: validated.kode,
          merk: validated.merk,
          stok: validated.stok,
          harga: validated.harga,
          kategori: validated.kategori,
          supplier: validated.supplier,
          deskripsi: validated.deskripsi ?? null,
          fotoBase64: validated.fotoBase64 ?? null,
        },
        formType
      );

      if (!success) {
        return;
      }

      onClose();
    } catch {
      return;
    }
  }

  const modalTitle = getBarangModalTitle(formType);
  const submitLabel = getBarangSubmitLabel(formType);

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
              <BarangMainInfoSection
                form={form}
                errors={errors}
                isSubmitting={isSubmitting}
                handleChange={handleChange}
              />

              <BarangClassificationSection
                form={form}
                errors={errors}
                isSubmitting={isSubmitting}
                kategoriOptions={kategoriOptions}
                supplierOptions={supplierOptions}
                handleChange={handleChange}
              />

              <BarangDescriptionPhotoSection
                form={form}
                errors={errors}
                isSubmitting={isSubmitting}
                handleChange={handleChange}
                handleFileChange={handleFileChange}
                handleRemoveImage={handleRemoveImage}
              />

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