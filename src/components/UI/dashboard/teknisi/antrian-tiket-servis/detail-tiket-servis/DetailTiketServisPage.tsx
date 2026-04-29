/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useParams, useRouter } from "next/navigation";
import TicketDetailContent from "./components/TicketDetailContent";
import {
  TicketDetailLoadingState,
  TicketDetailNotFoundState,
} from "./components/TicketStateView";
import { getCurrentSession } from "@/lib/auth/auth.client";
import { getJasaServis } from "@/lib/admin-penjualan/admin-penjualan-jasa-servis.client";
import { getSparepart } from "@/lib/admin-gudang/admin-gudang-sparepart.client";
import {
  createDiagnosaLanjutan,
  getDetailTiketServis,
  hapusJasaDariTiket,
  hapusSparepartDariTiket,
  tambahJasaKeTiket,
  tambahSparepartKeTiket,
  updateStatusTiketServis,
  type DetailTiketServisApiItem,
  type StatusServis,
} from "@/lib/teknisi/teknisi-tiket-servis.client";
import type { LoadingAction, MasterOption } from "@/types/detail-tiket-servis-type";
import {
  allowedNextStatus,
  getDropPointDisplay,
  getPerangkatDisplay,
  isSameDateTime,
  mapJasaMasterOptions,
  mapSparepartMasterOptions,
  statusServisOptions,
  toDateValue,
  toIsoDateTime,
  toNumber,
} from "@/utils/detail-tiket-servis-teknisi/detail-tiket-servis.utils";

