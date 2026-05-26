import {
  Paper,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import type { FormType } from "@/types/form-types";
import type {
  PegawaiFormFieldChangeHandler,
  PegawaiFormState,
} from "@/types/pegawai-form.types";

type PegawaiAccountSectionProps = {
  form: PegawaiFormState;
  errors: Record<string, string>;
  formType: FormType;
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

export default function PegawaiAccountSection({
  form,
  errors,
  formType,
  isSubmitting,
  handleChange,
}: PegawaiAccountSectionProps) {
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
            Informasi Akun Pegawai
          </Text>

          <Text fz="sm" c="#6B7280">
            Lengkapi data akun utama pegawai untuk akses ke sistem.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Stack gap={6}>
            <FieldLabel label="Nama Pegawai" required />

            <TextInput
              value={form.nama}
              onChange={(event) =>
                handleChange("nama", event.currentTarget.value)
              }
              placeholder="Contoh: Made Adi Wijaya"
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
            <FieldLabel label="Email" required />

            <TextInput
              value={form.email}
              onChange={(event) =>
                handleChange("email", event.currentTarget.value)
              }
              placeholder="Contoh: pegawai@email.com"
              radius="md"
              disabled={isSubmitting}
              error={errors.email}
              styles={{
                input: {
                  ...inputBaseStyle,
                  border: errors.email
                    ? "1px solid #FA5252"
                    : "1px solid #E5E7EB",
                },
                error: errorStyle,
              }}
            />
          </Stack>

          <Stack gap={6}>
            <FieldLabel label="No HP" required />

            <TextInput
              value={form.phone}
              onChange={(event) =>
                handleChange("phone", event.currentTarget.value)
              }
              placeholder="Contoh: 081234567890"
              radius="md"
              disabled={isSubmitting}
              error={errors.phone}
              styles={{
                input: {
                  ...inputBaseStyle,
                  border: errors.phone
                    ? "1px solid #FA5252"
                    : "1px solid #E5E7EB",
                },
                error: errorStyle,
              }}
            />
          </Stack>

          <Stack gap={6}>
            <FieldLabel
              label="Password"
              required={formType === "create"}
            />

            <PasswordInput
              value={form.password}
              onChange={(event) =>
                handleChange("password", event.currentTarget.value)
              }
              placeholder={
                formType === "edit"
                  ? "Kosongkan jika tidak ingin mengubah password"
                  : "Masukkan password pegawai"
              }
              radius="md"
              disabled={isSubmitting}
              error={errors.password}
              styles={{
                input: {
                  ...inputBaseStyle,
                  border: errors.password
                    ? "1px solid #FA5252"
                    : "1px solid #E5E7EB",
                },
                innerInput: {
                  fontSize: 15,
                  color: "#111827",
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