import { Paper, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import type {
  AdminPenjualanTiketServisFormFieldChangeHandler,
  AdminPenjualanTiketServisFormState,
} from "@/types/admin-penjualan-tiket-servis-form.types";

interface AdminPenjualanTiketServisCustomerSectionProps {
  form: AdminPenjualanTiketServisFormState;
  errors: Record<string, string>;
  isSubmitting: boolean;
  handleChange: AdminPenjualanTiketServisFormFieldChangeHandler;
}

export default function AdminPenjualanTiketServisCustomerSection({
  form,
  errors,
  isSubmitting,
  handleChange,
}: AdminPenjualanTiketServisCustomerSectionProps) {
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
            Masukkan data pelanggan yang menitipkan perangkat servis.
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
                error: {
                  fontSize: 13,
                  marginTop: 6,
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
                error: {
                  fontSize: 13,
                  marginTop: 6,
                },
              }}
            />
          </Stack>
        </SimpleGrid>

        <Stack gap={6}>
          <Text fw={700} c="#374151" fz="sm">
            Alamat Customer{" "}
            {form.gunakan_drop_point === "ya" ? (
              <span style={{ color: "#EF4444" }}>*</span>
            ) : null}
          </Text>

          <TextInput
            value={form.alamat_cust}
            onChange={(event) =>
              handleChange("alamat_cust", event.currentTarget.value)
            }
            radius="md"
            disabled={isSubmitting}
            error={errors.alamat_cust}
            placeholder="Wajib diisi jika menggunakan drop point"
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
              error: {
                fontSize: 13,
                marginTop: 6,
              },
            }}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}