import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth/get-auth-session";
import { AUTH_COOKIE_NAME } from "@/lib/auth/auth.constants";
import { signAuthToken } from "@/lib/auth/auth.session";
import { sanitizeSessionPhotoProfilePath } from "@/lib/auth/auth.helpers";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 500 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function errorJson(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

function isOwnerRole(roleName?: string | null) {
  return roleName?.trim().toLowerCase() === "owner";
}

async function fileToDataUrl(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran file terlalu besar. Maksimal 500 KB.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");

  return `data:${file.type};base64,${base64}`;
}

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session) {
      return errorJson("Unauthorized.", 401);
    }

    if (!isOwnerRole(session.roleName)) {
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
      message: "Profile owner berhasil diambil.",
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
    console.error("GET /api/owner/profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil profile owner.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return errorJson("Unauthorized.", 401);
    }

    if (!isOwnerRole(session.roleName)) {
      return errorJson("Akses ditolak.", 403);
    }

    const existingUser = await prisma.users.findUnique({
      where: {
        id: BigInt(session.id),
      },
      include: {
        roles: true,
      },
    });

    if (!existingUser) {
      return errorJson("User tidak ditemukan.", 404);
    }

    const formData = await request.formData();

    const nama = String(formData.get("nama") ?? "").trim();
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const phoneRaw = String(formData.get("phone") ?? "").trim();
    const addressRaw = String(formData.get("address") ?? "").trim();
    const photo = formData.get("photo");

    if (!nama) {
      return errorJson("Nama wajib diisi.", 400);
    }

    if (!email) {
      return errorJson("Email wajib diisi.", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorJson("Format email tidak valid.", 400);
    }

    const duplicatedEmail = await prisma.users.findFirst({
      where: {
        email,
        NOT: {
          id: BigInt(session.id),
        },
      },
      select: {
        id: true,
      },
    });

    if (duplicatedEmail) {
      return errorJson("Email sudah digunakan oleh user lain.", 409);
    }

    let nextPhotoProfilePath = existingUser.photo_profile_path;

    if (photo instanceof File && photo.size > 0) {
      nextPhotoProfilePath = await fileToDataUrl(photo);
    }

    const updatedUser = await prisma.users.update({
      where: {
        id: BigInt(session.id),
      },
      data: {
        nama,
        email,
        phone: phoneRaw || null,
        address: addressRaw || null,
        photo_profile_path: nextPhotoProfilePath,
      },
      include: {
        roles: true,
      },
    });

    const refreshedToken = await signAuthToken({
      id: updatedUser.id.toString(),
      nama: updatedUser.nama,
      email: updatedUser.email,
      roleId: updatedUser.id_roles.toString(),
      roleName: updatedUser.roles?.nama_roles ?? session.roleName,
      address: updatedUser.address,
      phone: updatedUser.phone,
      photoProfilePath: sanitizeSessionPhotoProfilePath(
        updatedUser.photo_profile_path
      ),
    });

    const response = NextResponse.json({
      success: true,
      message: "Profile owner berhasil diperbarui.",
      user: {
        id: updatedUser.id.toString(),
        nama: updatedUser.nama,
        email: updatedUser.email,
        roleId: updatedUser.id_roles.toString(),
        roleName: updatedUser.roles?.nama_roles ?? session.roleName,
        address: updatedUser.address,
        phone: updatedUser.phone,
        photoProfilePath: updatedUser.photo_profile_path,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, refreshedToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("PATCH /api/owner/profile error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat memperbarui profile owner.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}