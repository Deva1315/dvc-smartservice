"use client";

import { Badge, BadgeProps } from "@mantine/core";

type StatusBadgeType =
  | "default"
  | "servis"
  | "verifikasi"
  | "pembayaran"
  | "garansi"
  | "klaim"
  | "stok"
  | "mutasi";

type StatusBadgeProps = {
  value?: string | null;
  type?: StatusBadgeType;
  label?: string;
  size?: BadgeProps["size"];
  variant?: BadgeProps["variant"];
  radius?: BadgeProps["radius"];
  fullWidth?: boolean;
};

function normalizeStatus(value?: string | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_");
}

function formatStatusLabel(value?: string | null) {
  if (!value) return "-";

  return String(value)
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (word.length <= 2) return word.toUpperCase();

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function getStatusColor(status: string, type: StatusBadgeType) {
  const normalized = normalizeStatus(status);

  const successStatuses = [
    "aktif",
    "tersedia",
    "terverifikasi",
    "selesai",
    "diambil",
    "lunas",
    "berhasil",
    "diterima",
    "disetujui",
    "valid",
    "aman",
    "completed",
    "success",
  ];

  const warningStatuses = [
    "menunggu",
    "menunggu_verifikasi",
    "belum_diproses",
    "diproses",
    "menunggu_sparepart",
    "pending",
    "proses",
    "draft",
    "belum_lunas",
    "stok_rendah",
  ];

  const dangerStatuses = [
    "tidak_aktif",
    "ditolak",
    "dibatalkan",
    "gagal",
    "expired",
    "kadaluarsa",
    "habis",
    "stok_habis",
    "cancelled",
    "failed",
  ];

  const infoStatuses = [
    "barang_masuk",
    "masuk",
    "klaim",
    "diajukan",
    "baru",
    "open",
  ];

  const blueStatuses = [
    "barang_keluar",
    "keluar",
    "servis",
    "penjualan",
    "invoice",
  ];

  if (type === "servis") {
    if (["selesai", "diambil"].includes(normalized)) return "green";
    if (["dibatalkan", "ditolak"].includes(normalized)) return "red";
    if (["menunggu_sparepart"].includes(normalized)) return "orange";
    if (["diproses", "belum_diproses", "diterima"].includes(normalized)) {
      return "blue";
    }
  }

  if (type === "verifikasi") {
    if (["terverifikasi", "disetujui"].includes(normalized)) return "green";
    if (["ditolak"].includes(normalized)) return "red";
    if (["menunggu", "menunggu_verifikasi"].includes(normalized)) {
      return "yellow";
    }
  }

  if (type === "pembayaran") {
    if (["lunas", "berhasil"].includes(normalized)) return "green";
    if (["belum_lunas", "pending", "menunggu"].includes(normalized)) {
      return "yellow";
    }
    if (["gagal", "dibatalkan"].includes(normalized)) return "red";
  }

  if (type === "garansi") {
    if (["aktif", "valid"].includes(normalized)) return "green";
    if (["expired", "kadaluarsa", "tidak_aktif"].includes(normalized)) {
      return "red";
    }
  }

  if (type === "klaim") {
    if (["disetujui", "selesai", "diterima"].includes(normalized)) {
      return "green";
    }
    if (["ditolak", "dibatalkan"].includes(normalized)) return "red";
    if (["diajukan", "menunggu", "diproses"].includes(normalized)) {
      return "yellow";
    }
  }

  if (type === "mutasi") {
    if (["barang_masuk", "masuk"].includes(normalized)) return "green";
    if (["barang_keluar", "keluar"].includes(normalized)) return "blue";
  }

  if (successStatuses.includes(normalized)) return "green";
  if (warningStatuses.includes(normalized)) return "yellow";
  if (dangerStatuses.includes(normalized)) return "red";
  if (infoStatuses.includes(normalized)) return "cyan";
  if (blueStatuses.includes(normalized)) return "blue";

  return "gray";
}

export default function StatusBadge({
  value,
  type = "default",
  label,
  size = "sm",
  variant = "light",
  radius = "xl",
  fullWidth = false,
}: StatusBadgeProps) {
  const finalLabel = label ?? formatStatusLabel(value);
  const color = getStatusColor(value ?? "", type);

  return (
    <Badge
      color={color}
      size={size}
      variant={variant}
      radius={radius}
      fullWidth={fullWidth}
      tt="none"
    >
      {finalLabel}
    </Badge>
  );
}