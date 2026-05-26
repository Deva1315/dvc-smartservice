/* eslint-disable @next/next/no-img-element */

import type { ChangeEvent, RefObject } from "react";
import {
  ActionIcon,
  Box,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { IconPhotoPlus, IconTrash, IconUpload } from "@tabler/icons-react";
import type {
  SparepartFormFieldChangeHandler,
  SparepartFormState,
} from "@/types/sparepart-form.types";

type SparepartDescriptionPhotoSectionProps = {
  form: SparepartFormState;
  errors: Record<string, string>;
  isSubmitting: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleChange: SparepartFormFieldChangeHandler;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleChooseImage: () => void;
  handleRemoveImage: () => void;
};

function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <Text fw={700} fz="sm" c="#374151">
      {label}
      {required ? (
        <Text span c="#EF4444" ml={2}>
          *
        </Text>
      ) : null}
    </Text>
  );
}

const errorStyle = {
  fontSize: 13,
  marginTop: 6,
};

export default function SparepartDescriptionPhotoSection({
  form,
  errors,
  isSubmitting,
  fileInputRef,
  handleChange,
  handleFileChange,
  handleChooseImage,
  handleRemoveImage,
}: SparepartDescriptionPhotoSectionProps) {
  return (
    <Paper
      radius="lg"
      p={{ base: "md", sm: "lg" }}
      withBorder
      style={{
        borderColor: "#E5E7EB",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Stack gap="md">
        <Stack gap={4}>
          <Text fw={800} fz="lg" c="#111827">
            Deskripsi dan Foto
          </Text>

          <Text fz="sm" c="#6B7280">
            Tambahkan deskripsi sparepart dan foto utama untuk ditampilkan.
          </Text>
        </Stack>

        <Stack gap={6}>
          <FieldLabel label="Deskripsi" />

          <Textarea
            value={form.deskripsi}
            onChange={(event) =>
              handleChange("deskripsi", event.currentTarget.value)
            }
            placeholder="Masukkan deskripsi sparepart, spesifikasi, atau catatan tambahan..."
            minRows={5}
            radius="md"
            disabled={isSubmitting}
            error={errors.deskripsi}
            styles={{
              input: {
                backgroundColor: "#F9FAFB",
                border: errors.deskripsi
                  ? "1px solid #FA5252"
                  : "1px solid #E5E7EB",
                fontSize: 15,
                color: "#111827",
              },
              error: errorStyle,
            }}
          />
        </Stack>

        <Stack gap={8}>
          <Group justify="space-between" align="center">
            <FieldLabel label="Foto Sparepart" />

            <Text fz={13} c="#6B7280">
              Format gambar JPG, PNG, atau WEBP
            </Text>
          </Group>

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
              minHeight: 220,
              backgroundColor: "#F9FAFB",
              border: errors.fotoBase64
                ? "1px solid #FA5252"
                : "1px dashed #CBD5E1",
              borderRadius: 16,
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
                    height: 240,
                    objectFit: "cover",
                    display: "block",
                  }}
                />

                <ActionIcon
                  variant="filled"
                  color="red"
                  radius="xl"
                  size="lg"
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    zIndex: 2,
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemoveImage();
                  }}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </>
            ) : (
              <Stack align="center" gap={10}>
                <Box
                  style={{
                    width: 74,
                    height: 74,
                    borderRadius: "999px",
                    backgroundColor: "#EFF6FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconPhotoPlus size={34} stroke={1.7} color="#0D4CB5" />
                </Box>

                <Stack align="center" gap={2}>
                  <Group gap={6}>
                    <IconUpload size={16} color="#0D4CB5" />
                    <Text fw={800} fz={15} c="#0D4CB5">
                      Klik untuk upload foto sparepart
                    </Text>
                  </Group>

                  <Text fz={13} c="#6B7280">
                    Foto akan digunakan sebagai gambar utama sparepart.
                  </Text>
                </Stack>
              </Stack>
            )}
          </Box>

          {errors.fotoBase64 ? (
            <Text fz={13} c="#FA5252">
              {errors.fotoBase64}
            </Text>
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );
}