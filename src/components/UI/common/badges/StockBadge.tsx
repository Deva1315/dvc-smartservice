"use client";

import { Badge, BadgeProps } from "@mantine/core";

type StockBadgeProps = {
  value?: number | string | null;
  label?: string;
  showValue?: boolean;
  size?: BadgeProps["size"];
  variant?: BadgeProps["variant"];
  radius?: BadgeProps["radius"];
  fullWidth?: boolean;
};

function parseStock(value?: number | string | null) {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function getStockConfig(stock: number) {
  if (stock <= 0) {
    return {
      color: "red",
      label: "Stok Habis",
    };
  }

  if (stock <= 5) {
    return {
      color: "yellow",
      label: "Stok Rendah",
    };
  }

  return {
    color: "green",
    label: "Stok Aman",
  };
}

export default function StockBadge({
  value,
  label,
  showValue = true,
  size = "sm",
  variant = "light",
  radius = "xl",
  fullWidth = false,
}: StockBadgeProps) {
  const stock = parseStock(value);
  const config = getStockConfig(stock);
  const finalLabel = label ?? config.label;

  return (
    <Badge
      color={config.color}
      size={size}
      variant={variant}
      radius={radius}
      fullWidth={fullWidth}
      tt="none"
    >
      {showValue ? `${finalLabel} (${stock})` : finalLabel}
    </Badge>
  );
}