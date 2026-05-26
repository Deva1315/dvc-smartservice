/* eslint-disable @next/next/no-img-element */

import type { ChangeEvent, RefObject } from "react";
import {
  ActionIcon,
  Box,
  Group,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { IconPhotoPlus, IconTrash, IconUpload } from "@tabler/icons-react";
import type { PegawaiFormState } from "@/types/pegawai-form.types";

type PegawaiPhotoSectionProps = {
  form: PegawaiFormState;
  isSubmitting: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleChooseImage: () => void;
  handleRemoveImage: () => void;
};

function FieldLabel({ label }: { label: string }) {
  return (
    <Text fw={700} fz="sm" c="#374151">
      {label}
    </Text>
  );
}

export default function PegawaiPhotoSection({
  form,
  isSubmitting,
  fileInputRef,
  handleImageChange,
  handleChooseImage,
  handleRemoveImage,
}: PegawaiPhotoSectionProps) {
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
            Foto Profil
          </Text>

          <Text fz="sm" c="#6B7280">
            Tambahkan foto profil pegawai agar data lebih mudah dikenali.
          </Text>
        </Stack>

        <Stack gap={8}>
          <Group justify="space-between" align="center">
            <FieldLabel label="Foto Pegawai" />

            <Text fz={13} c="#6B7280">
              Format gambar JPG, PNG, atau WEBP
            </Text>
          </Group>

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
              minHeight: 220,
              backgroundColor: "#F9FAFB",
              border: "1px dashed #CBD5E1",
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
            {form.photoPreviewUrl ? (
              <>
                <img
                  src={form.photoPreviewUrl}
                  alt="Preview foto pegawai"
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
                      Klik untuk upload foto pegawai
                    </Text>
                  </Group>

                  <Text fz={13} c="#6B7280">
                    Foto akan digunakan sebagai foto profil pegawai.
                  </Text>
                </Stack>
              </Stack>
            )}
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
}