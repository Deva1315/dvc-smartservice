import { Paper, Select, SimpleGrid, Stack, Text } from "@mantine/core";
import type {
  BarangFormFieldChangeHandler,
  BarangFormState,
  BarangSelectOption,
} from "@/types/barang-form.types";

type BarangClassificationSectionProps = {
  form: BarangFormState;
  errors: Record<string, string>;
  isSubmitting: boolean;
  kategoriOptions: BarangSelectOption[];
  supplierOptions: BarangSelectOption[];
  handleChange: BarangFormFieldChangeHandler;
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

export default function BarangClassificationSection({
  form,
  errors,
  isSubmitting,
  kategoriOptions,
  supplierOptions,
  handleChange,
}: BarangClassificationSectionProps) {
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
            Kategori dan Supplier
          </Text>

          <Text fz="sm" c="#6B7280">
            Pilih kategori barang dan supplier yang terkait dengan barang ini.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Stack gap={6}>
            <FieldLabel label="Kategori" required />

            <Select
              value={form.kategori}
              onChange={(value) => handleChange("kategori", value)}
              data={kategoriOptions}
              radius="md"
              placeholder="Pilih kategori"
              searchable
              disabled={isSubmitting}
              error={errors.kategori}
              styles={{
                input: {
                  ...inputBaseStyle,
                  border: errors.kategori
                    ? "1px solid #FA5252"
                    : "1px solid #E5E7EB",
                },
                dropdown: {
                  backgroundColor: "#FFFFFF",
                },
                option: {
                  color: "#111827",
                  fontSize: 14,
                },
                error: errorStyle,
              }}
            />
          </Stack>

          <Stack gap={6}>
            <FieldLabel label="Supplier" required />

            <Select
              value={form.supplier}
              onChange={(value) => handleChange("supplier", value)}
              data={supplierOptions}
              radius="md"
              placeholder="Pilih supplier"
              searchable
              disabled={isSubmitting}
              error={errors.supplier}
              styles={{
                input: {
                  ...inputBaseStyle,
                  border: errors.supplier
                    ? "1px solid #FA5252"
                    : "1px solid #E5E7EB",
                },
                dropdown: {
                  backgroundColor: "#FFFFFF",
                },
                option: {
                  color: "#111827",
                  fontSize: 14,
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