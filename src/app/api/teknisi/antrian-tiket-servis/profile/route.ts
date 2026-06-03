import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth/get-auth-session";

export const runtime = "nodejs";

function errorJson(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

function normalizeRole(value?: string | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_");
}

function isTeknisiRole(roleName?: string | null) {
  const role = normalizeRole(roleName);

  return role === "teknisi" || role.includes("teknisi");
}

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session) {
      return errorJson("Unauthorized.", 401);
    }

    if (!isTeknisiRole(session.roleName)) {
      return errorJson("Akses ditolak.", 403);
    }

    const user = await prisma.users.findUnique({
      where: {
        id: BigInt(session.id),
      },
      include: {
        roles: true,
      },
    });

    if (!user) {
      return errorJson("User tidak ditemukan.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Profile teknisi berhasil diambil.",
      user: {
        id: user.id.toString(),
        nama: user.nama,
        email: user.email,
        roleId: user.id_roles.toString(),
        roleName: user.roles?.nama_roles ?? session.roleName,
        address: user.address,
        phone: user.phone,
        photoProfilePath: user.photo_profile_path,
      },
    });
  } catch (error) {
    console.error("GET /api/teknisi/profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil profile teknisi.",
      },
      { status: 500 }
    );
  }
}