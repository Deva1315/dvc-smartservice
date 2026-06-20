import {
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import type {
  FormFieldChangeHandler,
  FormState,
} from "@/types/tiket-servis-form.types";

interface TiketServisDeviceSectionProps {
  form: FormState;
  errors: Record<string, string>;
  isSubmitting: boolean;
  handleChange: FormFieldChangeHandler;
}

export default function TiketServisDeviceSection({
  form,
  errors,
  isSubmitting,
  handleChange,
}: TiketServisDeviceSectionProps) {
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
            Data Perangkat
          </Text>
          <Text fz="sm" c="#6B7280">
            Jelaskan perangkat dan keluhan yang ingin diservis.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <Stack gap={6}>
            <Text fw={700} c="#374151" fz="sm">
              Jenis Perangkat <span style={{ color: "#EF4444" }}>*</span>
            </Text>

            <Select
              value={form.jenis_perangkat}
              onChange={(value) => {
                handleChange("jenis_perangkat", value);
              }}
              data={[
                { value: "Laptop", label: "Laptop" },
                { value: "PC", label: "PC" },
                { value: "Monitor", label: "Monitor" },
                { value: "Printer", label: "Printer" },
                { value: "Aksesoris", label: "Aksesoris" },
              ]}
              placeholder="Pilih jenis perangkat"
              radius="md"
              disabled={isSubmitting}
              error={errors.jenis_perangkat}
              comboboxProps={{
                withinPortal: true,
                zIndex: 3000,
              }}
              styles={{
                input: {
                  backgroundColor: "#F9FAFB",
                  border: errors.jenis_perangkat
                    ? "1px solid #FA5252"
                    : "1px solid #E5E7EB",
                  height: 46,
                  fontSize: 15,
                  color: "#111827",
                },
                dropdown: {
                  backgroundColor: "#FFFFFF",
                  zIndex: 3000,
                },
                option: {
                  color: "#111827",
                  fontSize: 14,
                },
                error: {
                  fontSize: 13,
                  marginTop: 6,
                },
              }}
            />
          </Stack>

          <Stack gap={6}>
            <Text fw={700} c="#374151" fz="sm">
              Merk Perangkat <span style={{ color: "#EF4444" }}>*</span>
            </Text>

            <TextInput
              value={form.merk_perangkat}
              onChange={(event) =>
                handleChange("merk_perangkat", event.currentTarget.value)
              }
              radius="md"
              disabled={isSubmitting}
              error={errors.merk_perangkat}
              placeholder="Contoh: ASUS, Lenovo, Acer"
              styles={{
                input: {
                  backgroundColor: "#F9FAFB",
                  border: errors.merk_perangkat
                    ? "1px solid #FA5252"
                    : "1px solid #E5E7EB",
                  height: 46,
                  fontSize: 15,
                  color: "#111827",
                },
              }}
            />
          </Stack>
        </SimpleGrid>

        <Stack gap={6}>
          <Text fw={700} c="#374151" fz="sm">
            Keluhan <span style={{ color: "#EF4444" }}>*</span>
          </Text>

          <Textarea
            value={form.keluhan}
            onChange={(event) =>
              handleChange("keluhan", event.currentTarget.value)
            }
            placeholder="Contoh: laptop tidak bisa menyala, layar berkedip, keyboard tidak berfungsi..."
            minRows={5}
            radius="md"
            disabled={isSubmitting}
            error={errors.keluhan}
            styles={{
              input: {
                backgroundColor: "#F9FAFB",
                border: errors.keluhan
                  ? "1px solid #FA5252"
                  : "1px solid #E5E7EB",
                fontSize: 15,
                color: "#111827",
              },
            }}
          />
        </Stack>

        {form.id_diagnosa_ai ? (
          <Stack gap={6}>
            <Text fw={700} c="#374151" fz="sm">
              Diagnosa Awal Kerusakan dari AI
            </Text>

            <Textarea
              value={
                form.diagnosa_awal_kerusakan ||
                "Solusi terbaik dari Diagnosa AI belum tersedia"
              }
              readOnly
              minRows={4}
              radius="md"
              disabled={isSubmitting}
              styles={{
                input: {
                  backgroundColor: "#F3F4F6",
                  border: "1px solid #E5E7EB",
                  fontSize: 15,
                  color: "#111827",
                },
              }}
            />

            <Text fz="xs" c="#6B7280">
              Diagnosa awal ini diambil dari solusi terbaik Diagnosa AI dan
              tetap perlu dikonfirmasi oleh teknisi.
            </Text>
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
}