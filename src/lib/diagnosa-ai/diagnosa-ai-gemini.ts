import {
  GoogleGenAI,
  Type,
  type Content,
  type Part,
} from "@google/genai";
import { getDiagnosaAiSystemPrompt } from "@/lib/diagnosa-ai/diagnosa-ai.prompt";

type GeminiHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

type GeminiImageInput = {
  data: string;
  mimeType: string;
};

type GenerateDiagnosaAiWithGeminiParams = {
  message: string;
  history: GeminiHistoryMessage[];
  image?: GeminiImageInput | null;
};

type GenerateDiagnosaAiWithGeminiResult = {
  text: string;
  model: string;
};

const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";
const DEFAULT_GEMINI_FALLBACK_MODEL = "gemini-3.1-flash-lite";

const MAX_GEMINI_ATTEMPTS_PER_MODEL = 2;
const GEMINI_RETRY_DELAY_MS = 800;

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
}

function getGeminiModel() {
  return process.env.DIAGNOSA_AI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

function getGeminiFallbackModel(primaryModel: string) {
  const fallbackModel =
    process.env.DIAGNOSA_AI_FALLBACK_MODEL?.trim() ||
    DEFAULT_GEMINI_FALLBACK_MODEL;

  if (!fallbackModel) {
    return null;
  }

  if (fallbackModel === primaryModel) {
    return null;
  }

  return fallbackModel;
}

function createGeminiClient() {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY belum diset. Tambahkan GEMINI_API_KEY di .env.local dan Vercel Environment Variables."
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
}

function mapRoleToGemini(role: GeminiHistoryMessage["role"]) {
  return role === "assistant" ? "model" : "user";
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getGeminiErrorStatus(error: unknown): number | null {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = Number((error as { status?: unknown }).status);

    if (Number.isFinite(status)) {
      return status;
    }
  }

  if (error instanceof Error) {
    const message = error.message;

    if (
      message.includes('"code":503') ||
      message.includes('"status":"UNAVAILABLE"') ||
      message.includes("ServiceUnavailable") ||
      message.includes("UNAVAILABLE")
    ) {
      return 503;
    }

    if (
      message.includes('"code":429') ||
      message.includes('"status":"RESOURCE_EXHAUSTED"') ||
      message.includes("RESOURCE_EXHAUSTED")
    ) {
      return 429;
    }

    if (message.includes('"code":500')) {
      return 500;
    }

    if (message.includes('"code":502')) {
      return 502;
    }

    if (message.includes('"code":504')) {
      return 504;
    }
  }

  return null;
}

function isRetryableGeminiError(error: unknown) {
  const status = getGeminiErrorStatus(error);

  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

async function runGeminiWithRetryAndFallback<T>(
  runner: (model: string) => Promise<T>,
  primaryModel: string
): Promise<{ result: T; model: string }> {
  const fallbackModel = getGeminiFallbackModel(primaryModel);

  const models = Array.from(
    new Set(
      [primaryModel, fallbackModel].filter(
        (model): model is string => Boolean(model && model.length > 0)
      )
    )
  );

  let lastError: unknown = null;

  for (const currentModel of models) {
    for (
      let attempt = 1;
      attempt <= MAX_GEMINI_ATTEMPTS_PER_MODEL;
      attempt += 1
    ) {
      try {
        console.log(
          `[Diagnosa AI] Memanggil Gemini model=${currentModel}, attempt=${attempt}`
        );

        const result = await runner(currentModel);

        if (currentModel !== primaryModel) {
          console.log(
            `[Diagnosa AI] Berhasil memakai fallback model=${currentModel}`
          );
        }

        return {
          result,
          model: currentModel,
        };
      } catch (error) {
        lastError = error;

        const status = getGeminiErrorStatus(error);

        console.error(
          `[Diagnosa AI] Gemini gagal model=${currentModel}, attempt=${attempt}, status=${status ?? "unknown"}`,
          error
        );

        if (!isRetryableGeminiError(error)) {
          throw error;
        }

        if (attempt < MAX_GEMINI_ATTEMPTS_PER_MODEL) {
          await delay(GEMINI_RETRY_DELAY_MS * attempt);
        }
      }
    }

    if (currentModel === primaryModel && fallbackModel) {
      console.warn(
        `[Diagnosa AI] Primary model ${primaryModel} gagal. Mencoba fallback model ${fallbackModel}.`
      );
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("Gemini gagal memproses permintaan.");
}

function buildGeminiContents(params: GenerateDiagnosaAiWithGeminiParams) {
  const historyContents: Content[] = params.history.map((item) => ({
    role: mapRoleToGemini(item.role),
    parts: [
      {
        text: item.content,
      },
    ],
  }));

  const userParts: Part[] = [
    {
      text: params.message,
    },
  ];

  if (params.image) {
    userParts.push({
      inlineData: {
        data: params.image.data,
        mimeType: params.image.mimeType,
      },
    });
  }

  const currentUserContent: Content = {
    role: "user",
    parts: userParts,
  };

  return [...historyContents, currentUserContent];
}

export async function generateDiagnosaAiWithGemini(
  params: GenerateDiagnosaAiWithGeminiParams
): Promise<GenerateDiagnosaAiWithGeminiResult> {
  const ai = createGeminiClient();
  const model = getGeminiModel();

  const geminiResult = await runGeminiWithRetryAndFallback(
    (selectedModel) =>
      ai.models.generateContent({
        model: selectedModel,
        contents: buildGeminiContents(params),
        config: {
          systemInstruction: getDiagnosaAiSystemPrompt(),
          temperature: 0.25,
          responseMimeType: "application/json",
          responseJsonSchema: {
            type: Type.OBJECT,
            properties: {
              assistantReply: {
                type: Type.STRING,
              },
              isDiagnosis: {
                type: Type.BOOLEAN,
              },
              snapshot: {
                type: Type.OBJECT,
                nullable: true,
                properties: {
                  gejala: {
                    type: Type.STRING,
                  },
                  kemungkinanPenyebab: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                    },
                  },
                  kemungkinanSolusi: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                    },
                  },
                  saranTindakan: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                    },
                  },
                  tingkatUrgensi: {
                    type: Type.STRING,
                    enum: ["rendah", "sedang", "tinggi"],
                  },
                  perluServisLangsung: {
                    type: Type.BOOLEAN,
                  },
                  disclaimer: {
                    type: Type.STRING,
                  },
                },
                required: [
                  "gejala",
                  "kemungkinanPenyebab",
                  "kemungkinanSolusi",
                  "saranTindakan",
                  "tingkatUrgensi",
                  "perluServisLangsung",
                  "disclaimer",
                ],
              },
            },
            required: ["assistantReply", "isDiagnosis", "snapshot"],
          },
        },
      }),
    model
  );

  const text = geminiResult.result.text?.trim() ?? "";

  if (!text) {
    throw new Error("Gemini tidak mengembalikan output teks.");
  }

  return {
    text,
    model: geminiResult.model,
  };
}