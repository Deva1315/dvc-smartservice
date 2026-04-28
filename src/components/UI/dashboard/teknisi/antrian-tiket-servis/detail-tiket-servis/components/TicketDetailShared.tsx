"use client";

import { Box, Group, Paper, Text } from "@mantine/core";

export function CardSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text fw={700} fz={18} c="#2B2B2B">
      {children}
    </Text>
  );
}

export function CardBox({
  children,
  bg = "#F7F7FB",
}: {
  children: React.ReactNode;
  bg?: string;
}) {
  return (
    <Paper
      radius="lg"
      p="md"
      style={{
        backgroundColor: bg,
        border: "1px solid #ECECF3",
        height: "100%",
      }}
    >
      {children}
    </Paper>
  );
}

export function InfoRow({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <Group gap={10} wrap="nowrap" align="flex-start">
      <Box c="#6B7280" pt={2}>
        {icon}
      </Box>
      <Text fz={16} c="#4B5563">
        {text}
      </Text>
    </Group>
  );
}

export function SimpleInfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <Group justify="space-between" align="flex-start" wrap="nowrap">
      <Text fw={600} fz={15} c="#6B7280">
        {label}
      </Text>
      <Text fz={16} c="#2B2B2B" ta="right">
        {value || "-"}
      </Text>
    </Group>
  );
}