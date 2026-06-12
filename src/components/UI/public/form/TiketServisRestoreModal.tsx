"use client";

import { Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { pulihkanPublicTiketServisRequest } from "@/lib/public/public-tiket-servis.client";

type TiketServisRestoreModalProps = {
  opened: boolean;
  onClose: () => void;
  onRestored: () => Promise<void> | void;
};

export function TiketServisRestoreModal({
  opened,
  onClose,
  onRestored,
}: TiketServisRestoreModalProps) {
  const [nomorTiket, setNomorTiket] = useState("");
  const [namaCust, setNamaCust] = useState("");
  const [phoneCust, setPhoneCust] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setNomorTiket("");
    setNamaCust("");
    setPhoneCust("");
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    resetForm();
    onClose();
  }

  async function handleSubmit() {
    const nomorTiketValue = nomorTiket.trim();
    const namaCustValue = namaCust.trim();
    const phoneCustValue = phoneCust.trim();

    if (!phoneCustValue) {
      notifications.show({
        title: "Gagal",
        message: "Nomor HP wajib diisi",
        color: "red",
      });

      return;
    }

    if (!nomorTiketValue && !namaCustValue) {
      notifications.show({
        title: "Gagal",
        message: "Isi nomor tiket atau nama pelanggan",
        color: "red",
      });

      return;
    }

    try {
      setIsSubmitting(true);

      const result = await pulihkanPublicTiketServisRequest({
        nomor_tiket: nomorTiketValue || null,
        nama_cust: namaCustValue || null,
        phone_cust: phoneCustValue,
      });

      if (!result.success) {
        notifications.show({
          title: "Gagal",
          message: result.message,
          color: "red",
        });

        return;
      }

      await onRestored();

      resetForm();
      onClose();

      notifications.show({
        title: "Berhasil",
        message: result.message,
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Gagal",
        message: "Terjadi kesalahan saat memulihkan tiket servis",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={800} fz={20} c="#111827">
          Pulihkan Tiket Servis
        </Text>
      }
      centered
      radius="md"
    >
      <Stack gap="md">
        <Text c="#6B7280" fz={14}>
          Gunakan nomor tiket dan nomor HP untuk memulihkan tiket. Jika lupa
          nomor tiket, isi nama pelanggan dan nomor HP yang digunakan saat
          membuat tiket
        </Text>

        <TextInput
          label="Nomor Tiket"
          placeholder="Contoh TK-2026-001"
          value={nomorTiket}
          onChange={(event) => setNomorTiket(event.currentTarget.value)}
          disabled={isSubmitting}
        />

        <TextInput
          label="Nama Pelanggan"
          description="Diisi jika nomor tiket lupa"
          placeholder="Masukkan nama pelanggan"
          value={namaCust}
          onChange={(event) => setNamaCust(event.currentTarget.value)}
          disabled={isSubmitting}
        />

        <TextInput
          label="Nomor HP"
          placeholder="Contoh 081234567890"
          value={phoneCust}
          onChange={(event) => setPhoneCust(event.currentTarget.value)}
          disabled={isSubmitting}
          required
        />

        <Group justify="flex-end" mt="sm">
          <Button
            variant="default"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>

          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
            style={{
              backgroundColor: "#0D4CB5",
            }}
          >
            Pulihkan
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}