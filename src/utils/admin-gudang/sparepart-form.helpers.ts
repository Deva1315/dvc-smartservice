import type { FormType } from "@/types/form-types";
import { formatCurrency } from "@/utils/currency-format/format-currency";

export function getSparepartModalTitle(formType: FormType) {
  return formType === "create" ? "Kelola Sparepart" : "Edit Sparepart";
}

export function getSparepartSubmitLabel(formType: FormType) {
  return formType === "create" ? "Simpan Sparepart" : "Update Sparepart";
}

export function parseSparepartCurrencyInput(value: string) {
  const digitsOnly = value.replace(/\D/g, "");

  if (!digitsOnly) {
    return 0;
  }

  const parsed = Number(digitsOnly);

  return Number.isNaN(parsed) ? 0 : parsed;
}

export function getFormattedSparepartHarga(value: number) {
  if (!value || value <= 0) {
    return "";
  }

  return formatCurrency(value, {
    locale: "id-ID",
    prefix: "Rp ",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}