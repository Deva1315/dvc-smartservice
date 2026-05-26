import { Group, Paper, Radio, Select, Stack, Text } from "@mantine/core";
import type {
  AdminPenjualanTicketDropPointOption,
  AdminPenjualanTiketServisFormFieldChangeHandler,
  AdminPenjualanTiketServisFormState,
} from "@/types/admin-penjualan-tiket-servis-form.types";

interface AdminPenjualanTiketServisDropPointSectionProps {
  form: AdminPenjualanTiketServisFormState;
  errors: Record<string, string>;
  isSubmitting: boolean;
  dropPointOptions: AdminPenjualanTicketDropPointOption[];
  handleChange: AdminPenjualanTiketServisFormFieldChangeHandler;
  handleDropPointRadioChange: (value: string) => void;
}

export default function AdminPenjualanTiketServisDropPointSection({
  form,
  errors,
  isSubmitting,
  dropPointOptions,
  handleChange,
  handleDropPointRadioChange,
}: AdminPenjualanTiketServisDropPointSectionProps) {
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
            Drop Point
          </Text>

          <Text fz="sm" c="#6B7280">
            Pilih apakah perangkat customer masuk melalui drop point.
          </Text>
        </Stack>

        <Stack gap={8}>
          <Text fw={700} c="#374151" fz="sm">
            Gunakan Drop Point? <span style={{ color: "#EF4444" }}>*</span>
          </Text>

          <Radio.Group
            value={form.gunakan_drop_point}
            onChange={handleDropPointRadioChange}
            error={errors.gunakan_drop_point}
          >
            <Group gap="xl">
              <Radio value="ya" label="Ya, gunakan Drop Point" color="blue" />
              <Radio value="tidak" label="Tidak" color="blue" />
            </Group>
          </Radio.Group>
        </Stack>

        {form.gunakan_drop_point === "ya" && (
          <Stack gap={8}>
            <Text fw={700} c="#374151" fz="sm">
              Pilih Drop Point <span style={{ color: "#EF4444" }}>*</span>
            </Text>

            <Select
              value={form.drop_point_id}
              onChange={(value) => handleChange("drop_point_id", value)}
              data={dropPointOptions}
              placeholder="Pilih drop point"
              radius="md"
              disabled={isSubmitting}
              searchable
              error={errors.drop_point_id}
              styles={{
                input: {
                  backgroundColor: "#F9FAFB",
                  border: errors.drop_point_id
                    ? "1px solid #FA5252"
                    : "1px solid #E5E7EB",
                  height: 46,
                  fontSize: 15,
                  color: "#111827",
                },
                dropdown: {
                  backgroundColor: "#FFFFFF",
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
        )}
      </Stack>
    </Paper>
  );
}