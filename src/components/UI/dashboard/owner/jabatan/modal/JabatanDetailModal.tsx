"use client";

import {
  Badge,
  Divider,
  Flex,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconBriefcase, IconUser } from "@tabler/icons-react";

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
          fontSize: 18,
          lineHeight: 1.5,
          fontWeight: 700,
        }}
      >
        {value}
      </Text>
    </Stack>
  );
}

export default function JabatanDetailModal({
  opened,
  onClose,
  jabatan,
}: JabatanDetailModalProps) {
  if (!jabatan) {
    return null;
  }

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
          Detail Jabatan
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
          <Flex align="center" gap={18}>
            <ThemeIcon
              size={62}
              radius="xl"
              variant="filled"
              styles={{
                root: {
                  backgroundColor: "#FFFFFF",
                  color: "#0D4CB5",
                  flexShrink: 0,
                },
              }}
            >
              <IconBriefcase size={30} stroke={2.1} />
            </ThemeIcon>

            <Stack gap={8} flex={1}>
              <Flex align="center" gap={10} wrap="wrap">
                <Text
                  fw={800}
                  c="#111111"
                  style={{
                    fontSize: "clamp(24px, 2.7vw, 34px)",
                    lineHeight: 1.15,
                  }}
                >
                  {jabatan.nama_roles}
                </Text>

                {jabatan.isProtected ? (
                  <Badge color="violet" variant="light" radius="sm">
                    Protected
                  </Badge>
                ) : null}
              </Flex>

              <Flex align="center" gap={10} wrap="wrap">
                <IconUser size={22} stroke={1.9} color="#70747C" />
                <Text
                  c="#70747C"
                  style={{
                    fontSize: "clamp(16px, 1.8vw, 20px)",
                    lineHeight: 1.35,
                    fontWeight: 700,
                  }}
                >
                  {jabatan.jumlah_user} user menggunakan role ini
                </Text>
              </Flex>
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
              Informasi Role
            </Text>

            <Divider />

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
              <InfoItem label="ID Role" value={jabatan.id} />
              <InfoItem label="Nama Role" value={jabatan.nama_roles} />
              <InfoItem
                label="Jumlah User"
                value={`${jabatan.jumlah_user} user`}
              />
              <InfoItem
                label="Status"
                value={jabatan.isProtected ? "Protected" : "Dapat dikelola"}
              />
            </SimpleGrid>
          </Stack>
        </Paper>
      </Stack>
    </Modal>
  );
}