import { formatCurrency } from "@/utils/currency-format/format-currency";
import type { FormType } from "@/types/form-types";

export function getBarangModalTitle(formType: FormType) {
  return formType === "create" ? "Kelola Barang" : "Edit Barang";
}

export function getBarangSubmitLabel(formType: FormType) {
  return formType === "create" ? "Simpan Barang" : "Update Barang";
}

export function parseBarangCurrencyInput(value: string) {
  const digitsOnly = value.replace(/\D/g, "");

  if (!digitsOnly) {
    return 0;
  }

  const parsed = Number(digitsOnly);

  return Number.isNaN(parsed) ? 0 : parsed;
}

export function getFormattedBarangHarga(value: number) {
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