"use client";

import { Divider, Group, Stack, Text } from "@mantine/core";
import { CardBox, CardSectionTitle } from "./TicketDetailShared";
import { formatCurrency } from "@/utils/currency-format/format-currency";

type TicketCostSummaryProps = {
  totalJasa: number;
  totalSparepart: number;
  estimasiWaktuText: string;
  totalEstimasi: number;
};

function formatRupiah(value: number) {
  return formatCurrency(value, {
    locale: "id-ID",
    prefix: "Rp ",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function TicketCostSummary({
  totalJasa,
  totalSparepart,
  estimasiWaktuText,
  totalEstimasi,
}: TicketCostSummaryProps) {
  return (
    <CardBox>
      <Stack gap={12}>
        <CardSectionTitle>Estimasi Biaya</CardSectionTitle>
        <Divider color="#ECECF3" />

        <Group justify="space-between">
          <Text fz={16} c="#4B5563">
            Jasa
          </Text>
          <Text fz={16} c="#4B5563">
            {formatRupiah(totalJasa)}
          </Text>
        </Group>

        <Group justify="space-between">
          <Text fz={16} c="#4B5563">
            Total Sparepart
          </Text>
          <Text fz={16} c="#4B5563">
            {formatRupiah(totalSparepart)}
          </Text>
        </Group>

        <Group justify="space-between">
          <Text fz={16} c="#4B5563">
            Estimasi Waktu
          </Text>
          <Text fz={16} c="#4B5563" ta="right">
            {estimasiWaktuText}
          </Text>
        </Group>

        <Divider color="#ECECF3" />

        <Group justify="space-between">
          <Text fw={800} fz={18} c="#2B2B2B">
            Total Estimasi
          </Text>
          <Text fw={800} fz={18} c="#2B2B2B">
            {formatRupiah(totalEstimasi)}
          </Text>
        </Group>
      </Stack>
    </CardBox>
  );
}