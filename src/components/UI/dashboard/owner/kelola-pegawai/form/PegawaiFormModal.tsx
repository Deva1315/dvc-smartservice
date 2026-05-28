"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Box, Button, Group, Modal, Stack } from "@mantine/core";
import { getPegawaiFormSchema, validateWithZod } from "@/lib/validations";
import {
  initialPegawaiFormState,
  type PegawaiFormModalProps,
  type PegawaiFormPayload,
  type PegawaiFormState,
} from "@/types/pegawai-form.types";
import {
  buildPegawaiEditFormState,
  getPegawaiModalTitle,
  getPegawaiSubmitLabel,
} from "@/utils/owner/pegawai-form.helpers";
import PegawaiAccountSection from "./PegawaiAccountSection";
import PegawaiRoleAddressSection from "./PegawaiRoleAddressSection";
import PegawaiPhotoSection from "./PegawaiPhotoSection";

export type {
  PegawaiFormInitialData,
  PegawaiFormPayload,
  PegawaiRoleOption,
} from "@/types/pegawai-form.types";

import {
  fileToDataUrl,
  IMAGE_UPLOAD_LIMITS,
  validateImageFile,
} from "@/utils/shared/image-upload.helpers";

export default function PegawaiFormModal({
  opened,
  onClose,
  formType,
  roleOptions,
  initialData = null,
  onSubmit,
}: PegawaiFormModalProps) {
  const [form, setForm] = useState<PegawaiFormState>(
    initialPegawaiFormState
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!opened) {
      return;
    }

    setErrors({});

    if (formType === "edit" && initialData) {
      setForm(buildPegawaiEditFormState(initialData));
      return;
    }

    setForm(initialPegawaiFormState);

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

  function handleChange<K extends keyof PegawaiFormState>(
    key: K,
    value: PegawaiFormState[K]
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
      setForm(buildPegawaiEditFormState(initialData));
      return;
    }

    setForm(initialPegawaiFormState);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
      photoFile: null,
      photoPreviewUrl: null,
      removePhoto: true,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
  const inputElement = event.currentTarget;
  const selectedFile = inputElement.files?.[0];

  if (!selectedFile) {
    return;
  }

  const validation = validateImageFile({
    file: selectedFile,
    maxSizeMb: IMAGE_UPLOAD_LIMITS.PEGAWAI_MB,
  });

  if (!validation.valid) {
    setErrors((prev) => ({
      ...prev,
      photoFile: validation.message,
    }));

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

    clearFieldError("photoFile");
  } catch {
    setErrors((prev) => ({
      ...prev,
      photoFile: "Gagal membaca file gambar.",
    }));

    inputElement.value = "";
  }
}

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = validateWithZod(getPegawaiFormSchema(formType), form);

    if (!parsed.success) {
      setErrors(parsed.errors);
      return;
    }

    setErrors({});

    const payload: PegawaiFormPayload = {
      nama: parsed.data.nama,
      email: parsed.data.email,
      password: parsed.data.password ?? null,
      phone: parsed.data.phone,
      address: parsed.data.address ?? null,
      id_roles: parsed.data.id_roles,
      photoFile: parsed.data.photoFile ?? null,
      photoPreviewUrl: parsed.data.photoPreviewUrl ?? null,
      removePhoto: parsed.data.removePhoto ?? false,
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

  const modalTitle = getPegawaiModalTitle(formType);
  const submitLabel = getPegawaiSubmitLabel(formType);

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
              <PegawaiAccountSection
                form={form}
                errors={errors}
                formType={formType}
                isSubmitting={isSubmitting}
                handleChange={handleChange}
              />

              <PegawaiRoleAddressSection
                form={form}
                errors={errors}
                roleOptions={roleOptions}
                isSubmitting={isSubmitting}
                handleChange={handleChange}
              />

              <PegawaiPhotoSection
                form={form}
                isSubmitting={isSubmitting}
                fileInputRef={fileInputRef}
                handleImageChange={handleImageChange}
                handleChooseImage={handleChooseImage}
                handleRemoveImage={handleRemoveImage}
                error={errors.photoFile}
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