import { z } from "zod";
import type {
  DiagnosaAiModelResponse,
} from "@/lib/diagnosa-ai/diagnosa-ai.types";

export const diagnosaAiChatRequestSchema = z.object({
  message: z.string().trim().min(1, "Pesan wajib diisi."),
  imageBase64: z.string().trim().nullable().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1),
      })
    )
    .optional()
    .default([]),
  diagnosaAiId: z.string().trim().nullable().optional(),
});

export const diagnosaAiModelResponseSchema = z.object({
  assistantReply: z.string().min(1),
  snapshot: z.object({
    gejala: z.string().min(1),
    kemungkinanPenyebab: z.array(z.string().min(1)).min(2),
    kemungkinanSolusi: z.array(z.string().min(1)).min(2),
    saranTindakan: z.array(z.string().min(1)).min(2),
    tingkatUrgensi: z.enum(["rendah", "sedang", "tinggi"]),
    perluServisLangsung: z.boolean(),
    disclaimer: z.string().min(1),
  }),
});

export function parseModelJson(text: string): DiagnosaAiModelResponse {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  const parsed = JSON.parse(cleaned);
  return diagnosaAiModelResponseSchema.parse(parsed);
}

export function normalizeDiagnosaAiId(value?: string | null) {
  if (!value) return null;

  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

export function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export function buildSavedSnapshotStrings(
  snapshot: DiagnosaAiModelResponse["snapshot"]
) {
  return {
    gejala: snapshot.gejala,
    kemungkinan_penyebab: snapshot.kemungkinanPenyebab.join("\n- "),
    kemungkinan_solusi: snapshot.kemungkinanSolusi.join("\n- "),
    saran_tindakan: snapshot.saranTindakan.join("\n- "),
  };
}

export function normalizeImageMarker(imageBase64?: string | null) {
  if (!imageBase64) return null;
  return "[image-attached]";
}

export function extractPureBase64Image(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();

  if (trimmed.startsWith("blob:")) {
    return null;
  }

  if (trimmed.startsWith("data:image/")) {
    const parts = trimmed.split(",");
    if (parts.length < 2) return null;

    const pureBase64 = parts[1]?.replace(/\s/g, "") ?? "";
    if (!pureBase64) return null;

    if (!/^[A-Za-z0-9+/]+=*$/.test(pureBase64)) {
      return null;
    }

    return pureBase64;
  }

  const maybePureBase64 = trimmed.replace(/\s/g, "");
  if (/^[A-Za-z0-9+/]+=*$/.test(maybePureBase64)) {
    return maybePureBase64;
  }

  return null;
}

export function buildNextHistory(params: {
  history: { role: "user" | "assistant"; content: string }[];
  userMessage: string;
  assistantMessage: string;
}) {
  return [
    ...params.history,
    {
      role: "user" as const,
      content: params.userMessage,
    },
    {
      role: "assistant" as const,
      content: params.assistantMessage,
    },
  ];
}