"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Group,
  Modal,
  Radio,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconCalendarEvent } from "@tabler/icons-react";
import type { FormType } from "@/types/form-types";
import { getNearestPublicDropPointListRequest } from "@/lib/public/public-drop-point.client";
import {
  publicTiketServisFormSchema,
  validateWithZod,
} from "@/lib/validations";

export type TicketStatusVerifikasi = "Menunggu" | "Diterima" | "Ditolak";

export type TicketStatusServis =
  | "Belum Diproses"
  | "Diproses"
  | "Menunggu Sparepart"
  | "Selesai"
  | "Diambil"
  | "Dibatalkan";

export type TicketDropPointOption = {
  value: string;
  label: string;
  originalLabel?: string;
  alamat?: string;
  jarakKm?: number | null;
  jarakLabel?: string | null;
};

export type TicketRow = {
  id?: string;
  nomor_tiket: string;
  tanggal_masuk: Date;
  nama_cust: string;
  phone_cust: string;
  alamat_cust: string;
  jenis_perangkat: string;
  merk_perangkat: string;
  keluhan: string;
  gunakan_drop_point: boolean;
  drop_point_id: string | null;
  drop_point_nama: string | null;
  status_verifikasi: TicketStatusVerifikasi;
  status_servis: TicketStatusServis;
};

type FormState = {
  nama_cust: string;
  phone_cust: string;
  alamat_cust: string;
  jenis_perangkat: string | null;
  merk_perangkat: string;
  keluhan: string;
  gunakan_drop_point: "ya" | "tidak";
  drop_point_id: string | null;
};

const initialForm: FormState = {
  nama_cust: "",
  phone_cust: "",
  alamat_cust: "",
  jenis_perangkat: null,
  merk_perangkat: "",
  keluhan: "",
  gunakan_drop_point: "tidak",
  drop_point_id: null,
};

interface TiketServisFormModalProps {
  opened: boolean;
  onClose: () => void;
  formType: FormType;
  nomorTiket: string;
  tanggalMasuk: Date;
  dropPointOptions: TicketDropPointOption[];
  initialData?: TicketRow | null;
  onSubmit: (ticket: TicketRow, formType: FormType) => Promise<boolean>;
}

function toInputDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getDropPointDistanceLabel(item?: TicketDropPointOption | null) {
  if (!item) return null;

  if (item.jarakLabel) {
    return item.jarakLabel;
  }

  if (typeof item.jarakKm === "number" && Number.isFinite(item.jarakKm)) {
    if (item.jarakKm < 1) {
      return `${Math.round(item.jarakKm * 1000)} m`;
    }

    return `${item.jarakKm.toFixed(1)} km`;
  }

  return null;
}

function buildDropPointLabel(item: TicketDropPointOption) {
  const name = item.originalLabel || item.label;
  const distanceLabel = getDropPointDistanceLabel(item);

  if (!distanceLabel) {
    return name;
  }

  return `${name} — ${distanceLabel}`;
}

