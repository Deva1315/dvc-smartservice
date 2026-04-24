/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import {
  getStatusServisColor,
  getStatusServisLabel,
  type TeknisiStatusServis,
} from "@/lib/dummy/tiket-servis-teknisi.mock";

type DiagnosaLanjutanModalProps = {
  opened: boolean;
  onClose: () => void;
  noTiket: string;
  pelanggan: string;
  perangkat: string;
  statusSaatIni: TeknisiStatusServis;
  initialDiagnosaLanjutan: string;
  initialCatatanTeknisi: string;
  onSave: (payload: {
    diagnosaLanjutan: string;
    catatanTeknisi: string;
  }) => void;
};

export default function DiagnosaLanjutanModal({
  opened,
  onClose,
  noTiket,
  pelanggan,
  perangkat,
  statusSaatIni,
  initialDiagnosaLanjutan,
  initialCatatanTeknisi,
  onSave,
}: DiagnosaLanjutanModalProps) {
  const [diagnosaLanjutan, setDiagnosaLanjutan] = useState("");
  const [catatanTeknisi, setCatatanTeknisi] = useState("");
  const [errorDiagnosa, setErrorDiagnosa] = useState("");

  useEffect(() => {
    if (!opened) return;

    setDiagnosaLanjutan(initialDiagnosaLanjutan);
    setCatatanTeknisi(initialCatatanTeknisi);
    setErrorDiagnosa("");
  }, [opened, initialDiagnosaLanjutan, initialCatatanTeknisi]);

  function handleSubmit() {
    if (!diagnosaLanjutan.trim()) {
      setErrorDiagnosa("Diagnosa lanjutan wajib diisi");
      return;
    }

    onSave({
      diagnosaLanjutan: diagnosaLanjutan.trim(),
      catatanTeknisi: catatanTeknisi.trim(),
    });

    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="56rem"
      radius="xl"
      closeButtonProps={{
        size: "lg",
        radius: "xl",
      }}
      title={
        <Stack gap={2}>
          <Text fw={800} fz={24} c="#111111">
            Diagnosa Lanjutan Teknisi
          </Text>
          <Text fz={14} c="#6B7280">
            Isi hasil pemeriksaan teknisi untuk tiket servis ini
          </Text>
        </Stack>
      }
      styles={{
        content: {
          backgroundColor: "#FFFFFF",
        },
        body: {
          paddingTop: 8,
        },
      }}
    >
      <Stack gap={22}>
        <Box
          p="md"
          style={{
            backgroundColor: "#F6F6FB",
            borderRadius: 14,
            border: "1px solid #ECECF3",
          }}
        >
          <Group align="flex-start" justify="space-between">
            <Stack gap={8}>
              <Text fz={16} c="#4B5563">
                No Tiket:{" "}
                <Text span fw={700} c="#111111">
                  {noTiket}
                </Text>
              </Text>
              <Text fz={16} c="#4B5563">
                Perangkat:{" "}
                <Text span fw={700} c="#111111">
                  {perangkat}
                </Text>
              </Text>
            </Stack>

            <Stack gap={8} align="flex-start">
              <Text fz={16} c="#4B5563">
                Pelanggan:{" "}
                <Text span fw={700} c="#111111">
                  {pelanggan}
                </Text>
              </Text>

              <Group gap={8}>
                <Text fz={16} c="#4B5563">
                  Status Saat Ini:
                </Text>
                <Badge
                  color={getStatusServisColor(statusSaatIni)}
                  variant="light"
                  radius="xl"
                  size="lg"
                >
                  {getStatusServisLabel(statusSaatIni)}
                </Badge>
              </Group>
            </Stack>
          </Group>
        </Box>

        <Stack gap={8}>
          <Text fw={700} fz={16} c="#111111">
            Diagnosa Lanjutan <span style={{ color: "red" }}>*</span>
          </Text>

          <Textarea
            value={diagnosaLanjutan}
            onChange={(event) => {
              setDiagnosaLanjutan(event.currentTarget.value);
              if (errorDiagnosa) {
                setErrorDiagnosa("");
              }
            }}
            placeholder="Masukkan hasil pemeriksaan teknisi..."
            minRows={5}
            error={errorDiagnosa}
            styles={{
              input: {
                borderRadius: 12,
              },
            }}
          />
        </Stack>

        <Stack gap={8}>
          <Text fw={700} fz={16} c="#111111">
            Catatan Teknisi
          </Text>

          <Textarea
            value={catatanTeknisi}
            onChange={(event) => setCatatanTeknisi(event.currentTarget.value)}
            placeholder="Tambahkan catatan teknisi bila diperlukan..."
            minRows={4}
            styles={{
              input: {
                borderRadius: 12,
              },
            }}
          />
        </Stack>

        <Group justify="flex-end" gap="md" pt={8}>
          <Button
            variant="outline"
            radius="md"
            onClick={onClose}
            style={{
              minWidth: 140,
              height: 46,
            }}
          >
            Batal
          </Button>

          <Button
            radius="md"
            onClick={handleSubmit}
            style={{
              minWidth: 140,
              height: 46,
              backgroundColor: "#0D4CB5",
            }}
          >
            Simpan
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}