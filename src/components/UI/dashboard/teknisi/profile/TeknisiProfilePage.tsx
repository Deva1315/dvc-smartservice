"use client";

import { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Divider,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { IconMail, IconMapPin, IconPhone } from "@tabler/icons-react";
import type { DashboardSessionUser } from "@/lib/auth/get-dashboard-user";
import { getUserInitials } from "@/lib/auth/get-dashboard-user";
import {
  type TeknisiProfileUser,
} from "@/lib/teknisi/teknisi-profile-client";
import { getTeknisiProfileRequest } from "@/lib/teknisi/teknisi-profile-client";

type Props = {
  user: DashboardSessionUser;
};

function ProfileFieldView({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Box>
      <Text fw={700} c="#7B8794" style={{ fontSize: 16, marginBottom: 6 }}>
        {label}
      </Text>
      <Text c="#111111" style={{ fontSize: 18 }}>
        {value || "-"}
      </Text>
    </Box>
  );
}

function mapApiUser(user: TeknisiProfileUser): DashboardSessionUser {
  return {
    id: user.id,
    name: user.nama,
    email: user.email,
    roleId: user.roleId,
    roleKey: "teknisi",
    roleName: user.roleName,
    address: user.address,
    phone: user.phone,
    avatarUrl: user.photoProfilePath,
  };
}

export default function TeknisiProfilePage({ user }: Props) {
  const [profileUser, setProfileUser] =
    useState<DashboardSessionUser>(user);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const result = await getTeknisiProfileRequest();

        if (result.success) {
          setProfileUser(mapApiUser(result.user));
        }
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  return (
    <Stack gap={22}>
      {/* HEADER */}
      <Paper
        radius={14}
        p={28}
        shadow="sm"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E7EB",
        }}
      >
        <Group gap={24}>
          <Avatar
            size={174}
            radius={36}
            src={profileUser.avatarUrl || undefined}
          >
            {getUserInitials(profileUser.name)}
          </Avatar>

          <Stack gap={8}>
            <Text fw={800} style={{ fontSize: 32, color: "#111111" }}>
              {profileUser.name}
            </Text>

            <Group gap={8}>
              <IconMail size={18} color="#6B7280"/>
              <Text style={{ color: "#111111" }}>{profileUser.email}</Text>
            </Group>

            <Group gap={8}>
              <IconPhone size={18} color="#6B7280"/>
              <Text style={{ color: "#111111" }}>{profileUser.phone || "-"}</Text>
            </Group>

            <Group gap={8}>
              <IconMapPin size={18} color="#6B7280"/>
              <Text style={{ color: "#111111" }}>{profileUser.address || "-"}</Text>
            </Group>
          </Stack>
        </Group>
      </Paper>

      {/* DETAIL */}
      <Paper
        radius={14}
        p={28}
        shadow="sm"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E7EB",
        }}
      >
        <Stack gap={22}>
          <Text fw={800} style={{ fontSize: 22, color: "#111111" }}>
            Profile Information
          </Text>

          <Divider />

          {isLoading ? (
            <Stack align="center">
              <Loader />
            </Stack>
          ) : (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={28}>
              <ProfileFieldView label="Name" value={profileUser.name} />
              <ProfileFieldView
                label="Address"
                value={profileUser.address || "-"}
              />
              <ProfileFieldView label="Email" value={profileUser.email} />
              <ProfileFieldView
                label="Phone"
                value={profileUser.phone || "-"}
              />

              <Box>
                <Text fw={700} c="#7B8794" style={{ marginBottom: 6 }}>
                  Role
                </Text>
                <Badge color="green" variant="light">
                  {profileUser.roleName.toUpperCase()}
                </Badge>
              </Box>
            </SimpleGrid>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}