import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDiagnosaAiWithGemini } from "@/lib/diagnosa-ai/diagnosa-ai-gemini";
import {
  buildNextHistory,
  buildSavedSnapshotStrings,
  diagnosaAiChatRequestSchema,
  extractBase64ImageData,
  MAX_DIAGNOSA_AI_IMAGE_BYTES,
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
    const imageData = extractBase64ImageData(payload.imageBase64);

    if (payload.imageBase64 && !imageData) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Gambar tidak valid. Gunakan gambar JPG, JPEG, PNG, atau WEBP dalam format base64.",
        },
        { status: 400 }
      );
    }

    if (imageData && imageData.sizeBytes > MAX_DIAGNOSA_AI_IMAGE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Ukuran gambar terlalu besar. Maksimal gambar untuk Diagnosa AI adalah 5 MB.",
        },
        { status: 413 }
      );
    }

    const geminiResponse = await generateDiagnosaAiWithGemini({
      message: payload.message,
      history: payload.history,
      image: imageData
        ? {
            data: imageData.data,
            mimeType: imageData.mimeType,
          }
        : null,
    });

    const assistantRawText = geminiResponse.text.trim();

    if (!assistantRawText) {
      return NextResponse.json(
        {
          success: false,
          message: "Gemini tidak mengembalikan output.",
        },
        { status: 502 }
      );
    }

    let parsedModelResponse;

    try {
      parsedModelResponse = parseModelJson(assistantRawText);
    } catch (error) {
      console.error("PARSE GEMINI JSON ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Output Gemini bukan JSON valid.",
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
          source: "gemini",
          model: geminiResponse.model,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/diagnosa-ai/chat error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Konfigurasi Gemini belum lengkap. Tambahkan GEMINI_API_KEY di .env.local dan Vercel Environment Variables.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memproses chat Diagnosa AI.",
      },
      { status: 500 }
    );
  }
}