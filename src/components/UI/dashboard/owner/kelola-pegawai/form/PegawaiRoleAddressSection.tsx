import { Paper, Select, Stack, Text, Textarea } from "@mantine/core";
import type {
  PegawaiFormFieldChangeHandler,
  PegawaiFormState,
  PegawaiRoleOption,
} from "@/types/pegawai-form.types";

type PegawaiRoleAddressSectionProps = {
  form: PegawaiFormState;
  errors: Record<string, string>;
  roleOptions: PegawaiRoleOption[];
  isSubmitting: boolean;
  handleChange: PegawaiFormFieldChangeHandler;
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

export default function PegawaiRoleAddressSection({
  form,
  errors,
  roleOptions,
  isSubmitting,
  handleChange,
}: PegawaiRoleAddressSectionProps) {
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
            Jabatan dan Alamat
          </Text>

          <Text fz="sm" c="#6B7280">
            Tentukan jabatan pegawai dan lengkapi alamat domisili pegawai.
          </Text>
        </Stack>

        <Stack gap={6} maw={420}>
          <FieldLabel label="Jabatan" required />

          <Select
            value={form.id_roles}
            onChange={(value) => handleChange("id_roles", value)}
            data={roleOptions}
            radius="md"
            placeholder="Pilih jabatan pegawai"
            searchable
            disabled={isSubmitting}
            error={errors.id_roles}
            styles={{
              input: {
                ...inputBaseStyle,
                border: errors.id_roles
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
          <FieldLabel label="Alamat" />

          <Textarea
            value={form.address}
            onChange={(event) =>
              handleChange("address", event.currentTarget.value)
            }
            placeholder="Masukkan alamat pegawai..."
            minRows={5}
            radius="md"
            disabled={isSubmitting}
            error={errors.address}
            styles={{
              input: {
                backgroundColor: "#F9FAFB",
                border: errors.address
                  ? "1px solid #FA5252"
                  : "1px solid #E5E7EB",
                fontSize: 15,
                color: "#111827",
              },
              error: errorStyle,
            }}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}