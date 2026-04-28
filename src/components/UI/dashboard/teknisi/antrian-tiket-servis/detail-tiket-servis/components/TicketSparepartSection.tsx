"use client";

import {
  Button,
  Divider,
  Group,
  Menu,
  Stack,
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

type TicketSparepartSectionProps = {
  sparepartMasterOptions: MasterOption[];
  sparepartDigunakan: DetailItem[];
  canModifyDetail: boolean;
  loadingAction: string | null;
  onTambahSparepart: (itemId: string) => void;
  onHapusSparepart: (detailId: string) => void;
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

export default function TicketSparepartSection({
  sparepartMasterOptions,
  sparepartDigunakan,
  canModifyDetail,
  loadingAction,
  onTambahSparepart,
  onHapusSparepart,
}: TicketSparepartSectionProps) {
  return (
    <CardBox>
      <Stack gap={14}>
        <Group justify="space-between" align="center">
          <CardSectionTitle>Sparepart Digunakan</CardSectionTitle>

          <Menu shadow="md" width={280} withinPortal={false}>
            <Menu.Target>
              <Button
                size="xs"
                radius="md"
                leftSection={<IconPlus size={14} />}
                disabled={!canModifyDetail || loadingAction !== null}
                loading={loadingAction === "tambah-sparepart"}
                style={{
                  backgroundColor: "#0D4CB5",
                }}
              >
                Tambah
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              {sparepartMasterOptions.length > 0 ? (
                sparepartMasterOptions.map((item) => (
                  <Menu.Item
                    key={item.value}
                    onClick={() => onTambahSparepart(item.value)}
                    disabled={(item.stock ?? 0) <= 0}
                  >
                    <Stack gap={2}>
                      <Text fz={14}>{item.label}</Text>
                      <Text fz={12} c="dimmed">
                        Stok: {item.stock ?? 0} • {formatRupiah(item.harga)}
                      </Text>
                    </Stack>
                  </Menu.Item>
                ))
              ) : (
                <Menu.Item disabled>Belum ada data sparepart</Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Divider color="#ECECF3" />

        {sparepartDigunakan.length > 0 ? (
          <Stack gap={10}>
            {sparepartDigunakan.map((item) => {
              const qty = toNumber(item.jumlah);
              const harga = toNumber(item.harga);
              const subtotal = toNumber(item.subtotal) || qty * harga;

              return (
                <Group
                  key={item.id}
                  justify="space-between"
                  align="center"
                  wrap="nowrap"
                >
                  <Stack gap={2} style={{ minWidth: 0 }}>
                    <Text fw={600} fz={16} c="#4B5563">
                      {item.sparepart?.nama_sparepart || "Sparepart"}
                    </Text>
                    <Text fz={14} c="#6B7280">
                      Qty {qty}
                    </Text>
                  </Stack>

                  <Group gap={8} wrap="nowrap">
                    <Text fz={16} c="#4B5563">
                      {formatRupiah(subtotal)}
                    </Text>

                    <UnstyledButton
                      disabled={!canModifyDetail || loadingAction !== null}
                      onClick={() => onHapusSparepart(item.id)}
                    >
                      <Text c="#D32F2F" fw={700}>
                        ×
                      </Text>
                    </UnstyledButton>
                  </Group>
                </Group>
              );
            })}
          </Stack>
        ) : (
          <Text fz={16} c="#9CA3AF">
            Belum ada sparepart yang digunakan.
          </Text>
        )}
      </Stack>
    </CardBox>
  );
}