"use client";

import type { ReactNode } from "react";
import { Table, Text } from "@mantine/core";

type EmptyTableRowProps = {
  colSpan: number;
  children: ReactNode;
};

export function EmptyTableRow({ colSpan, children }: EmptyTableRowProps) {
  return (
    <Table.Tr>
      <Table.Td colSpan={colSpan}>
        <Text ta="center" c="dimmed" py="md">
          {children}
        </Text>
      </Table.Td>
    </Table.Tr>
  );
}