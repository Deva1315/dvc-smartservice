"use client";

import { Button, Divider, Group, Stack, Text } from "@mantine/core";
import { CardBox, CardSectionTitle } from "./TicketDetailShared";
import type { DetailTiketServisApiItem } from "@/lib/teknisi/teknisi-tiket-servis.client";

type LatestDiagnosa =
  DetailTiketServisApiItem["diagnosa_lanjutan"][number] | null;

type TicketDiagnosaCardProps = {
  latestDiagnosa: LatestDiagnosa;
  canModifyDetail: boolean;
  loadingAction: string | null;
  onOpenDiagnosaModal: () => void;
};

export default function TicketDiagnosaCard({
  latestDiagnosa,
  canModifyDetail,
  loadingAction,
  onOpenDiagnosaModal,
}: TicketDiagnosaCardProps) {
  return (
    <CardBox>
      <Stack gap={14}>
        <Group justify="space-between" align="center">
          <CardSectionTitle>Diagnosa Lanjutan Teknisi</CardSectionTitle>

          <Button
            size="xs"
            radius="md"
            onClick={onOpenDiagnosaModal}
            disabled={!canModifyDetail || loadingAction !== null}
            style={{
              backgroundColor: "#0D4CB5",
            }}
          >
            {latestDiagnosa ? "Edit" : "Isi Diagnosa"}
          </Button>
        </Group>

        <Divider color="#ECECF3" />

        {latestDiagnosa ? (
          <Stack gap={10}>
            <Text fw={700} fz={17} c="#224B8F">
              Diagnosa Teknisi
            </Text>

            <Text fz={16} c="#4B5563">
              {latestDiagnosa.hasil_diagnosa}
            </Text>

            {latestDiagnosa.catatan_teknisi ? (
              <Text fz={15} c="#6B7280">
                Catatan: {latestDiagnosa.catatan_teknisi}
              </Text>
            ) : null}

            {latestDiagnosa.users?.nama ? (
              <Text fz={14} c="#6B7280">
                Teknisi: {latestDiagnosa.users.nama}
              </Text>
            ) : null}
          </Stack>
        ) : (
          <Text fz={16} c="#9CA3AF">
            Belum ada diagnosa lanjutan teknisi.
          </Text>
        )}
      </Stack>
    </CardBox>
  );
}