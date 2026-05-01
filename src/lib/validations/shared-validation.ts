import { z } from "zod";

export type FormErrorMap = Record<string, string>;

function isEmptyValue(value: unknown) {
  return value === null || value === undefined || value === "";
}

export function getZodFieldErrors(error: z.ZodError): FormErrorMap {
  const errors: FormErrorMap = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!key) continue;

    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }

  return errors;
}

export function getFirstZodErrorMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Data form tidak valid.";
}

export function validateWithZod<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  data: unknown
):
  | {
      success: true;
      data: z.infer<TSchema>;
      errors: FormErrorMap;
      message: string;
    }
  | {
      success: false;
      data: null;
      errors: FormErrorMap;
      message: string;
    } {
  const parsed = schema.safeParse(data);

  if (parsed.success) {
    return {
      success: true,
      data: parsed.data,
      errors: {},
      message: "",
    };
  }

  return {
    success: false,
    data: null,
    errors: getZodFieldErrors(parsed.error),
    message: getFirstZodErrorMessage(parsed.error),
  };
}

export function requiredString(label: string, max?: number) {
  let schema = z.string().trim().min(1, `${label} wajib diisi.`);

  if (max) {
    schema = schema.max(max, `${label} maksimal ${max} karakter.`);
  }

  return schema;
}

export function optionalString(max?: number) {
  let schema = z.string().trim();

  if (max) {
    schema = schema.max(max, `Maksimal ${max} karakter.`);
  }

  return z.preprocess((value) => {
    if (typeof value !== "string") return value;

    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }, schema.nullable().optional());
}

export function requiredSelect(label: string) {
  return z.preprocess(
    (value) => {
      if (isEmptyValue(value)) return "";
      return String(value).trim();
    },
    z.string().min(1, `${label} wajib dipilih.`)
  );
}

export function requiredDate(label: string) {
  return z.preprocess(
    (value) => (isEmptyValue(value) ? "" : value),
    z
      .union([z.string().trim().min(1, `${label} wajib diisi.`), z.date()])
      .refine((value) => {
        const date = value instanceof Date ? value : new Date(value);
        return !Number.isNaN(date.getTime());
      }, `${label} tidak valid.`)
  );
}

export function optionalDate(label: string) {
  return z.preprocess(
    (value) => (isEmptyValue(value) ? null : value),
    z
      .union([z.string(), z.date(), z.null()])
      .refine((value) => {
        if (value === null) return true;

        const date = value instanceof Date ? value : new Date(value);
        return !Number.isNaN(date.getTime());
      }, `${label} tidak valid.`)
      .optional()
  );
}

export function positiveNumber(label: string) {
  return z.preprocess(
    (value) => (isEmptyValue(value) ? 0 : value),
    z.coerce
      .number()
      .finite(`${label} wajib berupa angka.`)
      .positive(`${label} harus lebih dari 0.`)
  );
}

export function nonNegativeNumber(label: string) {
  return z.preprocess(
    (value) => (isEmptyValue(value) ? 0 : value),
    z.coerce
      .number()
      .finite(`${label} wajib berupa angka.`)
      .min(0, `${label} tidak boleh negatif.`)
  );
}

export function positiveInteger(label: string) {
  return z.preprocess(
    (value) => (isEmptyValue(value) ? 0 : value),
    z.coerce
      .number()
      .int(`${label} harus berupa bilangan bulat.`)
      .positive(`${label} harus lebih dari 0.`)
  );
}

export function nonNegativeInteger(label: string) {
  return z.preprocess(
    (value) => (isEmptyValue(value) ? 0 : value),
    z.coerce
      .number()
      .int(`${label} harus berupa bilangan bulat.`)
      .min(0, `${label} tidak boleh negatif.`)
  );
}

const phoneRegex = /^[0-9+\-\s()]+$/;

export function requiredPhone(label = "No HP") {
  return requiredString(label, 25).regex(
    phoneRegex,
    `${label} hanya boleh berisi angka, spasi, +, -, atau tanda kurung.`
  );
}

export function optionalPhone(label = "No HP") {
  return optionalString(25).refine((value) => {
    if (!value) return true;
    return phoneRegex.test(value);
  }, `${label} hanya boleh berisi angka, spasi, +, -, atau tanda kurung.`);
}

export const nullableFileSchema = z.any().nullable().optional();