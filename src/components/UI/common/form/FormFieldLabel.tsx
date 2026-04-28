"use client";

import { Text } from "@mantine/core";

type FormFieldLabelProps = {
  label: string;
  required?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: string;
  weight?: number;
};

export default function FormFieldLabel({
  label,
  required = false,
  size = "sm",
  color = "#374151",
  weight = 700,
}: FormFieldLabelProps) {
  return (
    <Text size={size} fw={weight} c={color} mb={6}>
      {label}
      {required ? (
        <Text component="span" c="red" ml={4}>
          *
        </Text>
      ) : null}
    </Text>
  );
}