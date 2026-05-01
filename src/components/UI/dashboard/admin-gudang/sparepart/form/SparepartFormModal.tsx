/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  Modal,
} from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";
import type { FormType } from "@/types/form-types";
import FormFieldLabel from "@/components/UI/common/form/FormFieldLabel";
import { formatCurrency } from "@/utils/currency-format/format-currency";
import { sparepartFormSchema, validateWithZod } from "@/lib/validations";

export type SparepartFormInitialData = {
  id: string;
  nama: string;
  kode: string;
  merk: string;
  stok: number;
  harga: number;
  supplier: string;
  deskripsi: string | null;
  foto: string | null;
};

export type SparepartFormPayload = {
  nama: string;
  kode: string;
  merk: string;
  stok: number;
  harga: number;
  supplier: string;
  deskripsi: string | null;
  fotoBase64: string | null;
};

type SparepartFormModalProps = {
  opened: boolean;
  onClose: () => void;
  formType: FormType;
  initialData: SparepartFormInitialData | null;
  supplierOptions: { value: string; label: string }[];
  onSubmit: (
    payload: SparepartFormPayload,
    formType: FormType
  ) => Promise<boolean>;
  isSubmitting?: boolean;
};

type SparepartFormState = {
  nama: string;
  kode: string;
  merk: string;
  stok: number;
  harga: number;
  supplier: string | null;
  deskripsi: string;
  fotoBase64: string | null;
};

const initialFormState: SparepartFormState = {
  nama: "",
  kode: "",
  merk: "",
  stok: 0,
  harga: 0,
  supplier: null,
  deskripsi: "",
  fotoBase64: null,
};

function getModalTitle(formType: FormType) {
  return formType === "create" ? "Kelola Sparepart" : "Edit Sparepart";
}

function getSubmitLabel(formType: FormType) {
  return formType === "create" ? "Simpan" : "Update";
}

function parseCurrencyInput(value: string) {
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) return 0;

  const parsed = Number(digitsOnly);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getFormattedHarga(value: number) {
  if (!value || value <= 0) return "";

  return formatCurrency(value, {
    locale: "id-ID",
    prefix: "Rp ",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function SparepartFormModal({
  opened,
  onClose,
  formType,
  initialData,
  supplierOptions,
  onSubmit,
  isSubmitting = false,
}: SparepartFormModalProps) {
  const [form, setForm] = useState<SparepartFormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!opened) return;

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

    setForm(initialFormState);
    setErrors({});
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
    setForm(initialFormState);
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
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              <Stack gap={8}>
                <FormFieldLabel
                  label="Nama"
                  required
                  size="lg"
                  color="#6B7280"
                />

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
                <FormFieldLabel
                  label="Harga"
                  required
                  size="lg"
                  color="#6B7280"
                />

                <TextInput
                  value={getFormattedHarga(form.harga)}
                  onChange={(event) =>
                    handleChange(
                      "harga",
                      parseCurrencyInput(event.currentTarget.value)
                    )
                  }
                  placeholder="Rp 0"
                  radius="md"
                  disabled={isSubmitting}
                  error={errors.harga}
                  styles={{
                    input: {
                      backgroundColor: "#FFFFFF",
                      border: errors.harga ? "1px solid #FA5252" : "none",
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
                <FormFieldLabel
                  label="Kode"
                  required
                  size="lg"
                  color="#6B7280"
                />

                <TextInput
                  value={form.kode}
                  onChange={(event) =>
                    handleChange("kode", event.currentTarget.value)
                  }
                  radius="md"
                  disabled={isSubmitting}
                  error={errors.kode}
                  styles={{
                    input: {
                      backgroundColor: "#FFFFFF",
                      border: errors.kode ? "1px solid #FA5252" : "none",
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
                <FormFieldLabel
                  label="Stok"
                  required
                  size="lg"
                  color="#6B7280"
                />

                <NumberInput
                  value={form.stok}
                  onChange={(value) =>
                    handleChange("stok", typeof value === "number" ? value : 0)
                  }
                  allowDecimal={false}
                  decimalScale={0}
                  hideControls
                  radius="md"
                  disabled={isSubmitting}
                  error={errors.stok}
                  styles={{
                    input: {
                      backgroundColor: "#FFFFFF",
                      border: errors.stok ? "1px solid #FA5252" : "none",
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
                <FormFieldLabel
                  label="Merk"
                  required
                  size="lg"
                  color="#6B7280"
                />

                <TextInput
                  value={form.merk}
                  onChange={(event) =>
                    handleChange("merk", event.currentTarget.value)
                  }
                  radius="md"
                  disabled={isSubmitting}
                  error={errors.merk}
                  styles={{
                    input: {
                      backgroundColor: "#FFFFFF",
                      border: errors.merk ? "1px solid #FA5252" : "none",
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

              <Stack gap={8} style={{ maxWidth: 360 }}>
                <FormFieldLabel
                  label="Supplier"
                  required
                  size="lg"
                  color="#6B7280"
                />

                <Select
                  value={form.supplier}
                  onChange={(value) => handleChange("supplier", value)}
                  data={supplierOptions}
                  radius="md"
                  placeholder="Pilih supplier"
                  disabled={isSubmitting}
                  error={errors.supplier}
                  styles={{
                    input: {
                      backgroundColor: "#FFFFFF",
                      border: errors.supplier ? "1px solid #FA5252" : "none",
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
                    error: {
                      fontSize: 14,
                      marginTop: 6,
                    },
                  }}
                />
              </Stack>
            </SimpleGrid>

            <Stack gap={8}>
              <FormFieldLabel label="Deskripsi" size="lg" color="#6B7280" />

              <Textarea
                value={form.deskripsi}
                onChange={(event) =>
                  handleChange("deskripsi", event.currentTarget.value)
                }
                placeholder="Masukkan deskripsi sparepart disini...."
                minRows={7}
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

            <Stack gap={8}>
              <FormFieldLabel label="Foto" size="lg" color="#6B7280" />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
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
                {form.fotoBase64 ? (
                  <>
                    <img
                      src={form.fotoBase64}
                      alt="Preview foto sparepart"
                      style={{
                        width: "100%",
                        height: 190,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />

                    <ActionIcon
                      variant="filled"
                      color="red"
                      radius="xl"
                      size="md"
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        zIndex: 2,
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveImage();
                      }}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </>
                ) : (
                  <Stack align="center" gap={6}>
                    <IconPlus size={72} stroke={1.6} color="#EAEAEA" />

                    <Text c="#B0B0B0" size="sm">
                      Klik untuk upload foto sparepart
                    </Text>
                  </Stack>
                )}
              </Box>
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