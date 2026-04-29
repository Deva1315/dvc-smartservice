"use client";

import { Button, Paper, Stack, Text, Title } from "@mantine/core";

type TicketDetailNotFoundStateProps = {
  onBack: () => void;
};

export function TicketDetailLoadingState() {
  return (
    <Stack gap={18}>
      <Title order={1} fw={800}>
        Detail Tiket Servis
      </Title>

      <Paper
        radius="xl"
        p="xl"
        style={{
          border: "1px solid #ECECF3",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Text fw={700} fz={18}>
          Memuat detail tiket servis...
        </Text>
      </Paper>
    </Stack>
  );
}

export function TicketDetailNotFoundState({
  onBack,
}: TicketDetailNotFoundStateProps) {
  return (
    <Stack gap={18}>
      <Title order={1} fw={800}>
        Detail Tiket Servis
      </Title>

      <Paper
        radius="xl"
        p="xl"
        style={{
          border: "1px solid #ECECF3",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Stack gap={12} align="center">
          <Text fw={700} fz={20}>
            Tiket servis tidak ditemukan
          </Text>

          <Button
            radius="xl"
            onClick={onBack}
            style={{
              backgroundColor: "#0D4CB5",
            }}
          >
            Kembali ke Antrian
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}