import {
  getDashboardHomeRoute,
  resolveDashboardRoleKey,
} from "@/lib/dashboard-menu/dashboard-menu";

export type AuthUser = {
  id: string;
  nama: string;
  email: string;
  roleId: string;
  roleName: string;
  address: string | null;
  phone: string | null;
  photoProfilePath: string | null;
};

export type LoginResponse =
  | {
      success: true;
      message: string;
      user: AuthUser;
      token?: string;
    }
  | {
      success: false;
      message: string;
      errors?: unknown;
    };

export type MeResponse =
  | {
      success: true;
      authenticated: true;
      user: AuthUser;
    }
  | {
      success: false;
      authenticated: false;
      user: null;
      message: string;
    };

export async function loginRequest(payload: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Terjadi kesalahan saat login.",
      errors: data?.errors,
    };
  }

  return data as LoginResponse;
}

export async function getCurrentSession(): Promise<MeResponse> {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      authenticated: false,
      user: null,
      message: data?.message ?? "Belum login.",
    };
  }

  return data as MeResponse;
}

export async function logoutRequest() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  return response.json().catch(() => null);
}

export function getDashboardPathByRoleName(roleName: string) {
  const roleKey = resolveDashboardRoleKey(roleName);

  if (!roleKey) {
    return "/";
  }

  return getDashboardHomeRoute(roleKey);
}