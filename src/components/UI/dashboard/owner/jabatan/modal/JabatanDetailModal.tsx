"use client";

import {
  Badge,
  Box,
  Group,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconBriefcase, IconShieldLock, IconUser } from "@tabler/icons-react";

export type OwnerJabatanDetailRow = {
  id: string;
  nama_roles: string;
  jumlah_user: number;
  isProtected: boolean;
};

type JabatanDetailModalProps = {
  opened: boolean;
  onClose: () => void;
  jabatan: OwnerJabatanDetailRow | null;
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
        }}
      >
        {value || "-"}
      </Text>
    </Stack>
  );
}

export default function JabatanDetailModal({
  opened,
  onClose,
  jabatan,
}: JabatanDetailModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="54rem"
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
      title="Detail Jabatan"
    >
      <Box
        style={{
          maxHeight: "calc(100vh - 150px)",
          overflowY: "auto",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Box px={{ base: 20, sm: 30 }} py={26}>
          {!jabatan ? null : (
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
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start" gap="md">
                    <Group align="flex-start" gap="md" style={{ minWidth: 0 }}>
                      <ThemeIcon
                        size={58}
                        radius="xl"
                        variant="light"
                        color="blue"
                        style={{
                          flexShrink: 0,
                        }}
                      >
                        <IconBriefcase size={28} stroke={2} />
                      </ThemeIcon>

                      <Stack gap={6} style={{ minWidth: 0 }}>
                        <Text
                          fw={800}
                          fz={24}
                          c="#111827"
                          style={{
                            lineHeight: 1.2,
                            wordBreak: "break-word",
                          }}
                        >
                          {jabatan.nama_roles}
                        </Text>

                        <Group gap={8}>
                          <IconUser size={18} stroke={1.9} color="#6B7280" />

                          <Text fw={700} fz="sm" c="#6B7280">
                            {jabatan.jumlah_user} user menggunakan role ini
                          </Text>
                        </Group>
                      </Stack>
                    </Group>

                    {jabatan.isProtected ? (
                      <Badge
                        color="violet"
                        variant="light"
                        radius="md"
                        size="lg"
                        leftSection={<IconShieldLock size={14} />}
                        style={{
                          textTransform: "none",
                          flexShrink: 0,
                          fontWeight: 800,
                        }}
                      >
                        Protected
                      </Badge>
                    ) : (
                      <Badge
                        color="green"
                        variant="light"
                        radius="md"
                        size="lg"
                        style={{
                          textTransform: "none",
                          flexShrink: 0,
                          fontWeight: 800,
                        }}
                      >
                        Dapat Dikelola
                      </Badge>
                    )}
                  </Group>
                </Stack>
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
                      Informasi Role
                    </Text>

                    <Text fz="sm" c="#6B7280">
                      Detail jabatan, jumlah pengguna, dan status pengelolaan
                      role pada sistem.
                    </Text>
                  </Stack>

                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                    <InfoItem label="ID Role" value={jabatan.id} />
                    <InfoItem label="Nama Role" value={jabatan.nama_roles} />
                    <InfoItem
                      label="Jumlah User"
                      value={`${jabatan.jumlah_user} user`}
                    />
                    <InfoItem
                      label="Status"
                      value={
                        jabatan.isProtected ? "Protected" : "Dapat dikelola"
                      }
                    />
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
                <Stack gap={8}>
                  <Text fw={800} fz="lg" c="#111827">
                    Catatan Pengelolaan
                  </Text>

                  <Text
                    fz={15}
                    c="#111827"
                    style={{
                      lineHeight: 1.7,
                    }}
                  >
                    {jabatan.isProtected
                      ? "Jabatan ini termasuk role utama sistem sehingga tidak disarankan untuk dihapus atau diubah sembarangan."
                      : "Jabatan ini dapat dikelola sesuai kebutuhan operasional, selama tidak sedang digunakan untuk konfigurasi penting sistem."}
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