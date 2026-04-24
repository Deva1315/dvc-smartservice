import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/layout/dashboard/DashboardShell";
import { getAuthSession } from "@/lib/auth/get-auth-session";
import { mapSessionUserToDashboardUser } from "@/lib/auth/get-dashboard-user";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await getAuthSession();
  const user = mapSessionUserToDashboardUser(session);

  if (!user) {
    redirect("/login");
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}