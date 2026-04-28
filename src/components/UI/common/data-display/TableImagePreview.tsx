"use client";

import { Box, Image, Text } from "@mantine/core";
import { IconPhotoOff } from "@tabler/icons-react";

type TableImagePreviewProps = {
  src?: string | null;
  alt?: string;
  width?: number;
  height?: number;
  radius?: number | string;
  emptyText?: string;
  fit?: "contain" | "cover";
  withBorder?: boolean;
};

function normalizeImageSource(src?: string | null) {
  if (!src) return "";

  const trimmedSrc = src.trim();

  if (!trimmedSrc) return "";

  if (
    trimmedSrc.startsWith("data:image") ||
    trimmedSrc.startsWith("http://") ||
    trimmedSrc.startsWith("https://") ||
    trimmedSrc.startsWith("/")
  ) {
    return trimmedSrc;
  }

  return `data:image/jpeg;base64,${trimmedSrc}`;
}

export default function TableImagePreview({
  src,
  alt = "Preview gambar",
  width = 64,
  height = 64,
  radius = 10,
  emptyText = "Tidak ada foto",
  fit = "cover",
  withBorder = true,
}: TableImagePreviewProps) {
  const imageSrc = normalizeImageSource(src);

  return (
    <Box
      w={width}
      h={height}
      style={{
        borderRadius: radius,
        overflow: "hidden",
        border: withBorder ? "1px solid #E5E7EB" : "none",
        backgroundColor: "#F9FAFB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={alt}
          w={width}
          h={height}
          fit={fit}
          fallbackSrc=""
        />
      ) : (
        <Box
          px={6}
          style={{
            textAlign: "center",
            color: "#9CA3AF",
          }}
        >
          <IconPhotoOff size={18} style={{ marginBottom: 2 }} />
          <Text size="9px" lh={1.1}>
            {emptyText}
          </Text>
        </Box>
      )}
    </Box>
  );
}