"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Avatar,
  Box,
  Flex,
  Group,
  Menu,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconChevronDown,
  IconLogout2,
  IconSettings,
} from "@tabler/icons-react";
import type { DashboardSessionUser } from "@/lib/auth/get-dashboard-user";
import { getUserInitials } from "@/lib/auth/get-dashboard-user";
import {
  getDashboardMenuByRole,
  getProfileRoute,
  type DashboardMenuItem,
} from "@/lib/dashboard-menu/dashboard-menu";

type DashboardSidebarProps = {
  user: DashboardSessionUser;
  collapsed: boolean;
};

type OwnerProfileApiResponse =
  | {
      success: true;
      message: string;
      user: {
        photoProfilePath: string | null;
      };
    }
  | {
      success: false;
      message: string;
    };

function isPathActive(pathname: string, href?: string): boolean {
  if (!href) {
    return false;
  }

  const cleanPathname = pathname.replace(/\/$/, "") || "/";
  const cleanHref = href.replace(/\/$/, "") || "/";

  if (cleanPathname === cleanHref) {
    return true;
  }

  const hrefSegments = cleanHref.split("/").filter(Boolean);

  // menu root role seperti /owner, /admin_penjualan, /teknisi
  // hanya aktif kalau path-nya persis sama
  if (hrefSegments.length === 1) {
    return false;
  }

  return cleanPathname.startsWith(`${cleanHref}/`);
}

