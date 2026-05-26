import {
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import type {
  SparepartFormFieldChangeHandler,
  SparepartFormState,
} from "@/types/sparepart-form.types";
import {
  getFormattedSparepartHarga,
  parseSparepartCurrencyInput,
} from "@/utils/admin-gudang/sparepart-form.helpers";

type SparepartMainInfoSectionProps = {
  form: SparepartFormState;
  errors: Record<string, string>;
  isSubmitting: boolean;
  handleChange: SparepartFormFieldChangeHandler;
};

function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <Text fw={700} fz="sm" c="#374151">
      {label}
      {required ? (
        <Text span c="#EF4444" ml={2}>
          *
        </Text>
      ) : null}
    </Text>
  );
}

const inputBaseStyle = {
  backgroundColor: "#F9FAFB",
  height: 46,
  fontSize: 15,
  color: "#111827",
};

const errorStyle = {
  fontSize: 13,
  marginTop: 6,
};

export default function SparepartMainInfoSection({
  form,
  errors,
  isSubmitting,
  handleChange,
}: SparepartMainInfoSectionProps) {
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
            Informasi Sparepart
          </Text>

          <Text fz="sm" c="#6B7280">
            Lengkapi identitas sparepart, kode, merk, stok, dan harga.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Stack gap={6}>
            <FieldLabel label="Nama Sparepart" required />

            <TextInput
              value={form.nama}
              onChange={(event) =>
                handleChange("nama", event.currentTarget.value)
              }
              placeholder="Contoh: RAM DDR4 8GB"
              radius="md"
              disabled={isSubmitting}
              error={errors.nama}
              styles={{
                input: {
                  ...inputBaseStyle,
                  border: errors.nama
                    ? "1px solid #FA5252"
                    : "1px solid #E5E7EB",
                },
                error: errorStyle,
              }}
            />
          </Stack>

          <Stack gap={6}>
            <FieldLabel label="Harga" required />

            <TextInput
              value={getFormattedSparepartHarga(form.harga)}
              onChange={(event) =>
                handleChange(
                  "harga",
                  parseSparepartCurrencyInput(event.currentTarget.value)
                )
              }
              placeholder="Rp 0"
              radius="md"
              disabled={isSubmitting}
              error={errors.harga}
              styles={{
                input: {
                  ...inputBaseStyle,
                  border: errors.harga
                    ? "1px solid #FA5252"
                    : "1px solid #E5E7EB",
                },
                error: errorStyle,
              }}
            />
          </Stack>

          <Stack gap={6}>
            <FieldLabel label="Kode Sparepart" required />

            <TextInput
              value={form.kode}
              onChange={(event) =>
                handleChange("kode", event.currentTarget.value)
              }
              placeholder="Contoh: SPR-001"
              radius="md"
              disabled={isSubmitting}
              error={errors.kode}
              styles={{
                input: {
                  ...inputBaseStyle,
                  border: errors.kode
                    ? "1px solid #FA5252"
                    : "1px solid #E5E7EB",
                },
                error: errorStyle,
              }}
            />
          </Stack>

          <Stack gap={6}>
            <FieldLabel label="Stok" required />

            <NumberInput
              value={form.stok}
              onChange={(value) =>
                handleChange("stok", typeof value === "number" ? value : 0)
              }
              min={0}
              allowDecimal={false}
              decimalScale={0}
              hideControls
              placeholder="0"
              radius="md"
              disabled={isSubmitting}
              error={errors.stok}
              styles={{
                input: {
                  ...inputBaseStyle,
                  border: errors.stok
                    ? "1px solid #FA5252"
                    : "1px solid #E5E7EB",
                },
                error: errorStyle,
              }}
            />
          </Stack>

          <Stack gap={6}>
            <FieldLabel label="Merk" required />

            <TextInput
              value={form.merk}
              onChange={(event) =>
                handleChange("merk", event.currentTarget.value)
              }
              placeholder="Contoh: Kingston, WD, Intel"
              radius="md"
              disabled={isSubmitting}
              error={errors.merk}
              styles={{
                input: {
                  ...inputBaseStyle,
                  border: errors.merk
                    ? "1px solid #FA5252"
                    : "1px solid #E5E7EB",
                },
                error: errorStyle,
              }}
            />
          </Stack>
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}