"use client";

import { ActionIcon, Box, Group, Text } from "@mantine/core";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";

type DashboardHeaderProps = {
  title: string;
  collapsed: boolean;
  onToggleSidebar: () => void;
};

export default function DashboardHeader({
  title,
  collapsed,
  onToggleSidebar,
}: DashboardHeaderProps) {
  return (
    <Box
      bg="#FFFFFF"
      h={106}
      style={{
        borderBottom: "1px solid #E9ECEF",
      }}
    >
      <Group h="100%" px={24} gap={16}>
        <ActionIcon
          variant="subtle"
          color="gray"
          size={34}
          radius="md"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <IconLayoutSidebarLeftExpand size={22} stroke={1.8} />
          ) : (
            <IconLayoutSidebarLeftCollapse size={22} stroke={1.8} />
          )}
        </ActionIcon>

        <Text
          fw={800}
          c="#111827"
          style={{
            fontSize: "38px",
            lineHeight: 1,
          }}
        >
          {title}
        </Text>
      </Group>
    </Box>
  );
}