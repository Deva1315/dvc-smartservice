import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chatWithOllama } from "@/lib/ollama/ollama";
import { getDiagnosaAiSystemPrompt } from "@/lib/diagnosa-ai/diagnosa-ai.prompt";
import {
  buildNextHistory,
  buildSavedSnapshotStrings,
  diagnosaAiChatRequestSchema,
  extractPureBase64Image,
  normalizeDiagnosaAiId,
  normalizeImageMarker,
  parseModelJson,
  serializeBigInt,
} from "@/utils/public/diagnosa-ai.utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = diagnosaAiChatRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Payload chat Diagnosa AI tidak valid.",
          errors: parsedBody.error.flatten(),
        },
        { status: 400 }
      );
    }

    const payload = parsedBody.data;
    const pureBase64Image = extractPureBase64Image(payload.imageBase64);

    if (payload.imageBase64 && !pureBase64Image) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Gambar tidak valid. Kirim data URL base64 atau base64 murni yang valid.",
        },
        { status: 400 }
      );
    }

    const ollamaMessages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
      images?: string[];
    }> = [
      {
        role: "system",
        content: getDiagnosaAiSystemPrompt(),
      },
      ...payload.history.map((item) => ({
        role: item.role,
        content: item.content,
      })),
      {
        role: "user",
        content: payload.message,
        ...(pureBase64Image ? { images: [pureBase64Image] } : {}),
      },
    ];

    const ollamaResponse = await chatWithOllama({
      model: process.env.DIAGNOSA_AI_MODEL || "gemma3",
      messages: ollamaMessages,
      stream: false,
    });

    const assistantRawText = ollamaResponse.message?.content?.trim();

    if (!assistantRawText) {
      return NextResponse.json(
        {
          success: false,
          message: "Model Ollama tidak mengembalikan output.",
        },
        { status: 502 }
      );
    }

    let parsedModelResponse;

    try {
      parsedModelResponse = parseModelJson(assistantRawText);
    } catch (error) {
      console.error("PARSE OLLAMA JSON ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Output Ollama bukan JSON valid.",
          raw: assistantRawText,
        },
        { status: 502 }
      );
    }

    const snapshotStrings = buildSavedSnapshotStrings(
      parsedModelResponse.snapshot
    );

    const diagnosaAiId = normalizeDiagnosaAiId(payload.diagnosaAiId);

    let savedDiagnosa;

    if (diagnosaAiId) {
      savedDiagnosa = await prisma.diagnosa_ai.update({
        where: {
          id: diagnosaAiId,
        },
        data: {
          gejala: snapshotStrings.gejala,
          gambar_gejala: normalizeImageMarker(payload.imageBase64),
          kemungkinan_penyebab: snapshotStrings.kemungkinan_penyebab,
          kemungkinan_solusi: snapshotStrings.kemungkinan_solusi,
          saran_tindakan: snapshotStrings.saran_tindakan,
        },
        select: {
          id: true,
          gejala: true,
          gambar_gejala: true,
          kemungkinan_penyebab: true,
          kemungkinan_solusi: true,
          saran_tindakan: true,
        },
      });
    } else {
      savedDiagnosa = await prisma.diagnosa_ai.create({
        data: {
          gejala: snapshotStrings.gejala,
          gambar_gejala: normalizeImageMarker(payload.imageBase64),
          kemungkinan_penyebab: snapshotStrings.kemungkinan_penyebab,
          kemungkinan_solusi: snapshotStrings.kemungkinan_solusi,
          saran_tindakan: snapshotStrings.saran_tindakan,
        },
        select: {
          id: true,
          gejala: true,
          gambar_gejala: true,
          kemungkinan_penyebab: true,
          kemungkinan_solusi: true,
          saran_tindakan: true,
        },
      });
    }

    const nextHistory = buildNextHistory({
      history: payload.history,
      userMessage: payload.message,
      assistantMessage: parsedModelResponse.assistantReply,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Balasan Diagnosa AI berhasil dibuat.",
        data: {
          diagnosaAiId: savedDiagnosa.id.toString(),
          assistantMessage: parsedModelResponse.assistantReply,
          snapshot: parsedModelResponse.snapshot,
          nextHistory,
          savedDiagnosa: serializeBigInt(savedDiagnosa),
          source: "ollama",
          model: ollamaResponse.model,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/diagnosa-ai/chat error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memproses chat Diagnosa AI.",
      },
      { status: 500 }
    );
  }
}