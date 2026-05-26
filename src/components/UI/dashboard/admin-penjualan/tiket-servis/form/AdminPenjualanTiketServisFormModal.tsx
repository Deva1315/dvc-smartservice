"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Box, Button, Group, Modal, Stack } from "@mantine/core";
import {
  adminPenjualanTiketServisFormSchema,
  validateWithZod,
} from "@/lib/validations";
import {
  adminPenjualanTiketServisInitialForm,
  type AdminPenjualanTicketRow,
  type AdminPenjualanTiketServisFormModalProps,
  type AdminPenjualanTiketServisFormState,
} from "@/types/admin-penjualan-tiket-servis-form.types";
import {
  toAdminPenjualanTiketServisDate,
  toAdminPenjualanTiketServisInputDateString,
} from "@/utils/admin-penjualan/admin-penjualan-tiket-servis-form.helpers";
import AdminPenjualanTiketServisInfoSection from "./AdminPenjualanTiketServisInfoSection";
import AdminPenjualanTiketServisCustomerSection from "./AdminPenjualanTiketServisCustomerSection";
import AdminPenjualanTiketServisDropPointSection from "./AdminPenjualanTiketServisDropPointSection";
import AdminPenjualanTiketServisDeviceSection from "./AdminPenjualanTiketServisDeviceSection";

export default function AdminPenjualanTiketServisFormModal({
  opened,
  onClose,
  formType,
  nomorTiket,
  tanggalMasuk,
  dropPointOptions,
  initialData = null,
  onSubmit,
}: AdminPenjualanTiketServisFormModalProps) {
  const [form, setForm] = useState<AdminPenjualanTiketServisFormState>(
    adminPenjualanTiketServisInitialForm
  );
  const [tanggal, setTanggal] = useState<string | null>(
    toAdminPenjualanTiketServisInputDateString(tanggalMasuk)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!opened) {
      return;
    }

    setErrors({});

    if (formType === "edit" && initialData) {
      setForm({
        nama_cust: initialData.nama_cust,
        phone_cust: initialData.phone_cust,
        alamat_cust: initialData.alamat_cust,
        jenis_perangkat: initialData.jenis_perangkat,
        merk_perangkat: initialData.merk_perangkat,
        keluhan: initialData.keluhan,
        gunakan_drop_point: initialData.gunakan_drop_point ? "ya" : "tidak",
        drop_point_id: initialData.drop_point_id,
      });

      setTanggal(
        toAdminPenjualanTiketServisInputDateString(initialData.tanggal_masuk)
      );
      return;
    }

    setForm(adminPenjualanTiketServisInitialForm);
    setTanggal(toAdminPenjualanTiketServisInputDateString(tanggalMasuk));
  }, [opened, formType, initialData, tanggalMasuk]);

  const clearFieldError = (field: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleChange = <K extends keyof AdminPenjualanTiketServisFormState>(
    key: K,
    value: AdminPenjualanTiketServisFormState[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    clearFieldError(key);
  };

  const handleDropPointRadioChange = (value: string) => {
    const nextValue = value === "ya" ? "ya" : "tidak";

    setForm((prev) => ({
      ...prev,
      gunakan_drop_point: nextValue,
      drop_point_id: nextValue === "ya" ? prev.drop_point_id : null,
    }));

    clearFieldError("gunakan_drop_point");
    clearFieldError("alamat_cust");
    clearFieldError("drop_point_id");
  };

  const handleReset = () => {
    setErrors({});

    if (formType === "edit" && initialData) {
      setForm({
        nama_cust: initialData.nama_cust,
        phone_cust: initialData.phone_cust,
        alamat_cust: initialData.alamat_cust,
        jenis_perangkat: initialData.jenis_perangkat,
        merk_perangkat: initialData.merk_perangkat,
        keluhan: initialData.keluhan,
        gunakan_drop_point: initialData.gunakan_drop_point ? "ya" : "tidak",
        drop_point_id: initialData.drop_point_id,
      });

      setTanggal(
        toAdminPenjualanTiketServisInputDateString(initialData.tanggal_masuk)
      );
      return;
    }

    setForm(adminPenjualanTiketServisInitialForm);
    setTanggal(toAdminPenjualanTiketServisInputDateString(tanggalMasuk));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = validateWithZod(adminPenjualanTiketServisFormSchema, {
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
        ? dropPointOptions.find(
            (item) => item.value === parsed.data.drop_point_id
          )?.label ?? null
        : null;

    const payload: AdminPenjualanTicketRow = {
      id: formType === "edit" && initialData ? initialData.id : undefined,
      nomor_tiket:
        formType === "edit" && initialData
          ? initialData.nomor_tiket
          : nomorTiket.trim(),
      tanggal_masuk: toAdminPenjualanTiketServisDate(
        String(parsed.data.tanggal_masuk)
      ),
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
              <AdminPenjualanTiketServisInfoSection
                displayNoTiket={displayNoTiket}
                tanggal={tanggal}
                setTanggal={setTanggal}
                clearFieldError={clearFieldError}
                errors={errors}
                isSubmitting={isSubmitting}
              />

              <AdminPenjualanTiketServisCustomerSection
                form={form}
                errors={errors}
                isSubmitting={isSubmitting}
                handleChange={handleChange}
              />

              <AdminPenjualanTiketServisDropPointSection
                form={form}
                errors={errors}
                isSubmitting={isSubmitting}
                dropPointOptions={dropPointOptions}
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

              <AdminPenjualanTiketServisDeviceSection
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