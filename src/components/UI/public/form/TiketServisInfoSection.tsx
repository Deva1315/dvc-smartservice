import { Paper, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconCalendarEvent } from "@tabler/icons-react";

interface TiketServisInfoSectionProps {
  displayNoTiket: string;
  tanggal: string | null;
  setTanggal: (value: string | null) => void;
  clearFieldError: (field: string) => void;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

export default function TiketServisInfoSection({
  displayNoTiket,
  tanggal,
  setTanggal,
  clearFieldError,
  errors,
  isSubmitting,
}: TiketServisInfoSectionProps) {
  return (
    <Paper
      radius="lg"
      p={{ base: "md", sm: "lg" }}
      withBorder
      style={{
        borderColor: "#E5E7EB",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Stack gap="md">
        <Stack gap={4}>
          <Text fw={800} fz="lg" c="#111827">
            Informasi Tiket
          </Text>
          <Text fz="sm" c="#6B7280">
            Nomor tiket dan tanggal masuk servis.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <Stack gap={6}>
            <Text fw={700} c="#374151" fz="sm">
              No Tiket
            </Text>

            <TextInput
              value={displayNoTiket}
              placeholder="Nomor tiket akan dibuat otomatis"
              readOnly
              radius="md"
              error={errors.nomor_tiket}
              styles={{
                input: {
                  backgroundColor: "#F3F4F6",
                  border: errors.nomor_tiket
                    ? "1px solid #FA5252"
                    : "1px solid #E5E7EB",
                  height: 46,
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#6B7280",
                },
              }}
            />
          </Stack>

          <Stack gap={6}>
            <Text fw={700} c="#374151" fz="sm">
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
              radius="md"
              disabled={isSubmitting}
              error={errors.tanggal_masuk}
              rightSection={
                <IconCalendarEvent size={18} stroke={1.8} color="#6B7280" />
              }
              styles={{
                input: {
                  backgroundColor: "#F9FAFB",
                  border: errors.tanggal_masuk
                    ? "1px solid #FA5252"
                    : "1px solid #E5E7EB",
                  height: 46,
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111827",
                },
              }}
            />
          </Stack>
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}