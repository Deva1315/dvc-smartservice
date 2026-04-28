"use client";

import {
  Box,
  Button,
  Divider,
  Group,
  Menu,
  Stack,
  Table,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { CardBox, CardSectionTitle } from "./TicketDetailShared";
import { formatCurrency } from "@/utils/currency-format/format-currency";
import type { DetailTiketServisApiItem } from "@/lib/teknisi/teknisi-tiket-servis.client";

type MasterOption = {
  value: string;
  label: string;
  harga: number;
  stock?: number;
};

type DetailItem = DetailTiketServisApiItem["detail_tiket_servis"][number];

type TicketJasaSectionProps = {
  jasaMasterOptions: MasterOption[];
  jasaServis: DetailItem[];
  canModifyDetail: boolean;
  loadingAction: string | null;
  onTambahJasa: (itemId: string) => void;
  onHapusJasa: (detailId: string) => void;
};

function toNumber(value: string | number | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatRupiah(value: number) {
  return formatCurrency(value, {
    locale: "id-ID",
    prefix: "Rp ",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function TicketJasaSection({
  jasaMasterOptions,
  jasaServis,
  canModifyDetail,
  loadingAction,
  onTambahJasa,
  onHapusJasa,
}: TicketJasaSectionProps) {
  return (
    <CardBox>
      <Stack gap={14}>
        <Group justify="space-between" align="center">
          <CardSectionTitle>Jasa Servis</CardSectionTitle>

          <Menu shadow="md" width={300} withinPortal={false}>
            <Menu.Target>
              <Button
                size="xs"
                radius="md"
                leftSection={<IconPlus size={14} />}
                disabled={!canModifyDetail || loadingAction !== null}
                loading={loadingAction === "tambah-jasa"}
                style={{
                  backgroundColor: "#0D4CB5",
                }}
              >
                Tambah Jasa
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              {jasaMasterOptions.length > 0 ? (
                jasaMasterOptions.map((item) => (
                  <Menu.Item
                    key={item.value}
                    onClick={() => onTambahJasa(item.value)}
                  >
                    <Stack gap={2}>
                      <Text fz={14}>{item.label}</Text>
                      <Text fz={12} c="dimmed">
                        {formatRupiah(item.harga)}
                      </Text>
                    </Stack>
                  </Menu.Item>
                ))
              ) : (
                <Menu.Item disabled>Belum ada data jasa servis</Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Divider color="#ECECF3" />

        <Box
          style={{
            border: "1px solid #ECECF3",
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: "#FFFFFF",
          }}
        >
          <Table
            horizontalSpacing="md"
            verticalSpacing="md"
            highlightOnHover={false}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nama Jasa</Table.Th>
                <Table.Th>Qty</Table.Th>
                <Table.Th>Harga</Table.Th>
                <Table.Th>Total</Table.Th>
                <Table.Th>Aksi</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {jasaServis.length > 0 ? (
                jasaServis.map((item) => {
                  const qty = toNumber(item.jumlah);
                  const harga = toNumber(item.harga);
                  const subtotal = toNumber(item.subtotal) || qty * harga;

                  return (
                    <Table.Tr key={item.id}>
                      <Table.Td>
                        <Text fz={16} c="#4B5563">
                          {item.jasa_servis?.nama_jasa_servis || "Jasa servis"}
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        <Text fz={16} c="#4B5563">
                          {qty}
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        <Text fz={16} c="#4B5563">
                          {formatRupiah(harga)}
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        <Text fw={700} fz={16} c="#2B2B2B">
                          {formatRupiah(subtotal)}
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        <UnstyledButton
                          disabled={!canModifyDetail || loadingAction !== null}
                          onClick={() => onHapusJasa(item.id)}
                        >
                          <Text c="#D32F2F" fw={700}>
                            ×
                          </Text>
                        </UnstyledButton>
                      </Table.Td>
                    </Table.Tr>
                  );
                })
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text ta="center" c="#9CA3AF">
                      Belum ada jasa servis.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Stack>
    </CardBox>
  );
}