function normalizeDropPointDistanceKm(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

export default function TiketServisFormModal({
  opened,
  onClose,
  formType,
  nomorTiket,
  tanggalMasuk,
  dropPointOptions,
  initialData = null,
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
    if (!opened) return;

    setErrors({});
    setDistanceMessage("");
    setDisplayDropPointOptions(dropPointOptions);

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

      setTanggal(toInputDateString(initialData.tanggal_masuk));
      return;
    }

    setForm(initialForm);
    setTanggal(toInputDateString(tanggalMasuk));
  }, [opened, formType, initialData, tanggalMasuk, dropPointOptions]);

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

      setForm((prev) => ({
        ...prev,
        gunakan_drop_point: "ya",
        drop_point_id: nearestOptions[0]?.value || prev.drop_point_id,
      }));

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
          dropPointOptions.find((item) => item.value === parsed.data.drop_point_id)
            ?.label ??
          null
        : null;

    const payload: TicketRow = {
      id: formType === "edit" && initialData ? initialData.id : undefined,
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

  const submitLabel = formType === "create" ? "Simpan" : "Update";

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
      styles={{
        body: {
          padding: 0,
          backgroundColor: "#D9D9D9",
        },
        header: {
          backgroundColor: "#D9D9D9",
        },
      }}
      title={
        <Text fw={800} fz="xl" c="#000000">
          {modalTitle}
        </Text>
      }
    >
      <Box
        p="md"
        bg="#D9D9D9"
        style={{
          border: "1px solid #D9D9D9",
          borderRadius: 16,
        }}
      >
        <form onSubmit={handleSubmit}>
          <Stack gap={26}>
            <Text fw={800} fz="xl" c="#111111">
              Informasi Tiket
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
              <Stack gap={8}>
                <Text fw={700} c="#6B7280" size="lg">
                  No Tiket
                </Text>

                <TextInput
                  value={displayNoTiket}
                  placeholder="Nomor tiket akan dibuat otomatis setelah disimpan"
                  readOnly
                  radius={0}
                  error={errors.nomor_tiket}
                  styles={{
                    input: {
                      backgroundColor: "#EAE6E6",
                      border: errors.nomor_tiket
                        ? "1px solid #FA5252"
                        : "none",
                      height: 44,
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#6B7280",
                    },
                  }}
                />
              </Stack>

              <Stack gap={8}>
                <Text fw={700} c="#6B7280" size="lg">
                  Tanggal Masuk
                </Text>

                <DatePickerInput
                  value={tanggal}
                  onChange={(value) => {
                    setTanggal(value);
                    clearFieldError("tanggal_masuk");
                  }}
                  required
                  valueFormat="DD/MM/YYYY"
                  radius={0}
                  disabled={isSubmitting}
                  error={errors.tanggal_masuk}
                  rightSection={
                    <IconCalendarEvent size={18} stroke={1.8} color="#6B7280" />
                  }
                  styles={{
                    input: {
                      backgroundColor: "#FFFFFF",
                      border: errors.tanggal_masuk
                        ? "1px solid #FA5252"
                        : "none",
                      height: 44,
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#6B7280",
                    },
                  }}
                />
              </Stack>
            </SimpleGrid>

            <Text fw={800} fz="xl" c="#111111">
              Data Customer
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
              <Stack gap={8}>
                <Text fw={700} c="#6B7280" size="lg">
                  Nama Customer <span style={{ color: "red" }}>*</span>
                </Text>

                <TextInput
                  value={form.nama_cust}
                  onChange={(event) =>
                    handleChange("nama_cust", event.currentTarget.value)
                  }
                  radius={0}
                  disabled={isSubmitting}
                  error={errors.nama_cust}
                  styles={{
                    input: {
                      backgroundColor: "#FFFFFF",
                      border: errors.nama_cust ? "1px solid #FA5252" : "none",
                      height: 44,
                      fontSize: 18,
                      color: "#111111",
                    },
                  }}
                />
              </Stack>

              <Stack gap={8}>
                <Text fw={700} c="#6B7280" size="lg">
                  No HP <span style={{ color: "red" }}>*</span>
                </Text>

                <TextInput
                  value={form.phone_cust}
                  onChange={(event) =>
                    handleChange("phone_cust", event.currentTarget.value)
                  }
                  radius={0}
                  disabled={isSubmitting}
                  error={errors.phone_cust}
                  styles={{
                    input: {
                      backgroundColor: "#FFFFFF",
                      border: errors.phone_cust ? "1px solid #FA5252" : "none",
                      height: 44,
                      fontSize: 18,
                      color: "#111111",
                    },
                  }}
                />
              </Stack>
            </SimpleGrid>

            <Stack gap={8}>
              <Text fw={700} c="#6B7280" size="lg">
                Alamat Customer
              </Text>

              <TextInput
                value={form.alamat_cust}
                onChange={(event) =>
                  handleChange("alamat_cust", event.currentTarget.value)
                }
                onBlur={() => {
                  if (form.gunakan_drop_point === "ya") {
                    handleCalculateNearestDropPoint(form.alamat_cust);
                  }
                }}
                radius={0}
                disabled={isSubmitting}
                error={errors.alamat_cust}
                placeholder="Contoh: Jl. Smki No.22, Batubulan, Sukawati, Gianyar, Bali"
                styles={{
                  input: {
                    backgroundColor: "#FFFFFF",
                    border: errors.alamat_cust ? "1px solid #FA5252" : "none",
                    height: 44,
                    fontSize: 18,
                    color: "#111111",
                  },
                }}
              />
            </Stack>

            <Stack gap={8}>
              <Text fw={700} c="#6B7280" size="lg">
                Gunakan Drop Point? <span style={{ color: "red" }}>*</span>
              </Text>

              <Radio.Group
                value={form.gunakan_drop_point}
                onChange={handleDropPointRadioChange}
                error={errors.gunakan_drop_point}
              >
                <Group gap="xl">
                  <Radio
                    value="ya"
                    label="Ya, gunakan Drop Point"
                    color="blue"
                  />
                  <Radio value="tidak" label="Tidak" color="blue" />
                </Group>
              </Radio.Group>
            </Stack>

            {form.gunakan_drop_point === "ya" && (
              <Stack gap={10}>
                <Group justify="space-between" align="center">
                  <Text fw={700} c="#6B7280" size="lg">
                    Pilih Drop Point <span style={{ color: "red" }}>*</span>
                  </Text>

                  {isLoadingDistance ? (
                    <Text fz={13} fw={700} c="#0D4CB5">
                      Menghitung jarak...
                    </Text>
                  ) : null}
                </Group>

                <Select
                  value={form.drop_point_id}
                  onChange={(value) => handleChange("drop_point_id", value)}
                  data={selectDropPointData}
                  placeholder="Pilih drop point"
                  radius={0}
                  disabled={isSubmitting || isLoadingDistance}
                  searchable
                  error={errors.drop_point_id}
                  renderOption={({ option }) => {
                    const item = displayDropPointOptions.find(
                      (dropPoint) => dropPoint.value === option.value
                    );

                    const distanceLabel = getDropPointDistanceLabel(item);

                    return (
                      <Group
                        justify="space-between"
                        w="100%"
                        wrap="nowrap"
                        align="center"
                        style={{
                          minHeight: 56,
                        }}
                      >
                        <Stack
                          gap={2}
                          style={{
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <Text c="#111111" fw={700} fz={15} lineClamp={1}>
                            {item?.originalLabel || option.label}
                          </Text>

                          {item?.alamat ? (
                            <Text c="#6B7280" fz={12} lineClamp={1}>
                              {item.alamat}
                            </Text>
                          ) : null}
                        </Stack>

                        <Text
                          c={distanceLabel ? "#0D4CB5" : "#9CA3AF"}
                          fw={900}
                          fz={14}
                          ta="right"
                          style={{
                            minWidth: 82,
                            flexShrink: 0,
                          }}
                        >
                          {distanceLabel || "-"}
                        </Text>
                      </Group>
                    );
                  }}
                  styles={{
                    input: {
                      backgroundColor: "#FFFFFF",
                      border: errors.drop_point_id
                        ? "1px solid #FA5252"
                        : "none",
                      height: 44,
                      fontSize: 18,
                      color: "#111111",
                    },
                    dropdown: {
                      backgroundColor: "#FFFFFF",
                    },
                    option: {
                      color: "#000000",
                      fontSize: 16,
                    },
                  }}
                />

                {distanceMessage ? (
                  <Text
                    fz={13}
                    fw={600}
                    c={
                      distanceMessage.toLowerCase().includes("berhasil")
                        ? "#1C7C54"
                        : "#C97A32"
                    }
                  >
                    {distanceMessage}
                  </Text>
                ) : (
                  <Text fz={13} fw={600} c="#6B7280">
                    Sistem akan menghitung jarak berdasarkan alamat customer dan
                    alamat drop point.
                  </Text>
                )}
              </Stack>
            )}

            <Box
              style={{
                width: "100%",
                height: 2,
                backgroundColor: "#F4F4F4",
                opacity: 0.95,
              }}
            />

            <Text fw={800} fz="xl" c="#111111">
              Data Perangkat
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
              <Stack gap={8}>
                <Text fw={700} c="#6B7280" size="lg">
                  Jenis Perangkat <span style={{ color: "red" }}>*</span>
                </Text>

                <Select
                  value={form.jenis_perangkat}
                  onChange={(value) => handleChange("jenis_perangkat", value)}
                  data={[
                    { value: "Laptop", label: "Laptop" },
                    { value: "PC", label: "PC" },
                    { value: "Monitor", label: "Monitor" },
                    { value: "Printer", label: "Printer" },
                    { value: "Aksesoris", label: "Aksesoris" },
                  ]}
                  radius={0}
                  disabled={isSubmitting}
                  error={errors.jenis_perangkat}
                  styles={{
                    input: {
                      backgroundColor: "#FFFFFF",
                      border: errors.jenis_perangkat
                        ? "1px solid #FA5252"
                        : "none",
                      height: 44,
                      fontSize: 18,
                      color: "#111111",
                    },
                    dropdown: {
                      backgroundColor: "#FFFFFF",
                    },
                    option: {
                      color: "#000000",
                      fontSize: 16,
                    },
                  }}
                />
              </Stack>

              <Stack gap={8}>
                <Text fw={700} c="#6B7280" size="lg">
                  Merk Perangkat <span style={{ color: "red" }}>*</span>
                </Text>

                <TextInput
                  value={form.merk_perangkat}
                  onChange={(event) =>
                    handleChange("merk_perangkat", event.currentTarget.value)
                  }
                  radius={0}
                  disabled={isSubmitting}
                  error={errors.merk_perangkat}
                  styles={{
                    input: {
                      backgroundColor: "#FFFFFF",
                      border: errors.merk_perangkat
                        ? "1px solid #FA5252"
                        : "none",
                      height: 44,
                      fontSize: 18,
                      color: "#111111",
                    },
                  }}
                />
              </Stack>
            </SimpleGrid>

            <Stack gap={8}>
              <Text fw={700} c="#6B7280" size="lg">
                Keluhan <span style={{ color: "red" }}>*</span>
              </Text>

              <Textarea
                value={form.keluhan}
                onChange={(event) =>
                  handleChange("keluhan", event.currentTarget.value)
                }
                placeholder="Masukkan keluhan perangkat anda disini..."
                minRows={6}
                radius={0}
                disabled={isSubmitting}
                error={errors.keluhan}
                styles={{
                  input: {
                    backgroundColor: "#FFFFFF",
                    border: errors.keluhan ? "1px solid #FA5252" : "none",
                    fontSize: 18,
                    color: "#111111",
                  },
                }}
              />
            </Stack>

            <Group justify="flex-end" mt={8} gap="lg">
              <Button
                type="button"
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                radius="md"
                disabled={isSubmitting}
                style={{
                  minWidth: 160,
                  height: 50,
                  backgroundColor: "#FF1008",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                Batal
              </Button>

              <Button
                type="submit"
                radius="md"
                loading={isSubmitting}
                style={{
                  minWidth: 160,
                  height: 50,
                  backgroundColor: "#0D4CB5",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {submitLabel}
              </Button>
            </Group>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
}