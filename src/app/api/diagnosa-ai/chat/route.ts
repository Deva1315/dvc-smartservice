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

function getRouteErrorStatus(error: unknown) {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = Number((error as { status?: unknown }).status);

    if (
      [
        400, 401, 403, 404, 408, 409, 413, 422, 429, 500, 502, 503, 504,
      ].includes(status)
    ) {
      return status;
    }
  }

  if (error instanceof Error) {
    if (
      error.message.includes('"code":503') ||
      error.message.includes('"status":"UNAVAILABLE"') ||
      error.message.includes("ServiceUnavailable") ||
      error.message.includes("UNAVAILABLE")
    ) {
      return 503;
    }

    if (
      error.message.includes('"code":429') ||
      error.message.includes('"status":"RESOURCE_EXHAUSTED"') ||
      error.message.includes("RESOURCE_EXHAUSTED")
    ) {
      return 429;
    }

    if (error.message.includes('"code":502')) {
      return 502;
    }

    if (error.message.includes('"code":504')) {
      return 504;
    }
  }

  return 500;
}

function getRouteErrorMessage(error: unknown, status: number) {
  const errorMessage = error instanceof Error ? error.message : "";

  if (errorMessage.includes("GEMINI_API_KEY")) {
    return "Konfigurasi Gemini belum lengkap. Tambahkan GEMINI_API_KEY di .env.local dan Vercel Environment Variables.";
  }

  if (status === 503) {
    return "Layanan Diagnosa AI sedang ramai. Silakan coba lagi beberapa saat.";
  }

  if (status === 429) {
    return "Batas penggunaan Diagnosa AI sedang penuh. Silakan coba lagi beberapa saat.";
  }

  if (status === 502 || status === 504) {
    return "Koneksi ke layanan Diagnosa AI sedang bermasalah. Silakan coba lagi beberapa saat.";
  }

  return "Terjadi kesalahan saat memproses chat Diagnosa AI.";
}

function splitAiListText(value: string | null | undefined) {
  return String(value ?? "")
    .split("\n")
    .map((item) =>
      item
        .replace(/^[-•]\s*/, "")
        .replace(/^\d+[.)]\s*/, "")
        .trim()
    )
    .filter(Boolean);
}

function pilihSolusiTerbaik(diagnosaAi: {
  kemungkinan_solusi: string | null;
  saran_tindakan: string | null;
}) {
  const solusi = splitAiListText(diagnosaAi.kemungkinan_solusi);
  const saran = splitAiListText(diagnosaAi.saran_tindakan);

  return solusi[0] || saran[0] || null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawId = String(
      searchParams.get("diagnosa_ai_id") ?? searchParams.get("id") ?? ""
    ).trim();

    if (!rawId) {
      return NextResponse.json(
        {
          success: false,
          message: "ID Diagnosa AI wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!/^\d+$/.test(rawId)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID Diagnosa AI tidak valid.",
        },
        { status: 400 }
      );
    }

    const diagnosaAi = await prisma.diagnosa_ai.findUnique({
      where: {
        id: BigInt(rawId),
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

    if (!diagnosaAi) {
      return NextResponse.json(
        {
          success: false,
          message: "Data Diagnosa AI tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data Diagnosa AI berhasil diambil.",
      data: {
        id: diagnosaAi.id.toString(),
        gejala: diagnosaAi.gejala,
        gambar_gejala: diagnosaAi.gambar_gejala,
        kemungkinan_penyebab: diagnosaAi.kemungkinan_penyebab,
        kemungkinan_solusi: diagnosaAi.kemungkinan_solusi,
        saran_tindakan: diagnosaAi.saran_tindakan,
        diagnosa_awal_kerusakan: pilihSolusiTerbaik(diagnosaAi),
      },
    });
  } catch (error) {
    console.error("GET /api/diagnosa-ai/chat error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data Diagnosa AI.",
      },
      { status: 500 }
    );
  }
}

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

    const diagnosaAiId = normalizeDiagnosaAiId(payload.diagnosaAiId);

    let savedDiagnosa = null;
    let responseDiagnosaAiId: string | null = null;

    if (parsedModelResponse.isDiagnosis && parsedModelResponse.snapshot) {
      const snapshotStrings = buildSavedSnapshotStrings(
        parsedModelResponse.snapshot
      );

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

      responseDiagnosaAiId = savedDiagnosa.id.toString();
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
          diagnosaAiId: responseDiagnosaAiId,
          assistantMessage: parsedModelResponse.assistantReply,
          isDiagnosis: parsedModelResponse.isDiagnosis,
          snapshot: parsedModelResponse.snapshot,
          nextHistory,
          savedDiagnosa: savedDiagnosa ? serializeBigInt(savedDiagnosa) : null,
          source: "gemini",
          model: geminiResponse.model,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/diagnosa-ai/chat error:", error);

    const status = getRouteErrorStatus(error);

    return NextResponse.json(
      {
        success: false,
        message: getRouteErrorMessage(error, status),
        status,
      },
      { status }
    );
  }
}