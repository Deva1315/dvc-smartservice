import { Avatar, Box, Group, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import {
  IconShoppingCart,
  IconTool,
  IconWallet,
} from "@tabler/icons-react";

type OwnerStatCardProps = {
  title: string;
  value: string;
  suffix?: string;
  icon: React.ComponentType<{
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

export default function OwnerDashboardPage() {
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
          value="150"
          suffix="Transaksi"
          icon={IconShoppingCart}
          iconBackground="#E7EFFB"
          iconColor="#2F73E0"
        />

        <OwnerStatCard
          title="Total Servis"
          value="80"
          suffix="Servis"
          icon={IconTool}
          iconBackground="#E5F5EE"
          iconColor="#20A568"
        />

        <OwnerStatCard
          title="Total Pendapatan"
          value="Rp 25.000.000"
          icon={IconWallet}
          iconBackground="#E7F5EE"
          iconColor="#22A06B"
        />
      </SimpleGrid>
    </Box>
  );
}