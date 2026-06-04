/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import {
  Box,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
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

type IconProps = {
  size?: number | string;
  stroke?: number;
  color?: string;
};

type StatCardProps = {
  title: string;
  value: string;
  suffix?: string;
  description: string;
  icon: ComponentType<IconProps>;
  iconBg: string;
  iconColor: string;
  accent: string;
  loading: boolean;
  footer?: ReactNode;
  valueFontSize?: string;
};

function StatCard({
  title,
  value,
  suffix,
  description,
  icon: Icon,
  iconBg,
  iconColor,
  accent,
  loading,
  footer,
  valueFontSize,
}: StatCardProps) {
  return (
    <Paper
      radius={28}
      shadow="md"
      p={0}
      style={{
        minHeight: footer ? 290 : 250,
        overflow: "hidden",
        border: "1px solid #E4EAF3",
        position: "relative",
      }}
    >
      <Box h={5} style={{ background: accent }} />

      <Box
        style={{
          position: "absolute",
          top: -55,
          right: -55,
          width: 145,
          height: 145,
          borderRadius: "50%",
          background: "rgba(72, 113, 181, 0.08)",
        }}
      />

      <Stack justify="space-between" h="100%" p={28} gap={22}>
        <Stack gap={18}>
          <Group justify="space-between" align="flex-start">
            <ThemeIcon
              size={68}
              radius={22}
              variant="light"
              style={{ backgroundColor: iconBg, color: iconColor }}
            >
              <Icon size={34} stroke={1.9} />
            </ThemeIcon>
          </Group>

          <Box>
            <Text
              fw={700}
              c="#42608C"
              tt="uppercase"
              style={{
                fontSize: 14,
                letterSpacing: "0.13em",
              }}
            >
              {title}
            </Text>

            <Box mt={16}>
              {loading ? (
                <Skeleton height={48} width="70%" radius="md" />
              ) : suffix ? (
                <Group align="flex-end" gap={10}>
                  <Text
                    fw={800}
                    c="#071226"
                    style={{
                      fontSize: "clamp(44px, 4vw, 58px)",
                      lineHeight: 0.95,
                      letterSpacing: "-0.055em",
                    }}
                  >
                    {value}
                  </Text>

                  <Text
                    fw={700}
                    c="#304B73"
                    style={{
                      fontSize: 19,
                      marginBottom: 7,
                    }}
                  >
                    {suffix}
                  </Text>
                </Group>
              ) : (
                <Text
                  fw={800}
                  c="#071226"
                  style={{
                    fontSize: valueFontSize ?? "clamp(34px, 3vw, 46px)",
                    lineHeight: 1.05,
                    letterSpacing: "-0.045em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {value}
                </Text>
              )}
            </Box>

            <Text mt={18} c="#5F7190" fz={15} lh={1.7}>
              {description}
            </Text>
          </Box>
        </Stack>

        {footer ? (
          <Box>
            <Divider my={18} color="#E6ECF5" />
            {footer}
          </Box>
        ) : null}
      </Stack>
    </Paper>
  );
}

function getTotalPenjualan(data: OwnerDashboardData | null) {
  return data ? String(data.total_penjualan) : "0";
}

function getTotalServis(data: OwnerDashboardData | null) {
  return data ? String(data.total_servis) : "0";
}

function getTotalPendapatan(data: OwnerDashboardData | null) {
  return data ? data.total_pendapatan_display : "Rp 0";
}

export default function OwnerDashboardPage() {
  const [dashboardData, setDashboardData] =
    useState<OwnerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function fetchDashboard(isRefresh = false) {
    if (isRefresh && (isLoading || isRefreshing)) {
      return;
    }

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

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
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void fetchDashboard();
  }, []);

  const tahun = dashboardData?.tahun_berjalan ?? new Date().getFullYear();

  return (
    <Box w="100%" mih="100%">
      <Stack gap={0}>
        <Paper
          radius={32}
          shadow="md"
          p={36}
          style={{
            minHeight: 230,
            overflow: "hidden",
            position: "relative",
            border: "1px solid rgba(92, 132, 195, 0.34)",
            background:
              "linear-gradient(135deg, #3E67A9 0%, #5D86CB 55%, #86ADE8 100%)",
          }}
        >
          <Box
            style={{
              position: "absolute",
              top: -210,
              right: -80,
              width: 360,
              height: 360,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
            }}
          />

          <Box
            style={{
              position: "absolute",
              bottom: -160,
              left: -70,
              width: 250,
              height: 250,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.10)",
            }}
          />

          <Group
            justify="space-between"
            align="center"
            gap={28}
            wrap="wrap"
            style={{ position: "relative", zIndex: 1 }}
          >
            <Box maw={760}>
              <Text
                mt={12}
                fw={800}
                c="#FFFFFF"
                style={{
                  fontSize: "clamp(28px, 3vw, 38px)",
                  lineHeight: 1.18,
                  letterSpacing: "-0.04em",
                }}
              >
                Ringkasan Operasional DVC Komputer
              </Text>

              <Text mt={14} c="rgba(255,255,255,0.91)" fz={15} lh={1.75}>
                Pantau total penjualan, jumlah servis, dan pendapatan utama
                pada tahun berjalan secara cepat dari satu halaman dashboard.
              </Text>
            </Box>

            <Paper
              radius={26}
              p={22}
              shadow="sm"
              style={{
                width: 245,
                backgroundColor: "rgba(43, 75, 132, 0.42)",
                border: "1px solid rgba(255,255,255,0.24)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Stack gap={12}>
                <Text fw={600} c="rgba(255,255,255,0.82)" fz={15} style={{ fontSize: 36, textAlign: "center", letterSpacing: "-0.04em" }}>
                  Periode Data
                </Text>

                <Text fw={800} c="#FFFFFF" style={{ fontSize: 36, textAlign: "center", letterSpacing: "-0.04em" }}>
                  {isLoading ? "..." : tahun}
                </Text>

              </Stack>
            </Paper>
          </Group>
        </Paper>

        <SimpleGrid
          cols={{ base: 1, md: 2, xl: 3 }}
          spacing={26}
          style={{
            position: "relative",
            zIndex: 2,
            marginTop: 15,
            paddingInline: 4,
          }}
        >
          <StatCard
            title="Total Penjualan"
            value={getTotalPenjualan(dashboardData)}
            suffix="Transaksi"
            description="Jumlah transaksi penjualan produk yang tercatat pada sistem."
            icon={IconShoppingCart}
            iconBg="#EAF2FF"
            iconColor="#2D6CDF"
            accent="linear-gradient(90deg, #2D6CDF, #7BA7F3)"
            loading={isLoading}
          />

          <StatCard
            title="Total Servis"
            value={getTotalServis(dashboardData)}
            suffix="Servis"
            description="Jumlah tiket servis yang tercatat dan diproses melalui sistem."
            icon={IconTool}
            iconBg="#E8F7EF"
            iconColor="#22A062"
            accent="linear-gradient(90deg, #22A062, #83D9A8)"
            loading={isLoading}
          />

          <StatCard
            title="Total Pendapatan"
            value={getTotalPendapatan(dashboardData)}
            description="Akumulasi pendapatan dari transaksi penjualan dan pembayaran servis."
            icon={IconWallet}
            iconBg="#FFF4E6"
            iconColor="#D97706"
            accent="linear-gradient(90deg, #D97706, #F6B65B)"
            loading={isLoading}
            valueFontSize="clamp(30px, 2.35vw, 42px)"
            footer={
              isLoading ? (
                <Group grow>
                  <Skeleton height={42} radius="md" />
                  <Skeleton height={42} radius="md" />
                </Group>
              ) : (
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Stack gap={4}>
                    <Text c="#7A8AA6" fz={13}>
                      Penjualan
                    </Text>
                    <Text fw={800} c="#243656" fz={15}>
                      {dashboardData?.detail_pendapatan.penjualan_display ??
                        "Rp 0"}
                    </Text>
                  </Stack>

                  <Stack gap={4} align="flex-end">
                    <Text c="#7A8AA6" fz={13}>
                      Servis
                    </Text>
                    <Text fw={800} c="#243656" fz={15}>
                      {dashboardData?.detail_pendapatan.servis_display ??
                        "Rp 0"}
                    </Text>
                  </Stack>
                </Group>
              )
            }
          />
        </SimpleGrid>
      </Stack>
    </Box>
  );
}