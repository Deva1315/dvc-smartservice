"use client";

import { useEffect, useState, type ComponentType } from "react";
import {
  Avatar,
  Box,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconShoppingCart,
  IconTool,
  IconWallet,
} from "@tabler/icons-react";
import {
  getOwnerDashboard,
  type OwnerDashboardData,
} from "@/lib/owner/owner-dashboard.client";

type OwnerStatCardProps = {
  title: string;
  value: string;
  suffix?: string;
  icon: ComponentType<{
    size?: number | string;
    stroke?: number;
    color?: string;
  }>;
  iconBackground: string;
  iconColor: string;
};

function OwnerStatCard({
  title,
  value,
  suffix,
  icon: Icon,
  iconBackground,
  iconColor,
}: OwnerStatCardProps) {
  return (
    <Paper
      radius={26}
      p={26}
      shadow="sm"
      style={{
        minHeight: 230,
        backgroundColor: "#FFFFFF",
        border: "1px solid #F1F3F5",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Stack gap={18}>
        <Group gap={16} wrap="nowrap">
          <Avatar
            size={84}
            radius="xl"
            style={{
              backgroundColor: iconBackground,
              color: iconColor,
            }}
          >
            <Icon size={42} stroke={1.9} />
          </Avatar>

          <Text
            fw={500}
            c="#343A63"
            style={{
              fontSize: 24,
              lineHeight: 1.2,
            }}
          >
            {title}
          </Text>
        </Group>
      </Stack>

      <Box>
        {suffix ? (
          <Group align="flex-end" gap={10} wrap="nowrap">
            <Text
              fw={500}
              c="#0F1730"
              style={{
                fontSize: 56,
                lineHeight: 1,
              }}
            >
              {value}
            </Text>

            <Text
              fw={500}
              c="#2F3655"
              style={{
                fontSize: 24,
                lineHeight: 1.2,
                marginBottom: 6,
              }}
            >
              {suffix}
            </Text>
          </Group>
        ) : (
          <Text
            fw={500}
            c="#0F1730"
            style={{
              fontSize: 42,
              lineHeight: 1.1,
            }}
          >
            {value}
          </Text>
        )}
      </Box>
    </Paper>
  );
}

function getTotalPenjualan(data: OwnerDashboardData | null) {
  if (!data) return "0";
  return String(data.total_penjualan);
}

function getTotalServis(data: OwnerDashboardData | null) {
  if (!data) return "0";
  return String(data.total_servis);
}

function getTotalPendapatan(data: OwnerDashboardData | null) {
  if (!data) return "Rp 0";
  return data.total_pendapatan_display;
}

export default function OwnerDashboardPage() {
  const [dashboardData, setDashboardData] =
    useState<OwnerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchDashboard() {
    try {
      setIsLoading(true);

      const result = await getOwnerDashboard();

      setDashboardData(result.data);
    } catch (error) {
      setDashboardData(null);

      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data dashboard owner.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <Box
      style={{
        width: "100%",
        minHeight: "100%",
      }}
    >
      <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing={24}>
        <OwnerStatCard
          title="Total Penjualan"
          value={isLoading ? "..." : getTotalPenjualan(dashboardData)}
          suffix="Transaksi"
          icon={IconShoppingCart}
          iconBackground="#E7EFFB"
          iconColor="#2F73E0"
        />

        <OwnerStatCard
          title="Total Servis"
          value={isLoading ? "..." : getTotalServis(dashboardData)}
          suffix="Servis"
          icon={IconTool}
          iconBackground="#E5F5EE"
          iconColor="#20A568"
        />

        <OwnerStatCard
          title="Total Pendapatan"
          value={isLoading ? "..." : getTotalPendapatan(dashboardData)}
          icon={IconWallet}
          iconBackground="#E7F5EE"
          iconColor="#22A06B"
        />
      </SimpleGrid>
    </Box>
  );
}