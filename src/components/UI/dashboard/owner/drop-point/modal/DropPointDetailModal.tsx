"use client";

import {
  Box,
  Button,
  Group,
  Modal,
  Paper,
  SimpleGrid,
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
  value: string | number | null | undefined;
};

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <Stack gap={6}>
      <Text fw={700} fz="sm" c="#6B7280">
        {label}
      </Text>

      <Text
        fw={800}
        fz={16}
        c="#111827"
        style={{
          lineHeight: 1.5,
          wordBreak: "break-word",
          whiteSpace: "pre-line",
        }}
      >
        {value || "-"}
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
  const mapsUrl = dropPoint ? buildDropPointMapsUrl(dropPoint) : "#";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="64rem"
      radius="xl"
      closeOnClickOutside
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
      title="Detail Drop Point"
    >
      <Box
        style={{
          maxHeight: "calc(100vh - 150px)",
          overflowY: "auto",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Box px={{ base: 20, sm: 30 }} py={26}>
          {!dropPoint ? null : (
            <Stack gap={24}>
              <Paper
                radius="lg"
                p={{ base: "md", sm: "lg" }}
                withBorder
                style={{
                  borderColor: "#E5E7EB",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <Group
                  justify="space-between"
                  align="flex-start"
                  gap="xl"
                  wrap="wrap"
                >
                  <Group align="flex-start" gap="md" style={{ flex: 1 }}>
                    <ThemeIcon
                      size={58}
                      radius="xl"
                      variant="light"
                      color="blue"
                      style={{
                        flexShrink: 0,
                      }}
                    >
                      <IconMapPin size={28} stroke={2} />
                    </ThemeIcon>

                    <Stack gap={8} style={{ minWidth: 0, flex: 1 }}>
                      <Text
                        fw={800}
                        fz={24}
                        c="#111827"
                        style={{
                          lineHeight: 1.2,
                          wordBreak: "break-word",
                        }}
                      >
                        {dropPoint.nama_drop_point}
                      </Text>

                      <Text
                        fz={15}
                        c="#6B7280"
                        style={{
                          lineHeight: 1.6,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {dropPoint.alamat}
                      </Text>

                      <Group gap="lg" wrap="wrap" mt={4}>
                        <Group gap={8}>
                          <IconPhone size={18} stroke={1.9} color="#6B7280" />

                          <Text fw={700} fz="sm" c="#6B7280">
                            {dropPoint.phone ?? "-"}
                          </Text>
                        </Group>

                        <Group gap={8}>
                          <IconClock size={18} stroke={1.9} color="#6B7280" />

                          <Text
                            fw={700}
                            fz="sm"
                            c="#6B7280"
                            style={{
                              whiteSpace: "pre-line",
                            }}
                          >
                            {dropPoint.jam_operasional ?? "-"}
                          </Text>
                        </Group>
                      </Group>
                    </Stack>
                  </Group>

                  <Button
                    component="a"
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    radius="md"
                    size="md"
                    rightSection={<IconExternalLink size={18} />}
                    style={{
                      minWidth: 210,
                      height: 46,
                      backgroundColor: "#0D4CB5",
                      fontSize: 15,
                      fontWeight: 700,
                    }}
                  >
                    Buka Google Maps
                  </Button>
                </Group>
              </Paper>

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
                      Informasi Lokasi
                    </Text>

                    <Text fz="sm" c="#6B7280">
                      Detail data Drop Point yang digunakan untuk penerimaan
                      perangkat servis pelanggan.
                    </Text>
                  </Stack>

                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                    <InfoItem
                      label="Nama Drop Point"
                      value={dropPoint.nama_drop_point}
                    />
                    <InfoItem
                      label="Nomor Telepon"
                      value={dropPoint.phone ?? "-"}
                    />
                    <InfoItem
                      label="Jam Operasional"
                      value={dropPoint.jam_operasional ?? "-"}
                    />
                    <InfoItem label="ID Drop Point" value={dropPoint.id} />
                  </SimpleGrid>
                </Stack>
              </Paper>

              <Paper
                radius="lg"
                p={{ base: "md", sm: "lg" }}
                withBorder
                style={{
                  borderColor: "#E5E7EB",
                  backgroundColor: "#F9FAFB",
                }}
              >
                <Stack gap="md">
                  <Stack gap={4}>
                    <Text fw={800} fz="lg" c="#111827">
                      Alamat Lengkap
                    </Text>

                    <Text fz="sm" c="#6B7280">
                      Alamat ini digunakan sebagai titik pencarian pada Google
                      Maps.
                    </Text>
                  </Stack>

                  <Text
                    fz={15}
                    c="#111827"
                    style={{
                      lineHeight: 1.7,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {dropPoint.alamat || "-"}
                  </Text>
                </Stack>
              </Paper>
            </Stack>
          )}
        </Box>
      </Box>
    </Modal>
  );
}