"use client";

import {
  Badge,
  Button,
  Divider,
  Group,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {
  IconCalendarMonth,
  IconDeviceLaptop,
  IconMapPin,
  IconPhone,
  IconUser,
} from "@tabler/icons-react";
import {
  CardBox,
  CardSectionTitle,
  InfoRow,
  SimpleInfoRow,
} from "./TicketDetailShared";
import type {
  DetailTiketServisApiItem,
  StatusServis,
} from "@/lib/teknisi/teknisi-tiket-servis.client";
import type { LoadingAction } from "@/types/detail-tiket-servis-type";
import {
  formatDisplayDate,
  getStatusServisColor,
  getStatusServisLabel,
  getStatusVerifikasiColor,
  getStatusVerifikasiLabel,
  toDateValue,
} from "@/utils/detail-tiket-servis-teknisi/detail-tiket-servis.utils";

type CustomerInfoCardProps = {
  detail: DetailTiketServisApiItem;
};

type DeviceInfoCardProps = {
  detail: DetailTiketServisApiItem;
  perangkatDisplay: string;
  dropPointDisplay: string;
};

type TechnicianActionCardProps = {
  detail: DetailTiketServisApiItem;
  statusServis: StatusServis | null;
  estimasiWaktu: Date | null;
  statusOptions: {
    value: StatusServis;
    label: string;
  }[];
  isStatusEditable: boolean;
  loadingAction: LoadingAction;
  onStatusChange: (value: StatusServis | null) => void;
  onEstimasiWaktuChange: (value: Date | null) => void;
  onSave: () => void;
};

type TicketTextCardProps = {
  title: string;
  value: string;
  preserveLineBreak?: boolean;
};

type TicketStatusHistoryCardProps = {
  detail: DetailTiketServisApiItem;
};

export function CustomerInfoCard({ detail }: CustomerInfoCardProps) {
  return (
    <CardBox>
      <Stack gap={14}>
        <CardSectionTitle>Informasi Pelanggan</CardSectionTitle>
        <Divider color="#ECECF3" />

        <InfoRow icon={<IconUser size={22} />} text={detail.nama_cust} />
        <InfoRow icon={<IconPhone size={22} />} text={detail.phone_cust} />
        <InfoRow
          icon={<IconMapPin size={22} />}
          text={detail.alamat_cust || "-"}
        />
      </Stack>
    </CardBox>
  );
}

export function DeviceInfoCard({
  detail,
  perangkatDisplay,
  dropPointDisplay,
}: DeviceInfoCardProps) {
  return (
    <CardBox>
      <Stack gap={14}>
        <CardSectionTitle>Informasi Perangkat</CardSectionTitle>
        <Divider color="#ECECF3" />

        <InfoRow
          icon={<IconDeviceLaptop size={22} />}
          text={perangkatDisplay}
        />

        <SimpleInfoRow
          label="Jenis Perangkat"
          value={detail.jenis_perangkat}
        />
        <SimpleInfoRow label="Merk Perangkat" value={detail.merk_perangkat} />
        <SimpleInfoRow label="Sumber Tiket" value={detail.sumber_tiket} />
        <SimpleInfoRow label="Drop Point" value={dropPointDisplay} />
      </Stack>
    </CardBox>
  );
}

export function TechnicianActionCard({
  detail,
  statusServis,
  estimasiWaktu,
  statusOptions,
  isStatusEditable,
  loadingAction,
  onStatusChange,
  onEstimasiWaktuChange,
  onSave,
}: TechnicianActionCardProps) {
  return (
    <CardBox bg="#F7F3EB">
      <Stack gap={16}>
        <CardSectionTitle>Tindakan Teknisi</CardSectionTitle>

        <Select
          value={statusServis}
          onChange={(value) => onStatusChange((value as StatusServis) || null)}
          data={statusOptions}
          disabled={!isStatusEditable || loadingAction !== null}
          styles={{
            input: {
              height: 44,
              borderRadius: 12,
            },
          }}
        />

        <DateTimePicker
          value={estimasiWaktu}
          onChange={(value) => onEstimasiWaktuChange(toDateValue(value))}
          placeholder="Pilih estimasi selesai"
          valueFormat="DD/MM/YYYY HH:mm"
          clearable
          leftSection={<IconCalendarMonth size={18} />}
          disabled={!isStatusEditable || loadingAction !== null}
          timePickerProps={{
            withDropdown: true,
            format: "24h",
            popoverProps: {
              withinPortal: false,
            },
          }}
          styles={{
            input: {
              height: 44,
              borderRadius: 12,
            },
          }}
        />

        <Badge
          color={getStatusVerifikasiColor(detail.status_verifikasi)}
          variant="light"
          radius="xl"
          size="lg"
          w="fit-content"
        >
          Verifikasi: {getStatusVerifikasiLabel(detail.status_verifikasi)}
        </Badge>

        <Divider color="#E8DCC5" />

        <Button
          radius="md"
          onClick={onSave}
          disabled={!isStatusEditable || !statusServis || loadingAction !== null}
          loading={loadingAction === "status"}
          style={{
            backgroundColor: "#FFFFFF",
            color: "#224B8F",
            border: "1px solid #DFDFE8",
            height: 44,
          }}
        >
          Simpan Perubahan
        </Button>
      </Stack>
    </CardBox>
  );
}

export function TicketTextCard({
  title,
  value,
  preserveLineBreak = false,
}: TicketTextCardProps) {
  return (
    <CardBox>
      <Stack gap={12}>
        <CardSectionTitle>{title}</CardSectionTitle>
        <Divider color="#ECECF3" />

        <Text
          fz={17}
          c="#4B5563"
          style={{
            whiteSpace: preserveLineBreak ? "pre-line" : "normal",
          }}
        >
          • {value}
        </Text>
      </Stack>
    </CardBox>
  );
}

export function TicketStatusHistoryCard({
  detail,
}: TicketStatusHistoryCardProps) {
  return (
    <CardBox>
      <Stack gap={12}>
        <CardSectionTitle>Riwayat Status</CardSectionTitle>
        <Divider color="#ECECF3" />

        <Group justify="space-between" align="center">
          <Group gap={10} wrap="nowrap">
            <Text c="#9CA3AF" fz={22}>
              •
            </Text>
            <Text fz={16} c="#4B5563">
              Tiket Dibuat
            </Text>
          </Group>

          <Text fz={14} c="#6B7280">
            {formatDisplayDate(detail.tanggal_masuk)}
          </Text>
        </Group>

        <Group justify="space-between" align="center">
          <Group gap={10} wrap="nowrap">
            <Text c="#9CA3AF" fz={22}>
              •
            </Text>
            <Text fz={16} c="#4B5563">
              Verifikasi {detail.status_verifikasi}
            </Text>
          </Group>

          <Text fz={14} c="#6B7280">
            {formatDisplayDate(detail.tanggal_verifikasi)}
          </Text>
        </Group>

        <Group justify="space-between" align="center">
          <Group gap={10} wrap="nowrap">
            <Text c="#9CA3AF" fz={22}>
              •
            </Text>

            <Badge
              color={getStatusServisColor(detail.status_servis)}
              variant="light"
              radius="xl"
              size="lg"
            >
              {getStatusServisLabel(detail.status_servis)}
            </Badge>
          </Group>

          <Text fz={14} c="#6B7280">
            {formatDisplayDate(detail.tanggal_masuk)}
          </Text>
        </Group>
      </Stack>
    </CardBox>
  );
}