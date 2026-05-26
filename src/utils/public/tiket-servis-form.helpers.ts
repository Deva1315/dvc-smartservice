import type { TicketDropPointOption } from "@/types/tiket-servis-form.types";

export function toInputDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function toDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function getDropPointDistanceLabel(
  item?: TicketDropPointOption | null
) {
  if (!item) {
    return null;
  }

  if (item.jarakLabel) {
    return item.jarakLabel;
  }

  if (typeof item.jarakKm === "number" && Number.isFinite(item.jarakKm)) {
    if (item.jarakKm < 1) {
      return `${Math.round(item.jarakKm * 1000)} m`;
    }

    return `${item.jarakKm.toFixed(1)} km`;
  }

  return null;
}

export function buildDropPointLabel(item: TicketDropPointOption) {
  const name = item.originalLabel || item.label;
  const distanceLabel = getDropPointDistanceLabel(item);

  if (!distanceLabel) {
    return name;
  }

  return `${name} — ${distanceLabel}`;
}

export function normalizeDropPointDistanceKm(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}