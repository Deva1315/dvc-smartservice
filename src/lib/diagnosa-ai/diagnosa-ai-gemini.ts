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

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
}

function getGeminiModel() {
  return process.env.DIAGNOSA_AI_MODEL || "gemini-2.5-flash";
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

  const response = await ai.models.generateContent({
    model,
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
          snapshot: {
            type: Type.OBJECT,
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
        required: ["assistantReply", "snapshot"],
      },
    },
  });

  const text = response.text?.trim() ?? "";

  if (!text) {
    throw new Error("Gemini tidak mengembalikan output teks.");
  }

  return {
    text,
    model,
  };
}