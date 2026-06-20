"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Box, Button, Group, Modal, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { getNearestPublicDropPointListRequest } from "@/lib/public/public-drop-point.client";
import { getDiagnosaAiDetail } from "@/lib/diagnosa-ai/diagnosa-ai.client";
import {
  publicTiketServisFormSchema,
  validateWithZod,
} from "@/lib/validations";
import TiketServisInfoSection from "./TiketServisInfoSection";
import TiketServisCustomerSection from "./TiketServisCustomerSection";
import TiketServisDropPointSection from "./TiketServisDropPointSection";
import TiketServisDeviceSection from "./TiketServisDeviceSection";
import {
  initialForm,
  type FormState,
  type TicketDropPointOption,
  type TicketRow,
  type TiketServisFormModalProps,
} from "@/types/tiket-servis-form.types";
import {
  buildDropPointLabel,
  normalizeDropPointDistanceKm,
  toDate,
  toInputDateString,
} from "@/utils/public/tiket-servis-form.helpers";

export default function TiketServisFormModal({
  opened,
  onClose,
  formType,
  nomorTiket,
  tanggalMasuk,
  dropPointOptions,
  initialData = null,
  diagnosaAiId = null,
  onSubmit,
}: TiketServisFormModalProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [tanggal, setTanggal] = useState<string | null>(
    toInputDateString(tanggalMasuk)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDistance, setIsLoadingDistance] = useState(false);
  const [distanceMessage, setDistanceMessage] = useState("");
  const [displayDropPointOptions, setDisplayDropPointOptions] = useState<
    TicketDropPointOption[]
  >([]);

  useEffect(() => {
    setDisplayDropPointOptions(dropPointOptions);
  }, [dropPointOptions]);

  useEffect(() => {
    if (!opened) {
      return;
    }

    setErrors({});
    setDistanceMessage("");

    if (formType === "edit" && initialData) {
      setForm({
        id_diagnosa_ai: initialData.id_diagnosa_ai ?? null,
        diagnosa_awal_kerusakan: initialData.diagnosa_awal_kerusakan ?? "",
        nama_cust: initialData.nama_cust,
        phone_cust: initialData.phone_cust,
        alamat_cust: initialData.alamat_cust,
        jenis_perangkat: initialData.jenis_perangkat,
        merk_perangkat: initialData.merk_perangkat,
        keluhan: initialData.keluhan,
        gunakan_drop_point: initialData.gunakan_drop_point ? "ya" : "tidak",
        drop_point_id: initialData.drop_point_id,
      });

      setTanggal(toInputDateString(initialData.tanggal_masuk));
      return;
    }

    setForm(initialForm);
    setTanggal(toInputDateString(tanggalMasuk));
  }, [opened, formType, initialData, tanggalMasuk]);

  useEffect(() => {
    if (!opened || formType !== "create" || !diagnosaAiId) {
      return;
    }

    let isMounted = true;

    async function loadDiagnosaAiPrefill() {
      const result = await getDiagnosaAiDetail(diagnosaAiId ?? "");

      if (!isMounted) {
        return;
      }

      if (!result.success) {
        notifications.show({
          title: "Gagal",
          message: result.message,
          color: "red",
        });

        return;
      }

      setForm((prev) => ({
        ...prev,
        id_diagnosa_ai: result.data.id,
        diagnosa_awal_kerusakan: result.data.diagnosa_awal_kerusakan ?? "",
        keluhan: prev.keluhan || result.data.gejala || "",
      }));
    }

    void loadDiagnosaAiPrefill();

    return () => {
      isMounted = false;
    };
  }, [opened, formType, diagnosaAiId]);

  const selectDropPointData = useMemo(() => {
    return displayDropPointOptions.map((item) => ({
      value: item.value,
      label: buildDropPointLabel(item),
    }));
  }, [displayDropPointOptions]);

  const clearFieldError = (field: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleChange = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    clearFieldError(key);
  };

  async function handleCalculateNearestDropPoint(alamatCustomer: string) {
    const cleanAddress = alamatCustomer.trim();

    if (!cleanAddress) {
      setDisplayDropPointOptions(dropPointOptions);
      setDistanceMessage(
        "Isi alamat customer terlebih dahulu agar sistem dapat menghitung drop point terdekat."
      );

      setForm((prev) => ({
        ...prev,
        drop_point_id: null,
      }));

      return;
    }

    try {
      setIsLoadingDistance(true);
      setDistanceMessage("Menghitung jarak drop point dari alamat customer...");

      const result = await getNearestPublicDropPointListRequest({
        alamatCustomer: cleanAddress,
      });

      if (!result.success) {
        setDisplayDropPointOptions(dropPointOptions);
        setDistanceMessage(result.message);
        return;
      }

      const nearestOptions: TicketDropPointOption[] = result.dropPoints.map(
        (item) => {
          const jarakKm = normalizeDropPointDistanceKm(item.jarak_km);
          const jarakLabel = item.jarak_label ?? null;

          return {
            value: String(item.id),
            label: jarakLabel
              ? `${item.nama_drop_point} — ${jarakLabel}`
              : item.nama_drop_point,
            originalLabel: item.nama_drop_point,
            alamat: item.alamat,
            jarakKm,
            jarakLabel,
          };
        }
      );

      setDisplayDropPointOptions(nearestOptions);

      setForm((prev) => {
        const currentDropPointStillExists = nearestOptions.some(
          (item) => item.value === prev.drop_point_id
        );

        return {
          ...prev,
          gunakan_drop_point: "ya",
          drop_point_id: currentDropPointStillExists ? prev.drop_point_id : null,
        };
      });

      setErrors((prev) => ({
        ...prev,
        alamat_cust: "",
        drop_point_id: "",
        gunakan_drop_point: "",
      }));

      setDistanceMessage(
        "Drop point berhasil diurutkan berdasarkan alamat customer."
      );
    } catch (error) {
      console.error("CALCULATE NEAREST DROP POINT ERROR:", error);

      setDisplayDropPointOptions(dropPointOptions);
      setDistanceMessage(
        "Jarak drop point gagal dihitung. Silakan pilih drop point secara manual."
      );
    } finally {
      setIsLoadingDistance(false);
    }
  }

  const handleDropPointRadioChange = async (value: string) => {
    const nextValue = value === "ya" ? "ya" : "tidak";

    setDistanceMessage("");
    clearFieldError("gunakan_drop_point");

    setForm((prev) => ({
      ...prev,
      gunakan_drop_point: nextValue,
      drop_point_id: nextValue === "ya" ? prev.drop_point_id : null,
    }));

    if (nextValue === "ya") {
      clearFieldError("alamat_cust");
      clearFieldError("drop_point_id");
      await handleCalculateNearestDropPoint(form.alamat_cust);
    }

    if (nextValue === "tidak") {
      clearFieldError("alamat_cust");
      clearFieldError("drop_point_id");
      setDisplayDropPointOptions(dropPointOptions);
    }
  };

  const handleReset = () => {
    setErrors({});
    setDistanceMessage("");
    setDisplayDropPointOptions(dropPointOptions);

    if (formType === "edit" && initialData) {
      setForm({
        id_diagnosa_ai: initialData.id_diagnosa_ai ?? null,
        diagnosa_awal_kerusakan: initialData.diagnosa_awal_kerusakan ?? "",
        nama_cust: initialData.nama_cust,
        phone_cust: initialData.phone_cust,
        alamat_cust: initialData.alamat_cust,
        jenis_perangkat: initialData.jenis_perangkat,
        merk_perangkat: initialData.merk_perangkat,
        keluhan: initialData.keluhan,
        gunakan_drop_point: initialData.gunakan_drop_point ? "ya" : "tidak",
        drop_point_id: initialData.drop_point_id,
      });

      setTanggal(toInputDateString(initialData.tanggal_masuk));
      return;
    }

    setForm(initialForm);
    setTanggal(toInputDateString(tanggalMasuk));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = validateWithZod(publicTiketServisFormSchema, {
      nomor_tiket:
        formType === "edit" && initialData
          ? initialData.nomor_tiket
          : nomorTiket,
      tanggal_masuk: tanggal,
      ...form,
    });

    if (!parsed.success) {
      setErrors(parsed.errors);
      return;
    }

    setErrors({});

    if (formType === "create" && !nomorTiket.trim()) {
      setErrors((prev) => ({
        ...prev,
        nomor_tiket: "Nomor tiket sedang disiapkan. Mohon tunggu sebentar.",
      }));
      return;
    }

    const selectedDropPoint =
      parsed.data.gunakan_drop_point === "ya"
        ? displayDropPointOptions.find(
            (item) => item.value === parsed.data.drop_point_id
          )?.originalLabel ??
          dropPointOptions.find(
            (item) => item.value === parsed.data.drop_point_id
          )?.label ??
          null
        : null;

    const payload: TicketRow = {
      id: formType === "edit" && initialData ? initialData.id : undefined,
      id_diagnosa_ai: parsed.data.id_diagnosa_ai ?? null,
      diagnosa_awal_kerusakan: parsed.data.diagnosa_awal_kerusakan ?? null,
      nomor_tiket:
        formType === "edit" && initialData
          ? initialData.nomor_tiket
          : nomorTiket.trim(),
      tanggal_masuk: toDate(String(parsed.data.tanggal_masuk)),
      nama_cust: parsed.data.nama_cust,
      phone_cust: parsed.data.phone_cust,
      alamat_cust: parsed.data.alamat_cust ?? "",
      jenis_perangkat: parsed.data.jenis_perangkat,
      merk_perangkat: parsed.data.merk_perangkat,
      keluhan: parsed.data.keluhan,
      gunakan_drop_point: parsed.data.gunakan_drop_point === "ya",
      drop_point_id:
        parsed.data.gunakan_drop_point === "ya"
          ? parsed.data.drop_point_id ?? null
          : null,
      drop_point_nama: selectedDropPoint,
      status_verifikasi:
        formType === "edit" && initialData
          ? initialData.status_verifikasi
          : "Menunggu",
      status_servis:
        formType === "edit" && initialData
          ? initialData.status_servis
          : "Belum Diproses",
    };

    try {
      setIsSubmitting(true);

      const success = await onSubmit(payload, formType);

      if (!success) {
        return;
      }

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle =
    formType === "create" ? "Buat Tiket Servis" : "Edit Tiket Servis";

  const submitLabel = formType === "create" ? "Simpan Tiket" : "Update Tiket";

  const displayNoTiket =
    formType === "edit" && initialData
      ? initialData.nomor_tiket
      : nomorTiket || "Menyiapkan nomor tiket...";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="xl"
      radius="xl"
      closeOnClickOutside={!isSubmitting}
      zIndex={2000}
      styles={{
        content: {
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
        },
        header: {
          backgroundColor: "#FFFFFF",
          padding: "26px 30px 10px",
          borderBottom: "1px solid #F1F5F9",
        },
        body: {
          padding: 0,
          backgroundColor: "#FFFFFF",
        },
        title: {
          color: "#111827",
          fontWeight: 800,
          fontSize: 24,
          lineHeight: 1.2,
        },
        close: {
          color: "#6B7280",
        },
      }}
      title={modalTitle}
    >
      <Box
        style={{
          maxHeight: "calc(100vh - 150px)",
          overflowY: "auto",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Box px={{ base: 20, sm: 30 }} py={26}>
          <form onSubmit={handleSubmit}>
            <Stack gap={30}>
              <TiketServisInfoSection
                displayNoTiket={displayNoTiket}
                tanggal={tanggal}
                setTanggal={setTanggal}
                clearFieldError={clearFieldError}
                errors={errors}
                isSubmitting={isSubmitting}
              />

              <TiketServisCustomerSection
                form={form}
                errors={errors}
                isSubmitting={isSubmitting}
                handleChange={handleChange}
                handleCalculateNearestDropPoint={handleCalculateNearestDropPoint}
              />

              <TiketServisDropPointSection
                form={form}
                errors={errors}
                isSubmitting={isSubmitting}
                isLoadingDistance={isLoadingDistance}
                distanceMessage={distanceMessage}
                selectDropPointData={selectDropPointData}
                displayDropPointOptions={displayDropPointOptions}
                handleChange={handleChange}
                handleDropPointRadioChange={handleDropPointRadioChange}
              />

              <Box
                style={{
                  height: 1,
                  backgroundColor: "#E5E7EB",
                  width: "100%",
                }}
              />

              <TiketServisDeviceSection
                form={form}
                errors={errors}
                isSubmitting={isSubmitting}
                handleChange={handleChange}
              />

              <Group
                justify="flex-end"
                gap="md"
                pt={8}
                style={{
                  position: "sticky",
                  bottom: 0,
                  backgroundColor: "#FFFFFF",
                  paddingTop: 18,
                  borderTop: "1px solid #F1F5F9",
                  zIndex: 2,
                }}
              >
                <Button
                  type="button"
                  onClick={() => {
                    handleReset();
                    onClose();
                  }}
                  radius="md"
                  size="md"
                  variant="outline"
                  color="gray"
                  disabled={isSubmitting}
                  style={{
                    minWidth: 130,
                    height: 46,
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  Batal
                </Button>

                <Button
                  type="submit"
                  radius="md"
                  size="md"
                  loading={isSubmitting}
                  style={{
                    minWidth: 150,
                    height: 46,
                    backgroundColor: "#0D4CB5",
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  {submitLabel}
                </Button>
              </Group>
            </Stack>
          </form>
        </Box>
      </Box>
    </Modal>
  );
}