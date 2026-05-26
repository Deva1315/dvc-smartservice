/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Box, Button, Group, Modal, Stack } from "@mantine/core";
import { sparepartFormSchema, validateWithZod } from "@/lib/validations";
import {
  initialSparepartFormState,
  type SparepartFormModalProps,
  type SparepartFormState,
} from "@/types/sparepart-form.types";
import {
  getSparepartModalTitle,
  getSparepartSubmitLabel,
} from "@/utils/admin-gudang/sparepart-form.helpers";
import SparepartMainInfoSection from "./SparepartMainInfoSection";
import SparepartSupplierSection from "./SparepartSupplierSection";
import SparepartDescriptionPhotoSection from "./SparepartDescriptionPhotoSection";

export type {
  SparepartFormInitialData,
  SparepartFormPayload,
} from "@/types/sparepart-form.types";

export default function SparepartFormModal({
  opened,
  onClose,
  formType,
  initialData,
  supplierOptions,
  onSubmit,
  isSubmitting = false,
}: SparepartFormModalProps) {
  const [form, setForm] = useState<SparepartFormState>(
    initialSparepartFormState
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        supplier: initialData.supplier,
        deskripsi: initialData.deskripsi ?? "",
        fotoBase64: initialData.foto,
      });

      setErrors({});
      return;
    }

    setForm(initialSparepartFormState);
    setErrors({});

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [opened, formType, initialData]);

  function clearFieldError(field: string) {
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  }

  function handleChange<K extends keyof SparepartFormState>(
    key: K,
    value: SparepartFormState[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    clearFieldError(key);
  }

  function handleReset() {
    setForm(initialSparepartFormState);
    setErrors({});

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function validate() {
    const parsed = validateWithZod(sparepartFormSchema, form);

    if (!parsed.success) {
      setErrors(parsed.errors);
      return null;
    }

    setErrors({});
    return parsed.data;
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.currentTarget.files?.[0];
    const inputElement = event.currentTarget;

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      alert("File harus berupa gambar.");
      inputElement.value = "";
      return;
    }

    try {
      const reader = new FileReader();

      const previewUrl = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
            return;
          }

          reject(new Error("Gagal membaca file"));
        };

        reader.onerror = () => reject(new Error("Gagal membaca file"));
        reader.readAsDataURL(selectedFile);
      });

      setForm((prev) => ({
        ...prev,
        fotoBase64: previewUrl,
      }));

      clearFieldError("fotoBase64");
    } catch {
      alert("Gagal membaca file gambar.");
      inputElement.value = "";
    }
  }

  function handleChooseImage() {
    if (isSubmitting) {
      return;
    }

    fileInputRef.current?.click();
  }

  function handleRemoveImage() {
    setForm((prev) => ({
      ...prev,
      fotoBase64: null,
    }));

    clearFieldError("fotoBase64");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

  const modalTitle = getSparepartModalTitle(formType);
  const submitLabel = getSparepartSubmitLabel(formType);

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
              <SparepartMainInfoSection
                form={form}
                errors={errors}
                isSubmitting={isSubmitting}
                handleChange={handleChange}
              />

              <SparepartSupplierSection
                form={form}
                errors={errors}
                isSubmitting={isSubmitting}
                supplierOptions={supplierOptions}
                handleChange={handleChange}
              />

              <SparepartDescriptionPhotoSection
                form={form}
                errors={errors}
                isSubmitting={isSubmitting}
                fileInputRef={fileInputRef}
                handleChange={handleChange}
                handleFileChange={handleFileChange}
                handleChooseImage={handleChooseImage}
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