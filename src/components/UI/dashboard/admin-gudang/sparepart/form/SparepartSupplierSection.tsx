import { Paper, Select, Stack, Text } from "@mantine/core";
import type {
  SparepartFormFieldChangeHandler,
  SparepartFormState,
  SparepartSelectOption,
} from "@/types/sparepart-form.types";

type SparepartSupplierSectionProps = {
  form: SparepartFormState;
  errors: Record<string, string>;
  isSubmitting: boolean;
  supplierOptions: SparepartSelectOption[];
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

export default function SparepartSupplierSection({
  form,
  errors,
  isSubmitting,
  supplierOptions,
  handleChange,
}: SparepartSupplierSectionProps) {
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
            Supplier Sparepart
          </Text>

          <Text fz="sm" c="#6B7280">
            Pilih supplier yang menyediakan sparepart ini.
          </Text>
        </Stack>

        <Stack gap={6} maw={420}>
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
      </Stack>
    </Paper>
  );
}