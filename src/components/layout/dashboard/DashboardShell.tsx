"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box, Center, Loader } from "@mantine/core";
import DashboardHeader from "@/components/layout/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/layout/dashboard/DashboardSidebar";
import {
  getDashboardHomeRoute,
  getDashboardMenuByRole,
  getDashboardPageTitle,
  getProfileRoute,
} from "@/lib/dashboard-menu/dashboard-menu";
import type { DashboardSessionUser } from "@/lib/auth/get-dashboard-user";

type DashboardShellProps = {
  children: React.ReactNode;
  user: DashboardSessionUser;
};

export default function DashboardShell({
  children,
  user,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const homeRoute = getDashboardHomeRoute(user.roleKey);
  const isAllowedRoute =
    pathname === homeRoute || pathname.startsWith(`${homeRoute}/`);

  useEffect(() => {
    if (!isAllowedRoute) {
      router.replace(homeRoute);
    }
  }, [homeRoute, isAllowedRoute, router]);

  useEffect(() => {
  const menuItems = getDashboardMenuByRole(user.roleKey);

  for (const item of menuItems) {
    if (item.href) {
      router.prefetch(item.href);
    }

    if (item.children?.length) {
      for (const child of item.children) {
        router.prefetch(child.href);
      }
    }
  }

  router.prefetch(getProfileRoute(user.roleKey));
}, [router, user.roleKey]);

  const pageTitle = getDashboardPageTitle(user.roleKey, pathname);

  if (!isAllowedRoute) {
    return (
      <Center
        style={{
          minHeight: "100vh",
          backgroundColor: "#D9D9D9",
        }}
      >
        <Loader color="blue" size="lg" />
      </Center>
    );
  }

  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#D9D9D9",
      }}
    >
      <DashboardSidebar user={user} collapsed={collapsed} />

      <Box
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <DashboardHeader
          title={pageTitle}
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed((prev) => !prev)}
        />

        <Box
          px={24}
          py={24}
          style={{
            flex: 1,
            backgroundColor: "#D9D9D9",
            borderBottomLeftRadius: 18,
            overflow: "hidden",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}