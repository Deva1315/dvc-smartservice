"use client";

import { ActionIcon, Menu } from "@mantine/core";
import {
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconSelector,
} from "@tabler/icons-react";

export type SortValue = "asc" | "desc" | null;

interface SortDropdownProps {
  active?: SortValue;
  onChange?: (value: SortValue) => void;
}

export default function SortDropdown({
  active = null,
  onChange,
}: SortDropdownProps) {
  const handleChange = (value: Exclude<SortValue, null>) => {
    if (active === value) {
      onChange?.(null);
      return;
    }

    onChange?.(value);
  };

  return (
    <Menu shadow="md" width={140} position="bottom-end" radius="md">
      <Menu.Target>
        <ActionIcon
          variant="subtle"
          radius="md"
          color="gray"
          aria-label="Sort data"
        >
          <IconSelector size={18} stroke={1.8} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconArrowUp size={16} />}
          rightSection={
            active === "asc" ? <IconCheck size={14} color="#0AB19B" /> : null
          }
          onClick={() => handleChange("asc")}
          c={active === "asc" ? "#0AB19B" : undefined}
          fw={active === "asc" ? 600 : 500}
        >
          Asc
        </Menu.Item>

        <Menu.Item
          leftSection={<IconArrowDown size={16} />}
          rightSection={
            active === "desc" ? <IconCheck size={14} color="#0AB19B" /> : null
          }
          onClick={() => handleChange("desc")}
          c={active === "desc" ? "#0AB19B" : undefined}
          fw={active === "desc" ? 600 : 500}
        >
          Desc
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}