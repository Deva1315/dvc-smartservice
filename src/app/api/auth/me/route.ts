import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/get-auth-session";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          user: null,
          message: "Belum login.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        user: session,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/auth/me error:", error);

    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        user: null,
        message: "Terjadi kesalahan saat mengambil session.",
      },
      { status: 500 }
    );
  }
}