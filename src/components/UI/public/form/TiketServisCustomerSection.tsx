import { Paper, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import type {
  FormFieldChangeHandler,
  FormState,
} from "@/types/tiket-servis-form.types";

interface TiketServisCustomerSectionProps {
  form: FormState;
  errors: Record<string, string>;
  isSubmitting: boolean;
  handleChange: FormFieldChangeHandler;
  handleCalculateNearestDropPoint: (alamatCustomer: string) => Promise<void>;
}

export default function TiketServisCustomerSection({
  form,
  errors,
  isSubmitting,
  handleChange,
  handleCalculateNearestDropPoint,
}: TiketServisCustomerSectionProps) {
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
            Data Customer
          </Text>
          <Text fz="sm" c="#6B7280">
            Masukkan data pelanggan yang mengajukan servis.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <Stack gap={6}>
            <Text fw={700} c="#374151" fz="sm">
              Nama Customer <span style={{ color: "#EF4444" }}>*</span>
            </Text>

            <TextInput
              value={form.nama_cust}
              onChange={(event) =>
                handleChange("nama_cust", event.currentTarget.value)
              }
              radius="md"
              disabled={isSubmitting}
              error={errors.nama_cust}
              placeholder="Masukkan nama customer"
              styles={{
                input: {
                  backgroundColor: "#F9FAFB",
                  border: errors.nama_cust
                    ? "1px solid #FA5252"
                    : "1px solid #E5E7EB",
                  height: 46,
                  fontSize: 15,
                  color: "#111827",
                },
              }}
            />
          </Stack>

          <Stack gap={6}>
            <Text fw={700} c="#374151" fz="sm">
              No HP <span style={{ color: "#EF4444" }}>*</span>
            </Text>

            <TextInput
              value={form.phone_cust}
              onChange={(event) =>
                handleChange("phone_cust", event.currentTarget.value)
              }
              radius="md"
              disabled={isSubmitting}
              error={errors.phone_cust}
              placeholder="Contoh: 081234567890"
              styles={{
                input: {
                  backgroundColor: "#F9FAFB",
                  border: errors.phone_cust
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
            radius="md"
            disabled={isSubmitting}
            error={errors.alamat_cust}
            placeholder="Contoh: Jalan SMKI No.22, Batubulan, Sukawati, Gianyar, Bali"
            styles={{
              input: {
                backgroundColor: "#F9FAFB",
                border: errors.alamat_cust
                  ? "1px solid #FA5252"
                  : "1px solid #E5E7EB",
                height: 46,
                fontSize: 15,
                color: "#111827",
              },
            }}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}