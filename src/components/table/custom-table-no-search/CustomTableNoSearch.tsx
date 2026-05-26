/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Center,
  Divider,
  Group,
  Loader,
  Pagination,
  rem,
  Select,
  Table,
  Text,
} from "@mantine/core";
import SortDropdown, { type SortValue } from "@/components/sort/SortDropdown";

export type TableColumn<T> = {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  align?: "left" | "center" | "right";
  render?: (row: T, index: number) => React.ReactNode;
};

interface CustomTableNoSearchProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  toolbar?: React.ReactNode;
  onRowClick?: (row: T) => void;
  perPageOptions?: number[];
  emptyText?: string;
  showFooter?: boolean;
}

export default function CustomTableNoSearch<
  T extends Record<string, unknown>
>({
  data,
  columns,
  isLoading = false,
  toolbar,
  onRowClick,
  perPageOptions = [10, 20, 50],
  emptyText = "Data tidak ditemukan",
  showFooter = true,
}: CustomTableNoSearchProps<T>) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(perPageOptions[0] ?? 10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortValue>(null);

  useEffect(() => {
    setPage(1);
  }, [perPage, sortField, sortOrder]);

  const sortedData = useMemo(() => {
    if (!sortField || !sortOrder) {
      return data;
    }

    return [...data].sort((a, b) => {
      const valueA = a[sortField as keyof T];
      const valueB = b[sortField as keyof T];

      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
      }

      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortOrder === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return 0;
    });
  }, [data, sortField, sortOrder]);

  const total = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, total);
  const paginatedData = showFooter
    ? sortedData.slice(startIndex, endIndex)
    : sortedData;

  const handleSortChange = (field: string, value: SortValue) => {
    if (!value) {
      setSortField(null);
      setSortOrder(null);
      return;
    }

    setSortField(field);
    setSortOrder(value);
  };

  if (isLoading) {
    return (
      <Center p="xl">
        <Loader />
      </Center>
    );
  }

  return (
    <Box
      bg="#E3E3E3"
      style={{
        border: "1px solid #D1D5DB",
        borderRadius: rem(10),
        overflow: "hidden",
      }}
    >
      {toolbar && (
        <Group
          justify="space-between"
          wrap="wrap"
          gap="sm"
          p="md"
          bg="#F5F5F5"
        >
          <Box>{toolbar}</Box>
        </Group>
      )}

      <Table
        withTableBorder
        withColumnBorders
        striped={false}
        highlightOnHover={false}
        horizontalSpacing="lg"
        verticalSpacing="lg"
        styles={{
          table: {
            backgroundColor: "#E3E3E3",
          },
          th: {
            backgroundColor: "#D9D9D9",
            color: "#111111",
            fontWeight: 700,
            fontSize: rem(18),
            padding: "16px 18px",
            borderColor: "#CFCFCF",
          },
          td: {
            backgroundColor: "#E3E3E3",
            color: "#111111",
            fontSize: rem(17),
            padding: "18px 18px",
            borderColor: "#CFCFCF",
            verticalAlign: "top",
          },
        }}
      >
        <Table.Thead>
          <Table.Tr>
            {columns.map((column) => (
              <Table.Th
                key={String(column.key)}
                style={{
                  width: column.width,
                  textAlign: column.align ?? "left",
                }}
              >
                <Group justify="space-between" gap={8} wrap="nowrap">
                  <Text fw={700} fz="md" >
                    {column.label}
                  </Text>

                  {column.sortable && (
                    <SortDropdown
                      active={
                        sortField === String(column.key) ? sortOrder : null
                      }
                      onChange={(value) =>
                        handleSortChange(String(column.key), value)
                      }
                    />
                  )}
                </Group>
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((row, rowIndex) => (
              <Table.Tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                style={{
                  cursor: onRowClick ? "pointer" : "default",
                }}
              >
                {columns.map((column) => (
                  <Table.Td
                    key={String(column.key)}
                    style={{
                      textAlign: column.align ?? "left",
                    }}
                  >
                    {column.render
                      ? column.render(row, rowIndex)
                      : String(row[column.key as keyof T] ?? "-")}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))
          ) : (
            <Table.Tr>
              <Table.Td colSpan={columns.length}>
                <Center py="lg">
                  <Text c="dimmed" >{emptyText}</Text>
                </Center>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>

      {showFooter && (
        <>
          <Divider color="#D1D5DB" />

          <Group justify="space-between" wrap="wrap" p="md" bg="#FFFFFF">
            <Group gap="sm">
              <Text size="sm" >
                Rows per page
              </Text>

              <Select
                data={perPageOptions.map((item) => ({
                  value: String(item),
                  label: String(item),
                }))}
                value={String(perPage)}
                onChange={(value) => {
                  if (!value) return;
                  setPerPage(Number(value));
                }}
                w={90}
                radius="md"
              />
            </Group>

            <Group gap="md" wrap="wrap">
              <Text c="dimmed" size="sm" >
                Showing <b>{total === 0 ? 0 : startIndex + 1}</b> to{" "}
                <b>{endIndex}</b> of <b>{total}</b>
              </Text>

              <Pagination
                total={totalPages}
                value={safePage}
                onChange={setPage}
                radius="md"
                size="sm"
              />
            </Group>
          </Group>
        </>
      )}
    </Box>
  );
}