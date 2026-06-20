import type {
  DiagnosaAiChatRequest,
  DiagnosaAiChatResponse,
  DiagnosaAiDetailResponse,
} from "@/lib/diagnosa-ai/diagnosa-ai.types";

export async function sendDiagnosaAiChat(
  payload: DiagnosaAiChatRequest
): Promise<DiagnosaAiChatResponse> {
  const response = await fetch("/api/diagnosa-ai/chat", {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: payload.message,
      imageBase64: payload.imageBase64 ?? null,
      history: payload.history ?? [],
      diagnosaAiId: payload.diagnosaAiId ?? null,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Terjadi kesalahan saat memproses Diagnosa AI.",
      errors: data?.errors,
      raw: data?.raw,
    };
  }

  return data as DiagnosaAiChatResponse;
}

export async function getDiagnosaAiDetail(
  diagnosaAiId: string
): Promise<DiagnosaAiDetailResponse> {
  const searchParams = new URLSearchParams({
    diagnosa_ai_id: diagnosaAiId,
  });

  const response = await fetch(`/api/diagnosa-ai/chat?${searchParams.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal mengambil data Diagnosa AI.",
    };
  }

  return data as DiagnosaAiDetailResponse;
}