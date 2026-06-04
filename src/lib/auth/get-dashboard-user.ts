import type { SessionUser } from "./auth.types";
import {
  DASHBOARD_ROLE_LABEL,
  resolveDashboardRoleKey,
  type DashboardRoleKey,
} from "@/lib/dashboard-menu/dashboard-menu";

export type DashboardSessionUser = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleKey: DashboardRoleKey;
  roleName: string;
  address: string | null;
  phone: string | null;
  avatarUrl: string | null;
};

function normalizeAvatarUrl(path?: string | null): string | null {
  if (!path) {
    return null;
  }

  const cleanPath = path.trim();

  if (!cleanPath) {
    return null;
  }

  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    return cleanPath;
  }

  if (cleanPath.startsWith("/")) {
    return cleanPath;
  }

  if (cleanPath.startsWith("public/")) {
    return `/${cleanPath.replace(/^public\//, "")}`;
  }

  return `/${cleanPath}`;
}

export function mapSessionUserToDashboardUser(
  sessionUser: SessionUser | null
): DashboardSessionUser | null {
  if (!sessionUser) {
    return null;
  }

  const roleKey = resolveDashboardRoleKey(sessionUser.roleName);

  if (!roleKey) {
    return null;
  }

  return {
    id: sessionUser.id,
    name: sessionUser.nama,
    email: sessionUser.email,
    roleId: sessionUser.roleId,
    roleKey,
    roleName: sessionUser.roleName || DASHBOARD_ROLE_LABEL[roleKey],
    address: sessionUser.address ?? null,
    phone: sessionUser.phone ?? null,
    avatarUrl: normalizeAvatarUrl(sessionUser.photoProfilePath),
  };
}

export function getUserInitials(name: string): string {
  const cleanedName = name.trim();

  if (!cleanedName) {
    return "U";
  }

  const parts = cleanedName.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }

  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}