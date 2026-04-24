import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth/get-auth-session";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
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
    throw new Error("Ukuran file terlalu besar. Maksimal 5 MB.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");

  return `data:${file.type};base64,${base64}`;
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return errorJson("Unauthorized.", 401);
    }

    if (!isOwnerRole(session.roleName)) {
      return errorJson("Akses ditolak.", 403);
    }

    const { id } = await context.params;

    const existingEmployee = await prisma.users.findUnique({
      where: {
        id: BigInt(id),
      },
      include: {
        roles: true,
      },
    });

    if (!existingEmployee) {
      return errorJson("Pegawai tidak ditemukan.", 404);
    }

    if (existingEmployee.roles.nama_roles === "Owner") {
      return errorJson("Role Owner tidak dapat diubah dari menu ini.", 403);
    }

    const formData = await request.formData();

    const nama = String(formData.get("nama") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "").trim();
    const phoneRaw = String(formData.get("phone") ?? "").trim();
    const addressRaw = String(formData.get("address") ?? "").trim();
    const roleIdRaw = String(formData.get("id_roles") ?? "").trim();
    const removePhoto = String(formData.get("remove_photo") ?? "").trim() === "1";
    const photo = formData.get("photo");

    if (!nama) {
      return errorJson("Nama wajib diisi.", 400);
    }

    if (!email) {
      return errorJson("Email wajib diisi.", 400);
    }

    if (!roleIdRaw) {
      return errorJson("Jabatan wajib dipilih.", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorJson("Format email tidak valid.", 400);
    }

    const duplicatedEmail = await prisma.users.findFirst({
      where: {
        email,
        NOT: {
          id: BigInt(id),
        },
      },
      select: {
        id: true,
      },
    });

    if (duplicatedEmail) {
      return errorJson("Email sudah digunakan oleh user lain.", 409);
    }

    const selectedRole = await prisma.roles.findUnique({
      where: {
        id: BigInt(roleIdRaw),
      },
    });

    if (!selectedRole) {
      return errorJson("Jabatan tidak ditemukan.", 404);
    }

    if (selectedRole.nama_roles === "Owner") {
      return errorJson("Role Owner tidak dapat dipilih di menu ini.", 403);
    }

    let nextPhotoProfilePath = existingEmployee.photo_profile_path;

    if (removePhoto) {
      nextPhotoProfilePath = null;
    }

    if (photo instanceof File && photo.size > 0) {
      nextPhotoProfilePath = await fileToDataUrl(photo);
    }

    const updatedUser = await prisma.users.update({
      where: {
        id: BigInt(id),
      },
      data: {
        id_roles: BigInt(roleIdRaw),
        nama,
        email,
        address: addressRaw || null,
        phone: phoneRaw || null,
        photo_profile_path: nextPhotoProfilePath,
        ...(password
          ? {
              password: await bcrypt.hash(password, 10),
            }
          : {}),
      },
      include: {
        roles: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pegawai berhasil diperbarui.",
      employee: {
        id: updatedUser.id.toString(),
        nama: updatedUser.nama,
        email: updatedUser.email,
        roleId: updatedUser.id_roles.toString(),
        roleName: updatedUser.roles.nama_roles,
        address: updatedUser.address,
        phone: updatedUser.phone,
        photoProfilePath: updatedUser.photo_profile_path,
      },
    });
  } catch (error) {
    console.error("PATCH /api/owner/pegawai/[id] error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat memperbarui pegawai.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return errorJson("Unauthorized.", 401);
    }

    if (!isOwnerRole(session.roleName)) {
      return errorJson("Akses ditolak.", 403);
    }

    const { id } = await context.params;

    const existingEmployee = await prisma.users.findUnique({
      where: {
        id: BigInt(id),
      },
      include: {
        roles: true,
      },
    });

    if (!existingEmployee) {
      return errorJson("Pegawai tidak ditemukan.", 404);
    }

    if (existingEmployee.roles.nama_roles === "Owner") {
      return errorJson("Role Owner tidak dapat dihapus dari menu ini.", 403);
    }

    await prisma.users.delete({
      where: {
        id: BigInt(id),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pegawai berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE /api/owner/pegawai/[id] error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat menghapus pegawai.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}