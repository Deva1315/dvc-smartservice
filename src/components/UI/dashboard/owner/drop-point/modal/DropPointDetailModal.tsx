"use client";

import {
  Button,
  Divider,
  Flex,
  Modal,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconClock,
  IconExternalLink,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";

export type OwnerDropPointDetailRow = {
  id: string;
  nama_drop_point: string;
  alamat: string;
  phone: string | null;
  jam_operasional: string | null;
};

type DropPointDetailModalProps = {
  opened: boolean;
  onClose: () => void;
  dropPoint: OwnerDropPointDetailRow | null;
};

type InfoItemProps = {
  label: string;
  value: string;
};

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <Stack gap={4}>
      <Text
        fw={700}
        c="#4B5563"
        style={{
          fontSize: 15,
          lineHeight: 1.2,
        }}
      >
        {label}
      </Text>

      <Text
        c="#111827"
        style={{
          fontSize: 17,
          lineHeight: 1.5,
          fontWeight: 500,
          whiteSpace: "pre-line",
        }}
      >
        {value}
      </Text>
    </Stack>
  );
}

function buildDropPointMapsUrl(dropPoint: OwnerDropPointDetailRow) {
  const query = encodeURIComponent(
    `${dropPoint.nama_drop_point}, ${dropPoint.alamat}`
  );

  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export default function DropPointDetailModal({
  opened,
  onClose,
  dropPoint,
}: DropPointDetailModalProps) {
  if (!dropPoint) {
    return null;
  }

  const mapsUrl = buildDropPointMapsUrl(dropPoint);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="68rem"
      radius="xl"
      closeOnClickOutside
      closeButtonProps={{
        size: "lg",
        radius: "xl",
      }}
      styles={{
        body: {
          backgroundColor: "#EFEFEF",
          padding: 24,
        },
        header: {
          backgroundColor: "#EFEFEF",
          paddingBottom: 0,
        },
        content: {
          backgroundColor: "#EFEFEF",
        },
      }}
      title={
        <Text
          fw={800}
          c="#000000"
          style={{
            fontSize: 26,
            lineHeight: 1.2,
          }}
        >
          Detail Drop Point
        </Text>
      }
    >
      <Stack gap={22}>
        <Paper
          radius={24}
          px={{ base: 20, md: 28 }}
          py={{ base: 22, md: 28 }}
          style={{
            backgroundColor: "#B9D3F3",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
          }}
        >
          <Flex
            justify="space-between"
            align="stretch"
            gap={{ base: 22, md: 30 }}
            direction={{ base: "column", md: "row" }}
          >
            <Flex align="flex-start" gap={18} flex={1}>
              <ThemeIcon
                size={62}
                radius="xl"
                variant="filled"
                styles={{
                  root: {
                    backgroundColor: "#FFFFFF",
                    color: "#97B9E6",
                    flexShrink: 0,
                  },
                }}
              >
                <IconMapPin size={30} stroke={2.1} />
              </ThemeIcon>

              <Stack gap={10} flex={1}>
                <Text
                  fw={700}
                  c="#111111"
                  style={{
                    fontSize: "clamp(24px, 2.7vw, 34px)",
                    lineHeight: 1.15,
                  }}
                >
                  {dropPoint.nama_drop_point}
                </Text>

                <Text
                  fw={600}
                  c="#70747C"
                  style={{
                    fontSize: "clamp(17px, 1.9vw, 22px)",
                    lineHeight: 1.45,
                  }}
                >
                  {dropPoint.alamat}
                </Text>

                <Flex align="center" gap={10} wrap="wrap">
                  <IconPhone size={22} stroke={1.9} color="#70747C" />
                  <Text
                    c="#70747C"
                    style={{
                      fontSize: "clamp(16px, 1.8vw, 20px)",
                      lineHeight: 1.35,
                    }}
                  >
                    Telp : {dropPoint.phone ?? "-"}
                  </Text>
                </Flex>

                <Flex align="center" gap={10} wrap="wrap">
                  <IconClock size={22} stroke={1.9} color="#70747C" />
                  <Text
                    c="#70747C"
                    style={{
                      fontSize: "clamp(16px, 1.8vw, 20px)",
                      lineHeight: 1.35,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {dropPoint.jam_operasional ?? "-"}
                  </Text>
                </Flex>
              </Stack>
            </Flex>

            <Stack justify="center" gap={12} w={{ base: "100%", md: 280 }}>
              <Button
                component="a"
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                radius={14}
                h={52}
                rightSection={<IconExternalLink size={18} />}
                style={{
                  backgroundColor: "#0B4DB8",
                  fontSize: 18,
                  fontWeight: 700,
                  boxShadow: "none",
                }}
              >
                Buka di Google Maps
              </Button>
            </Stack>
          </Flex>
        </Paper>

        <Paper
          radius={22}
          px={{ base: 20, md: 24 }}
          py={{ base: 22, md: 26 }}
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
          }}
        >
          <Stack gap={16}>
            <Text
              fw={700}
              c="#111827"
              style={{
                fontSize: 24,
                lineHeight: 1.2,
              }}
            >
              Informasi Lokasi
            </Text>

            <Divider />

            <InfoItem label="Nama Drop Point" value={dropPoint.nama_drop_point} />
            <InfoItem label="Alamat" value={dropPoint.alamat} />
            <InfoItem label="Nomor Telepon" value={dropPoint.phone ?? "-"} />
            <InfoItem
              label="Jam Operasional"
              value={dropPoint.jam_operasional ?? "-"}
            />
          </Stack>
        </Paper>
      </Stack>
    </Modal>
  );
}