import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/auth.constants";

export const runtime = "nodejs";

export async function POST() {
  try {
    const cookieStore = await cookies();

    cookieStore.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Logout berhasil.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/auth/logout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat logout.",
      },
      { status: 500 }
    );
  }
}