export default function DashboardSidebar({
  user,
  collapsed,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdminGudang = user.roleKey === "admin_gudang";

  const menuItems = useMemo(() => {
    return getDashboardMenuByRole(user.roleKey);
  }, [user.roleKey]);

  const [openedMenus, setOpenedMenus] = useState<Record<string, boolean>>({});
  const [sidebarAvatarUrl, setSidebarAvatarUrl] = useState<string | null>(
    user.avatarUrl ?? null
  );

  useEffect(() => {
    setOpenedMenus((prev) => {
      const next = { ...prev };

      for (const item of menuItems) {
        if (item.children?.length) {
          const hasActiveChild = item.children.some((child) =>
            isPathActive(pathname, child.href)
          );

          const isParentActive = isPathActive(pathname, item.href);

          if (typeof next[item.key] === "undefined") {
            next[item.key] = hasActiveChild || isParentActive;
          } else if (hasActiveChild || isParentActive) {
            next[item.key] = true;
          }
        }
      }

      return next;
    });
  }, [menuItems, pathname]);

  useEffect(() => {
    let isMounted = true;

    async function loadSidebarAvatar() {
      try {
        if (user.roleKey !== "owner") {
          setSidebarAvatarUrl(user.avatarUrl ?? null);
          return;
        }

        const response = await fetch("/api/owner/profile", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const result = (await response.json().catch(() => null)) as
          | OwnerProfileApiResponse
          | null;

        if (!isMounted) return;

        if (!response.ok || !result || !result.success) {
          setSidebarAvatarUrl(user.avatarUrl ?? null);
          return;
        }

        setSidebarAvatarUrl(result.user.photoProfilePath ?? null);
      } catch {
        if (!isMounted) return;
        setSidebarAvatarUrl(user.avatarUrl ?? null);
      }
    }

    void loadSidebarAvatar();

    return () => {
      isMounted = false;
    };
  }, [user.roleKey, user.avatarUrl]);

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Gagal logout");
      }

      notifications.show({
        title: "Berhasil",
        message: "Logout berhasil",
        color: "green",
      });

      router.replace("/");
      router.refresh();
    } catch {
      notifications.show({
        title: "Gagal",
        message: "Logout gagal, silakan coba lagi",
        color: "red",
      });
    }
  }

  function renderClickableContent(
    item: DashboardMenuItem,
    active: boolean,
    opened: boolean,
    showChevron = true
  ) {
    const Icon = item.icon;

    return (
      <Flex
        align="center"
        justify={collapsed ? "center" : "space-between"}
        gap={12}
        px={collapsed ? 10 : 12}
        py={10}
        style={{
          borderRadius: 12,
          transition: "all 0.18s ease",
          color: "#FFFFFF",
          backgroundColor: active ? "rgba(255,255,255,0.08)" : "transparent",
          minHeight: 48,
        }}
      >
        <Group gap={12} wrap="nowrap" style={{ minWidth: 0 }}>
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 24,
            }}
          >
            <Icon size={28} stroke={1.8} />
          </Box>

          {!collapsed && (
            <Text
              fw={700}
              c="#FFFFFF"
              style={{
                fontSize: 18,
                textDecoration: active ? "underline" : "none",
                textUnderlineOffset: 5,
                lineHeight: 1.2,
              }}
            >
              {item.label}
            </Text>
          )}
        </Group>

        {!collapsed && showChevron && item.children?.length ? (
          <IconChevronDown
            size={18}
            stroke={2}
            style={{
              transform: opened ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.18s ease",
              flexShrink: 0,
            }}
          />
        ) : null}
      </Flex>
    );
  }

  function renderChildLink(
    child: { key: string; label: string; href: string }
  ) {
    const active = isPathActive(pathname, child.href);

    return (
      <Link
        key={child.key}
        href={child.href}
        style={{
          textDecoration: "none",
          display: "block",
        }}
      >
        <Box
          ml={collapsed ? 0 : 28}
          pl={collapsed ? 0 : 20}
          pr={12}
          py={8}
          style={{
            color: "#FFFFFF",
            opacity: active ? 1 : 0.82,
            borderLeft: active
              ? "2px solid rgba(255,255,255,0.95)"
              : "2px solid transparent",
            marginTop: 2,
          }}
        >
          <Text
            fw={600}
            c="#FFFFFF"
            style={{
              fontSize: 15,
              textDecoration: active ? "underline" : "none",
              textUnderlineOffset: 4,
            }}
          >
            {child.label}
          </Text>
        </Box>
      </Link>
    );
  }

  function renderAdminGudangParentWithChildren(item: DashboardMenuItem) {
    const active =
      isPathActive(pathname, item.href) ||
      !!item.children?.some((child) => isPathActive(pathname, child.href));

    const opened = openedMenus[item.key] ?? false;

    if (collapsed) {
      return (
        <Tooltip
          key={item.key}
          label={item.label}
          position="right"
          withArrow
        >
          <UnstyledButton
            onClick={() => {
              if (item.href) {
                router.push(item.href);
                setOpenedMenus((prev) => ({
                  ...prev,
                  [item.key]: true,
                }));
                return;
              }

              setOpenedMenus((prev) => ({
                ...prev,
                [item.key]: !prev[item.key],
              }));
            }}
            style={{
              display: "block",
              width: "100%",
            }}
          >
            {renderClickableContent(item, active, opened, false)}
          </UnstyledButton>
        </Tooltip>
      );
    }

    return (
      <Box key={item.key}>
        <Tooltip
          label={collapsed ? item.label : ""}
          disabled={!collapsed}
          position="right"
          withArrow
        >
          <Flex gap={8} align="stretch">
            <Box style={{ flex: 1 }}>
              {item.href ? (
                <Link
                  href={item.href}
                  onClick={() =>
                    setOpenedMenus((prev) => ({
                      ...prev,
                      [item.key]: true,
                    }))
                  }
                  style={{
                    textDecoration: "none",
                    display: "block",
                  }}
                >
                  {renderClickableContent(item, active, opened, false)}
                </Link>
              ) : (
                <UnstyledButton
                  onClick={() =>
                    setOpenedMenus((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key],
                    }))
                  }
                  style={{
                    display: "block",
                    width: "100%",
                  }}
                >
                  {renderClickableContent(item, active, opened, false)}
                </UnstyledButton>
              )}
            </Box>

            <UnstyledButton
              onClick={() =>
                setOpenedMenus((prev) => ({
                  ...prev,
                  [item.key]: !prev[item.key],
                }))
              }
              style={{
                width: 42,
                minWidth: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                backgroundColor: active
                  ? "rgba(255,255,255,0.08)"
                  : "transparent",
                color: "#FFFFFF",
              }}
            >
              <IconChevronDown
                size={18}
                stroke={2}
                style={{
                  transform: opened ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.18s ease",
                  flexShrink: 0,
                }}
              />
            </UnstyledButton>
          </Flex>
        </Tooltip>

        {!collapsed && opened && (
          <Box mt={2}>{item.children?.map((child) => renderChildLink(child))}</Box>
        )}
      </Box>
    );
  }

  function renderDefaultParentWithChildren(item: DashboardMenuItem) {
    const active =
      isPathActive(pathname, item.href) ||
      !!item.children?.some((child) => isPathActive(pathname, child.href));

    const opened = openedMenus[item.key] ?? false;
    const content = renderClickableContent(item, active, opened, true);

    return (
      <Box key={item.key}>
        <Tooltip
          label={collapsed ? item.label : ""}
          disabled={!collapsed}
          position="right"
          withArrow
        >
          <UnstyledButton
            onClick={() =>
              setOpenedMenus((prev) => ({
                ...prev,
                [item.key]: !prev[item.key],
              }))
            }
            style={{
              display: "block",
              width: "100%",
            }}
          >
            {content}
          </UnstyledButton>
        </Tooltip>

        {!collapsed && opened && (
          <Box mt={2}>{item.children?.map((child) => renderChildLink(child))}</Box>
        )}
      </Box>
    );
  }

  function renderMenuItem(item: DashboardMenuItem) {
    const hasChildren = Boolean(item.children?.length);

    if (hasChildren) {
      if (isAdminGudang) {
        return renderAdminGudangParentWithChildren(item);
      }

      return renderDefaultParentWithChildren(item);
    }

    const active = isPathActive(pathname, item.href);
    const content = renderClickableContent(item, active, false);

    return (
      <Tooltip
        key={item.key}
        label={collapsed ? item.label : ""}
        disabled={!collapsed}
        position="right"
        withArrow
      >
        <Link
          href={item.href || "#"}
          style={{
            textDecoration: "none",
            display: "block",
          }}
        >
          {content}
        </Link>
      </Tooltip>
    );
  }

  return (
    <Box
      style={{
        width: collapsed ? 96 : 262,
        minHeight: "100vh",
        backgroundColor: "#052F78",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.18s ease",
        overflow: "hidden",
      }}
    >
      <Box
        bg="#3766AD"
        h={190}
        px={collapsed ? 8 : 16}
        py={20}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Box
          style={{
            position: "relative",
            width: collapsed ? 52 : 150,
            height: collapsed ? 52 : 120,
            transition: "all 0.18s ease",
          }}
        >
          <Image
            src="/Images/logo-dvc.png"
            alt="Logo DVC Computer"
            fill
            priority
            sizes={collapsed ? "52px" : "150px"}
            style={{
              objectFit: "contain",
            }}
          />
        </Box>
      </Box>

      <ScrollArea
        style={{
          flex: 1,
        }}
        scrollbarSize={6}
      >
        <Stack gap={6} px={collapsed ? 10 : 18} py={14}>
          {menuItems.map((item) => renderMenuItem(item))}
        </Stack>
      </ScrollArea>

      <Box
        px={collapsed ? 10 : 16}
        py={14}
        style={{
          backgroundColor: "#052F78",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Group justify="space-between" align="center" wrap="nowrap" gap={8}>
          <UnstyledButton
            onClick={() => router.push(getProfileRoute(user.roleKey))}
            style={{
              flex: 1,
              minWidth: 0,
              borderRadius: 12,
              padding: collapsed ? 6 : 8,
            }}
          >
            <Group
              wrap="nowrap"
              gap={10}
              justify={collapsed ? "center" : "flex-start"}
            >
              <Avatar
                size={40}
                radius="xl"
                src={sidebarAvatarUrl || undefined}
                color="gray"
              >
                {getUserInitials(user.name)}
              </Avatar>

              {!collapsed && (
                <Box style={{ minWidth: 0 }}>
                  <Text
                    fw={700}
                    c="#FFFFFF"
                    truncate
                    style={{
                      fontSize: 16,
                      lineHeight: 1.2,
                    }}
                  >
                    {user.name}
                  </Text>
                  <Text
                    c="rgba(255,255,255,0.75)"
                    truncate
                    style={{
                      fontSize: 14,
                      lineHeight: 1.2,
                    }}
                  >
                    {user.roleName}
                  </Text>
                </Box>
              )}
            </Group>
          </UnstyledButton>

          <Menu withinPortal={false} position="top-end" shadow="md" width={150}>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                radius="xl"
                size={36}
                aria-label="Settings pengguna"
              >
                <IconSettings size={20} stroke={1.9} color="#FFFFFF" />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                color="red"
                leftSection={<IconLogout2 size={18} stroke={1.8} />}
                onClick={handleLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Box>
    </Box>
  );
}