"use client";

import {
  Anchor,
  Box,
  Button,
  Center,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconHome2, IconLogin2 } from "@tabler/icons-react";

export default function NotFoundPage() {
  return (
    <Box
      style={{
        minHeight: "100vh",
        backgroundColor: "#4A4A4A",
        padding: "24px",
      }}
    >
      <Center style={{ minHeight: "calc(100vh - 48px)" }}>
        <Paper
          radius="xl"
          shadow="xl"
          p={40}
          style={{
            width: "100%",
            maxWidth: 720,
            backgroundColor: "#F8F9FA",
            border: "1px solid #D9E2F2",
          }}
        >
          <Stack align="center" gap={20}>
            <ThemeIcon
              size={84}
              radius="xl"
              variant="light"
              color="blue"
              style={{ backgroundColor: "#E7F0FF" }}
            >
              <IconAlertCircle size={44} />
            </ThemeIcon>

            <Stack gap={4} align="center">
              <Text
                fw={800}
                style={{
                  fontSize: 72,
                  lineHeight: 1,
                  color: "#2F63B8",
                }}
              >
                404
              </Text>

              <Title
                order={2}
                ta="center"
                style={{
                  color: "#1F2937",
                  fontSize: 30,
                  fontWeight: 800,
                }}
              >
                Halaman Tidak Ditemukan
              </Title>

              <Text
                c="dimmed"
                ta="center"
                maw={520}
                style={{
                  fontSize: 16,
                  lineHeight: 1.7,
                }}
              >
                Halaman yang kamu cari tidak tersedia, sudah dipindahkan, atau
                URL yang dimasukkan tidak benar.
              </Text>
            </Stack>

            <Paper
              radius="lg"
              p="md"
              style={{
                width: "100%",
                backgroundColor: "#EEF4FF",
                border: "1px solid #D6E5FF",
              }}
            >
              <Text ta="center" c="#2F63B8" fw={600}>
                Periksa kembali alamat halaman atau kembali ke halaman utama DVC
                SmartService
              </Text>
            </Paper>

            <Group justify="center" gap="md" mt={8}>
              <Button
                component="a"
                href="/"
                radius="md"
                leftSection={<IconHome2 size={18} />}
                style={{
                  backgroundColor: "#2F63B8",
                  minWidth: 180,
                }}
              >
                Kembali ke Beranda
              </Button>

              <Button
                component="a"
                href="/login"
                radius="md"
                variant="outline"
                color="blue"
                leftSection={<IconLogin2 size={18} />}
                style={{
                  minWidth: 160,
                }}
              >
                Login
              </Button>
            </Group>

            <Anchor
              href="/cek_status"
              underline="always"
              c="#2F63B8"
              fw={600}
              mt={4}
            >
              Atau cek status servis di sini
            </Anchor>
          </Stack>
        </Paper>
      </Center>
    </Box>
  );
}