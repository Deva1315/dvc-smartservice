import type React from "react";
import {
  IconBasket,
  IconCertificate,
  IconClipboardList,
  IconClipboardText,
  IconCpu,
  IconLayoutDashboard,
  IconMapPin,
  IconReportAnalytics,
  IconShieldCheck,
  IconShoppingCart,
  IconTool,
  IconUsers,
} from "@tabler/icons-react";

export type DashboardRoleKey =
  | "owner"
  | "admin_penjualan"
  | "admin_gudang"
  | "teknisi";

type DashboardIcon = React.ComponentType<{
  size?: number | string;
  stroke?: number;
  color?: string;
}>;

export type DashboardMenuChildItem = {
  key: string;
  label: string;
  href: string;
};

export type DashboardMenuItem = {
  key: string;
  label: string;
  href?: string;
  icon: DashboardIcon;
  children?: DashboardMenuChildItem[];
};

export const DASHBOARD_ROLE_LABEL: Record<DashboardRoleKey, string> = {
  owner: "Owner",
  admin_penjualan: "Admin Penjualan",
  admin_gudang: "Admin Gudang",
  teknisi: "Teknisi",
};

const DASHBOARD_MENU: Record<DashboardRoleKey, DashboardMenuItem[]> = {
  owner: [
    {
      key: "dashboard",
      label: "Dashboard",
      href: "/owner",
      icon: IconLayoutDashboard,
    },
    {
      key: "kelola-pegawai",
      label: "Kelola Pegawai",
      href: "/owner/kelola-pegawai",
      icon: IconUsers,
    },
    {
      key: "laporan",
      label: "Laporan",
      icon: IconReportAnalytics,
      children: [
        {
          key: "laporan-penjualan",
          label: "Laporan Penjualan",
          href: "/owner/laporan/penjualan",
        },
        {
          key: "laporan-servis",
          label: "Laporan Servis",
          href: "/owner/laporan/servis",
        },
        {
          key: "laporan-stock-barang",
          label: "Laporan Stock Barang",
          href: "/owner/laporan/stock-barang",
        },
        {
          key: "laporan-stock-sparepart",
          label: "Laporan Stock Sparepart",
          href: "/owner/laporan/stock-sparepart",
        },
        {
          key: "laporan-pendapatan-gabungan",
          label: "Laporan Pendapatan Gabungan",
          href: "/owner/laporan/pendapatan-gabungan",
        },
      ],
    },
    {
      key: "drop-point",
      label: "Drop Point",
      href: "/owner/drop-point",
      icon: IconMapPin,
    },
  ],

  admin_penjualan: [
    {
      key: "jasa-servis",
      label: "Jasa Servis",
      href: "/admin_penjualan/jasa-servis",
      icon: IconTool,
    },
    {
      key: "tiket-servis",
      label: "Tiket Servis",
      href: "/admin_penjualan/tiket-servis",
      icon: IconClipboardText,
    },
    {
      key: "garansi-servis",
      label: "Garansi Servis",
      href: "/admin_penjualan/garansi-servis",
      icon: IconCertificate,
    },
    {
      key: "klaim-garansi",
      label: "Klaim Garansi",
      href: "/admin_penjualan/klaim-garansi",
      icon: IconShieldCheck,
    },
    {
      key: "point-of-sale",
      label: "Point of Sale",
      href: "/admin_penjualan/point-of-sale",
      icon: IconShoppingCart,
    },
  ],

  admin_gudang: [
    {
      key: "barang",
      label: "Barang",
      href: "/admin_gudang/barang",
      icon: IconBasket,
    },
        {
      key: "kategori",
      label: "Kategori Barang",
      href: "/admin_gudang/kategori",
      icon: IconClipboardText,
    },
    {
      key: "sparepart",
      label: "Sparepart",
      href: "/admin_gudang/sparepart",
      icon: IconCpu,
    },
    {
      key: "suppliers",
      label: "Suppliers",
      href: "/admin_gudang/suppliers",
      icon: IconReportAnalytics,
    },
    {
      key: "inventory",
      label: "Inventory",
      href: "/admin_gudang/inventory",
      icon: IconLayoutDashboard,
      children: [
        {
          key: "barang-masuk",
          label: "Barang Masuk",
          href: "/admin_gudang/inventory/barang-masuk",
        },
        {
          key: "barang-keluar",
          label: "Barang Keluar",
          href: "/admin_gudang/inventory/barang-keluar",
        },
        {
          key: "stok-opname",
          label: "Stok Opname",
          href: "/admin_gudang/inventory/stok-opname",
        },
      ],
    },
  ],

  teknisi: [
    {
      key: "antrian-servis",
      label: "Antrian Servis",
      href: "/teknisi/antrian-tiket-servis",
      icon: IconClipboardList,
    }
  ],
};

export function getDashboardMenuByRole(roleKey: DashboardRoleKey): DashboardMenuItem[] {
  return DASHBOARD_MENU[roleKey];
}

export function getDashboardHomeRoute(roleKey: DashboardRoleKey): string {
  return `/${roleKey}`;
}

export function getProfileRoute(roleKey: DashboardRoleKey): string {
  return `/${roleKey}/profile`;
}

function normalizeRole(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_");
}

export function resolveDashboardRoleKey(rawRole?: string | null): DashboardRoleKey | null {
  if (!rawRole) return null;

  const normalized = normalizeRole(rawRole);

  if (normalized === "owner") return "owner";

  if (
    normalized === "admin_penjualan" ||
    normalized === "adminpenjualan" ||
    normalized.includes("penjualan")
  ) {
    return "admin_penjualan";
  }

  if (
    normalized === "admin_gudang" ||
    normalized === "admingudang" ||
    normalized.includes("gudang")
  ) {
    return "admin_gudang";
  }

  if (normalized === "teknisi" || normalized.includes("teknisi")) {
    return "teknisi";
  }

  return null;
}

function flattenMenuItems(menu: DashboardMenuItem[]) {
  const results: { label: string; href: string }[] = [];

  for (const item of menu) {
    if (item.href) {
      results.push({
        label: item.label,
        href: item.href,
      });
    }

    if (item.children?.length) {
      for (const child of item.children) {
        results.push({
          label: child.label,
          href: child.href,
        });
      }
    }
  }

  return results;
}

function humanizeSegment(segment: string): string {
  return segment
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getDashboardPageTitle(
  roleKey: DashboardRoleKey,
  pathname: string
): string {
  const cleanPath = pathname.split("?")[0].replace(/\/$/, "") || `/${roleKey}`;

  if (cleanPath === `/${roleKey}`) {
    return "Dashboard";
  }

  if (cleanPath === getProfileRoute(roleKey)) {
    return "Profile";
  }

  const flattened = flattenMenuItems(getDashboardMenuByRole(roleKey));
  const matched = flattened.find((item) => item.href === cleanPath);

  if (matched) {
    return matched.label;
  }

  const lastSegment = cleanPath.split("/").filter(Boolean).pop();

  return humanizeSegment(lastSegment || "Dashboard");
}