export default function DetailTiketServisPage() {
  const params = useParams();
  const router = useRouter();

  const nomorTiketParam =
    typeof params?.id === "string" ? decodeURIComponent(params.id) : "";

  const [estimasiWaktu, setEstimasiWaktu] = useState<Date | null>(null);
  const [detail, setDetail] = useState<DetailTiketServisApiItem | null>(null);
  const [statusServis, setStatusServis] = useState<StatusServis | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [jasaMasterOptions, setJasaMasterOptions] = useState<MasterOption[]>([]);
  const [sparepartMasterOptions, setSparepartMasterOptions] = useState<
    MasterOption[]
  >([]);
  const [openedDiagnosaModal, setOpenedDiagnosaModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);

  async function fetchDetail() {
    const result = await getDetailTiketServis(nomorTiketParam);
    const nextDetail = result.data as DetailTiketServisApiItem;

    setDetail(nextDetail);
    setStatusServis(nextDetail.status_servis);
    setEstimasiWaktu(toDateValue(nextDetail.estimasi_waktu));

    return nextDetail;
  }

  async function fetchInitialData() {
    if (!nomorTiketParam) {
      setDetail(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadingAction("fetch");

      const [detailResult, jasaResult, sparepartResult, sessionResult] =
        await Promise.all([
          getDetailTiketServis(nomorTiketParam),
          getJasaServis(),
          getSparepart(),
          getCurrentSession().catch(() => null),
        ]);

      const nextDetail = detailResult.data as DetailTiketServisApiItem;

      setDetail(nextDetail);
      setStatusServis(nextDetail.status_servis);
      setEstimasiWaktu(toDateValue(nextDetail.estimasi_waktu));
      setJasaMasterOptions(mapJasaMasterOptions(jasaResult.data || []));
      setSparepartMasterOptions(
        mapSparepartMasterOptions(sparepartResult.data || [])
      );

      if (sessionResult?.success && sessionResult.authenticated) {
        setCurrentUserId(sessionResult.user.id);
      }
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal memuat detail tiket servis.",
        color: "red",
      });

      setDetail(null);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  }

  useEffect(() => {
    fetchInitialData();
  }, [nomorTiketParam]);

  const jasaServis = useMemo(() => {
    return (
      detail?.detail_tiket_servis.filter((item) => item.id_jasa_servis) || []
    );
  }, [detail]);

  const sparepartDigunakan = useMemo(() => {
    return (
      detail?.detail_tiket_servis.filter((item) => item.id_sparepart) || []
    );
  }, [detail]);

  const totalJasa = useMemo(() => {
    return jasaServis.reduce((total, item) => {
      const subtotal = toNumber(item.subtotal);

      if (subtotal > 0) {
        return total + subtotal;
      }

      return total + toNumber(item.jumlah) * toNumber(item.harga);
    }, 0);
  }, [jasaServis]);

  const totalSparepart = useMemo(() => {
    return sparepartDigunakan.reduce((total, item) => {
      const subtotal = toNumber(item.subtotal);

      if (subtotal > 0) {
        return total + subtotal;
      }

      return total + toNumber(item.jumlah) * toNumber(item.harga);
    }, 0);
  }, [sparepartDigunakan]);

  const totalEstimasi = useMemo(() => {
    if (!detail) return 0;

    if (detail.estimasi_biaya !== null && detail.estimasi_biaya !== undefined) {
      return toNumber(detail.estimasi_biaya);
    }

    return totalJasa + totalSparepart;
  }, [detail, totalJasa, totalSparepart]);

  const latestDiagnosa = detail?.diagnosa_lanjutan?.[0] || null;
  const dropPointDisplay = detail ? getDropPointDisplay(detail) : "-";
  const perangkatDisplay = detail ? getPerangkatDisplay(detail) : "-";

  const isStatusEditable =
    detail?.status_verifikasi === "Diterima" &&
    detail.status_servis !== "Selesai" &&
    detail.status_servis !== "Diambil" &&
    detail.status_servis !== "Dibatalkan";

  const canModifyDetail =
    detail?.status_verifikasi === "Diterima" &&
    (detail.status_servis === "Diproses" ||
      detail.status_servis === "Menunggu_Sparepart");

  const currentAllowedStatusOptions = useMemo(() => {
    if (!detail) return statusServisOptions;

    const nextStatuses = allowedNextStatus[detail.status_servis] || [];

    return statusServisOptions.filter(
      (item) =>
        item.value === detail.status_servis || nextStatuses.includes(item.value)
    );
  }, [detail]);

  function handleBack() {
    router.push("/teknisi/antrian-tiket-servis");
  }

  async function handleUpdateStatus() {
    if (!detail || !statusServis) return;

    if (!isStatusEditable) {
      notifications.show({
        title: "Gagal",
        message: "Status servis hanya bisa diubah jika tiket masih aktif.",
        color: "red",
      });
      return;
    }

    const isStatusChanged = statusServis !== detail.status_servis;
    const isEstimasiChanged = !isSameDateTime(
      estimasiWaktu,
      detail.estimasi_waktu
    );

    if (!isStatusChanged && !isEstimasiChanged) {
      notifications.show({
        title: "Gagal",
        message: "Tidak ada perubahan status atau estimasi waktu.",
        color: "red",
      });
      return;
    }

    const estimasiWaktuIso = toIsoDateTime(estimasiWaktu);

    if (estimasiWaktu && !estimasiWaktuIso) {
      notifications.show({
        title: "Gagal",
        message: "Estimasi waktu harus berupa tanggal dan jam yang valid.",
        color: "red",
      });
      return;
    }

    try {
      setLoadingAction("status");

      await updateStatusTiketServis(nomorTiketParam, {
        status_servis: statusServis,
        estimasi_waktu: statusServis === "Dibatalkan" ? null : estimasiWaktuIso,
      });

      await fetchDetail();

      notifications.show({
        title: "Berhasil",
        message:
          statusServis === "Dibatalkan"
            ? "Tiket berhasil dibatalkan dan stok sparepart dikembalikan."
            : "Status dan estimasi waktu servis berhasil diperbarui.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal memperbarui status dan estimasi waktu tiket servis.",
        color: "red",
      });
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleSaveDiagnosa(payload: {
    diagnosaLanjutan: string;
    catatanTeknisi: string;
  }) {
    if (!currentUserId) {
      notifications.show({
        title: "Gagal",
        message: "Session teknisi tidak ditemukan. Silakan login ulang.",
        color: "red",
      });
      return false;
    }

    try {
      setLoadingAction("diagnosa");

      await createDiagnosaLanjutan(nomorTiketParam, {
        id_user: currentUserId,
        hasil_diagnosa: payload.diagnosaLanjutan,
        catatan_teknisi: payload.catatanTeknisi || null,
      });

      await fetchDetail();

      notifications.show({
        title: "Berhasil",
        message: "Diagnosa lanjutan teknisi berhasil disimpan.",
        color: "green",
      });

      return true;
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan diagnosa lanjutan.",
        color: "red",
      });

      return false;
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleTambahJasa(itemId: string) {
    if (!canModifyDetail) {
      notifications.show({
        title: "Gagal",
        message:
          "Jasa hanya bisa ditambahkan saat status servis Diproses atau Menunggu Sparepart.",
        color: "red",
      });
      return;
    }

    try {
      setLoadingAction("tambah-jasa");

      await tambahJasaKeTiket(nomorTiketParam, {
        id_jasa_servis: itemId,
        jumlah: 1,
      });

      await fetchDetail();

      notifications.show({
        title: "Berhasil",
        message: "Jasa servis berhasil ditambahkan.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menambahkan jasa servis.",
        color: "red",
      });
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleTambahSparepart(itemId: string) {
    if (!canModifyDetail) {
      notifications.show({
        title: "Gagal",
        message:
          "Sparepart hanya bisa ditambahkan saat status servis Diproses atau Menunggu Sparepart.",
        color: "red",
      });
      return;
    }

    try {
      setLoadingAction("tambah-sparepart");

      await tambahSparepartKeTiket(nomorTiketParam, {
        id_sparepart: itemId,
        jumlah: 1,
      });

      await fetchDetail();

      notifications.show({
        title: "Berhasil",
        message: "Sparepart berhasil ditambahkan ke tiket.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menambahkan sparepart ke tiket.",
        color: "red",
      });
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleHapusJasa(detailId: string) {
    try {
      setLoadingAction("hapus-jasa");

      await hapusJasaDariTiket(nomorTiketParam, detailId);
      await fetchDetail();

      notifications.show({
        title: "Berhasil",
        message: "Jasa servis berhasil dihapus dari tiket.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menghapus jasa servis.",
        color: "red",
      });
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleHapusSparepart(detailId: string) {
    try {
      setLoadingAction("hapus-sparepart");

      await hapusSparepartDariTiket(nomorTiketParam, detailId);
      await fetchDetail();

      notifications.show({
        title: "Berhasil",
        message: "Sparepart berhasil dihapus dan stok dikembalikan.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menghapus sparepart.",
        color: "red",
      });
    } finally {
      setLoadingAction(null);
    }
  }

  if (isLoading) {
    return <TicketDetailLoadingState />;
  }

  if (!detail) {
    return <TicketDetailNotFoundState onBack={handleBack} />;
  }

  return (
    <TicketDetailContent
      detail={detail}
      statusServis={statusServis}
      estimasiWaktu={estimasiWaktu}
      jasaMasterOptions={jasaMasterOptions}
      sparepartMasterOptions={sparepartMasterOptions}
      openedDiagnosaModal={openedDiagnosaModal}
      loadingAction={loadingAction}
      jasaServis={jasaServis}
      sparepartDigunakan={sparepartDigunakan}
      totalJasa={totalJasa}
      totalSparepart={totalSparepart}
      totalEstimasi={totalEstimasi}
      latestDiagnosa={latestDiagnosa}
      dropPointDisplay={dropPointDisplay}
      perangkatDisplay={perangkatDisplay}
      isStatusEditable={isStatusEditable}
      canModifyDetail={canModifyDetail}
      currentAllowedStatusOptions={currentAllowedStatusOptions}
      onBack={handleBack}
      onStatusServisChange={setStatusServis}
      onEstimasiWaktuChange={setEstimasiWaktu}
      onOpenDiagnosaModal={() => setOpenedDiagnosaModal(true)}
      onCloseDiagnosaModal={() => setOpenedDiagnosaModal(false)}
      onUpdateStatus={handleUpdateStatus}
      onSaveDiagnosa={handleSaveDiagnosa}
      onTambahJasa={handleTambahJasa}
      onHapusJasa={handleHapusJasa}
      onTambahSparepart={handleTambahSparepart}
      onHapusSparepart={handleHapusSparepart}
    />
  );
}