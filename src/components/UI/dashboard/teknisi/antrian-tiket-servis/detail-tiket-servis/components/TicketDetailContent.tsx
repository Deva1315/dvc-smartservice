"use client";

import { Box, Button, Grid, Group, Stack, Title } from "@mantine/core";
import DiagnosaLanjutanModal from "@/components/UI/dashboard/teknisi/antrian-tiket-servis/modal/DiagnosaLanjutanModal";
import TicketCostSummary from "./TicketCostSummary";
import TicketDiagnosaCard from "./TicketDiagnosaCard";
import TicketJasaSection from "./TicketJasaSection";
import TicketSparepartSection from "./TicketSparepartSection";
import {
  CustomerInfoCard,
  DeviceInfoCard,
  TechnicianActionCard,
  TicketStatusHistoryCard,
  TicketTextCard,
} from "./TicketInfoCards";
import type {
  DetailTiketServisApiItem,
  StatusServis,
} from "@/lib/teknisi/teknisi-tiket-servis.client";
import type {
  DetailTiketServisDetailItem,
  LatestDiagnosa,
  LoadingAction,
  MasterOption,
} from "@/types/detail-tiket-servis-type";
import {
  formatDisplayDateTime,
  getReferensiSolusiAwal,
} from "@/utils/detail-tiket-servis-teknisi/detail-tiket-servis.utils";

type TicketDetailContentProps = {
  detail: DetailTiketServisApiItem;
  statusServis: StatusServis | null;
  estimasiWaktu: Date | null;
  jasaMasterOptions: MasterOption[];
  sparepartMasterOptions: MasterOption[];
  openedDiagnosaModal: boolean;
  loadingAction: LoadingAction;
  jasaServis: DetailTiketServisDetailItem[];
  sparepartDigunakan: DetailTiketServisDetailItem[];
  totalJasa: number;
  totalSparepart: number;
  totalEstimasi: number;
  latestDiagnosa: LatestDiagnosa;
  dropPointDisplay: string;
  perangkatDisplay: string;
  isStatusEditable: boolean;
  canModifyDetail: boolean;
  currentAllowedStatusOptions: {
    value: StatusServis;
    label: string;
  }[];
  onBack: () => void;
  onStatusServisChange: (value: StatusServis | null) => void;
  onEstimasiWaktuChange: (value: Date | null) => void;
  onOpenDiagnosaModal: () => void;
  onCloseDiagnosaModal: () => void;
  onUpdateStatus: () => void;
  onSaveDiagnosa: (payload: {
    diagnosaLanjutan: string;
    catatanTeknisi: string;
  }) => Promise<boolean> | boolean;
  onTambahJasa: (itemId: string) => void;
  onHapusJasa: (detailId: string) => void;
  onTambahSparepart: (itemId: string) => void;
  onHapusSparepart: (detailId: string) => void;
};

export default function TicketDetailContent({
  detail,
  statusServis,
  estimasiWaktu,
  jasaMasterOptions,
  sparepartMasterOptions,
  openedDiagnosaModal,
  loadingAction,
  jasaServis,
  sparepartDigunakan,
  totalJasa,
  totalSparepart,
  totalEstimasi,
  latestDiagnosa,
  dropPointDisplay,
  perangkatDisplay,
  isStatusEditable,
  canModifyDetail,
  currentAllowedStatusOptions,
  onBack,
  onStatusServisChange,
  onEstimasiWaktuChange,
  onOpenDiagnosaModal,
  onCloseDiagnosaModal,
  onUpdateStatus,
  onSaveDiagnosa,
  onTambahJasa,
  onHapusJasa,
  onTambahSparepart,
  onHapusSparepart,
}: TicketDetailContentProps) {
  return (
    <>
      <Stack gap={18}>
        <Group justify="space-between" align="center">
          <Title order={1} fw={800} c="#000000">
            Detail Tiket Servis
          </Title>

          <Button variant="light" color="gray" radius="xl" onClick={onBack}>
            Kembali
          </Button>
        </Group>

        <Box
          p="md"
          style={{
            backgroundColor: "#F2F2F6",
            borderRadius: 16,
            border: "1px solid #E8E8EF",
          }}
        >
          <Grid gap="md">
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <CustomerInfoCard detail={detail} />
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 4 }}>
              <DeviceInfoCard
                detail={detail}
                perangkatDisplay={perangkatDisplay}
                dropPointDisplay={dropPointDisplay}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 4 }}>
              <TechnicianActionCard
                detail={detail}
                statusServis={statusServis}
                estimasiWaktu={estimasiWaktu}
                statusOptions={currentAllowedStatusOptions}
                isStatusEditable={isStatusEditable}
                loadingAction={loadingAction}
                onStatusChange={onStatusServisChange}
                onEstimasiWaktuChange={onEstimasiWaktuChange}
                onSave={onUpdateStatus}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 8 }}>
              <TicketTextCard title="Keluhan Pelanggan" value={detail.keluhan} />
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 4 }}>
              <TicketStatusHistoryCard detail={detail} />
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 8 }}>
              <TicketTextCard
                title="Referensi Solusi Awal"
                value={getReferensiSolusiAwal(detail)}
                preserveLineBreak
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 5 }}>
              <TicketDiagnosaCard
                latestDiagnosa={latestDiagnosa}
                canModifyDetail={canModifyDetail}
                loadingAction={loadingAction}
                onOpenDiagnosaModal={onOpenDiagnosaModal}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 4 }}>
              <TicketSparepartSection
                sparepartMasterOptions={sparepartMasterOptions}
                sparepartDigunakan={sparepartDigunakan}
                canModifyDetail={canModifyDetail}
                loadingAction={loadingAction}
                onTambahSparepart={onTambahSparepart}
                onHapusSparepart={onHapusSparepart}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 3 }}>
              <TicketCostSummary
                totalJasa={totalJasa}
                totalSparepart={totalSparepart}
                estimasiWaktuText={formatDisplayDateTime(detail.estimasi_waktu)}
                totalEstimasi={totalEstimasi}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <TicketJasaSection
                jasaMasterOptions={jasaMasterOptions}
                jasaServis={jasaServis}
                canModifyDetail={canModifyDetail}
                loadingAction={loadingAction}
                onTambahJasa={onTambahJasa}
                onHapusJasa={onHapusJasa}
              />
            </Grid.Col>
          </Grid>
        </Box>
      </Stack>

      <DiagnosaLanjutanModal
        opened={openedDiagnosaModal}
        onClose={onCloseDiagnosaModal}
        noTiket={detail.nomor_tiket}
        pelanggan={detail.nama_cust}
        perangkat={perangkatDisplay}
        statusSaatIni={detail.status_servis}
        initialDiagnosaLanjutan={latestDiagnosa?.hasil_diagnosa || ""}
        initialCatatanTeknisi={latestDiagnosa?.catatan_teknisi || ""}
        onSave={onSaveDiagnosa}
      />
    </>
  );
}