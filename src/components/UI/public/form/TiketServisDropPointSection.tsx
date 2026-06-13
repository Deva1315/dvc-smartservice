import { Group, Paper, Radio, Select, Stack, Text } from "@mantine/core";
import type {
  FormFieldChangeHandler,
  FormState,
  TicketDropPointOption,
} from "@/types/tiket-servis-form.types";
import { getDropPointDistanceLabel } from "@/utils/public/tiket-servis-form.helpers";

interface SelectOption {
  value: string;
  label: string;
}

interface TiketServisDropPointSectionProps {
  form: FormState;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isLoadingDistance: boolean;
  distanceMessage: string;
  selectDropPointData: SelectOption[];
  displayDropPointOptions: TicketDropPointOption[];
  handleChange: FormFieldChangeHandler;
  handleDropPointRadioChange: (value: string) => Promise<void>;
}

export default function TiketServisDropPointSection({
  form,
  errors,
  isSubmitting,
  isLoadingDistance,
  distanceMessage,
  selectDropPointData,
  displayDropPointOptions,
  handleChange,
  handleDropPointRadioChange,
}: TiketServisDropPointSectionProps) {
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
            Pilih apakah perangkat akan dikirim melalui drop point.
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
              <Radio
                value="ya"
                label="Ya, gunakan Drop Point"
                color="blue"
                styles={{
                  label: {
                    color: "var(--mantine-color-dimmed)",
                    fontWeight: 10,
                  },
                }}
              />

              <Radio
                value="tidak"
                label="Tidak"
                color="blue"
                styles={{
                  label: {
                    color: "var(--mantine-color-dimmed)",
                    fontWeight: 10,
                  },
                }}
              />
            </Group>
          </Radio.Group>
        </Stack>

        {form.gunakan_drop_point === "ya" && (
          <Stack gap={10}>
            <Group justify="space-between" align="center">
              <Text fw={700} c="#374151" fz="sm">
                Pilih Drop Point <span style={{ color: "#EF4444" }}>*</span>
              </Text>

              {isLoadingDistance ? (
                <Text fz={13} fw={700} c="#0D4CB5">
                  Menghitung jarak...
                </Text>
              ) : null}
            </Group>

            <Select
              value={form.drop_point_id}
              onChange={(value) => handleChange("drop_point_id", value)}
              data={selectDropPointData}
              placeholder="Pilih drop point"
              radius="md"
              disabled={isSubmitting || isLoadingDistance}
              searchable
              clearable
              maxDropdownHeight={260}
              nothingFoundMessage="Drop point tidak ditemukan"
              comboboxProps={{
                withinPortal: true,
                zIndex: 4000,
              }}
              error={errors.drop_point_id}
              renderOption={({ option }) => {
                const item = displayDropPointOptions.find(
                  (dropPoint) => dropPoint.value === option.value
                );

                const distanceLabel = getDropPointDistanceLabel(item);

                return (
                  <Group
                    justify="space-between"
                    w="100%"
                    wrap="nowrap"
                    align="center"
                    style={{
                      minHeight: 56,
                    }}
                  >
                    <Stack
                      gap={2}
                      style={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <Text c="#111827" fw={700} fz={14} lineClamp={1}>
                        {item?.originalLabel || option.label}
                      </Text>

                      {item?.alamat ? (
                        <Text c="#6B7280" fz={12} lineClamp={1}>
                          {item.alamat}
                        </Text>
                      ) : null}
                    </Stack>

                    <Text
                      c={distanceLabel ? "#0D4CB5" : "#9CA3AF"}
                      fw={900}
                      fz={13}
                      ta="right"
                      style={{
                        minWidth: 82,
                        flexShrink: 0,
                      }}
                    >
                      {distanceLabel || "-"}
                    </Text>
                  </Group>
                );
              }}
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
              }}
            />

            {distanceMessage ? (
              <Text
                fz={13}
                fw={600}
                c={
                  distanceMessage.toLowerCase().includes("berhasil")
                    ? "#15803D"
                    : "#B45309"
                }
              >
                {distanceMessage}
              </Text>
            ) : (
              <Text fz={13} fw={600} c="#6B7280">
                Sistem akan menghitung jarak berdasarkan alamat customer dan
                alamat drop point.
              </Text>
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}