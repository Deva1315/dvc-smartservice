import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth/get-auth-session";

export const runtime = "nodejs";

const PROTECTED_ROLE_NAMES = ["owner"];

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

function normalizeRoleName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function isProtectedRoleName(value: string) {
  return PROTECTED_ROLE_NAMES.includes(normalizeRoleName(value));
}

function mapJabatanRow(role: {
  id: bigint;
  nama_roles: string;
  _count?: {
    users: number;
  };
}) {
  return {
    id: role.id.toString(),
    nama_roles: role.nama_roles,
    jumlah_user: role._count?.users ?? 0,
    isProtected: isProtectedRoleName(role.nama_roles),
  };
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return errorJson("Unauthorized.", 401);
    }

    if (!isOwnerRole(session.roleName)) {
      return errorJson("Akses ditolak.", 403);
    }

    const { id } = await context.params;

    if (!id || Number.isNaN(Number(id))) {
      return errorJson("ID jabatan tidak valid.", 400);
    }

    const jabatan = await prisma.roles.findUnique({
      where: {
        id: BigInt(id),
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!jabatan) {
      return errorJson("Jabatan tidak ditemukan.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Detail jabatan berhasil diambil.",
      jabatan: mapJabatanRow(jabatan),
    });
  } catch (error) {
    console.error("GET /api/owner/jabatan/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil detail jabatan.",
      },
      { status: 500 }
    );
  }
}

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

    if (!id || Number.isNaN(Number(id))) {
      return errorJson("ID jabatan tidak valid.", 400);
    }

    const existingJabatan = await prisma.roles.findUnique({
      where: {
        id: BigInt(id),
      },
    });

    if (!existingJabatan) {
      return errorJson("Jabatan tidak ditemukan.", 404);
    }

    if (isProtectedRoleName(existingJabatan.nama_roles)) {
      return errorJson("Role Owner tidak dapat diubah dari menu ini.", 403);
    }

    const body = await request.json().catch(() => null);

    const nama_roles = String(body?.nama_roles ?? "")
      .trim()
      .replace(/\s+/g, " ");

    if (!nama_roles) {
      return errorJson("Nama jabatan wajib diisi.", 400);
    }

    if (nama_roles.length > 100) {
      return errorJson("Nama jabatan maksimal 100 karakter.", 400);
    }

    if (isProtectedRoleName(nama_roles)) {
      return errorJson("Nama jabatan tidak boleh diubah menjadi Owner.", 403);
    }

    const existingRoles = await prisma.roles.findMany({
      where: {
        NOT: {
          id: BigInt(id),
        },
      },
      select: {
        id: true,
        nama_roles: true,
      },
    });

    const duplicatedRole = existingRoles.find(
      (role) => normalizeRoleName(role.nama_roles) === normalizeRoleName(nama_roles)
    );

    if (duplicatedRole) {
      return errorJson("Nama jabatan sudah digunakan.", 409);
    }

    const updatedJabatan = await prisma.roles.update({
      where: {
        id: BigInt(id),
      },
      data: {
        nama_roles,
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Jabatan berhasil diperbarui.",
      jabatan: mapJabatanRow(updatedJabatan),
    });
  } catch (error) {
    console.error("PATCH /api/owner/jabatan/[id] error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat memperbarui jabatan.";

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

    if (!id || Number.isNaN(Number(id))) {
      return errorJson("ID jabatan tidak valid.", 400);
    }

    const existingJabatan = await prisma.roles.findUnique({
      where: {
        id: BigInt(id),
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!existingJabatan) {
      return errorJson("Jabatan tidak ditemukan.", 404);
    }

    if (isProtectedRoleName(existingJabatan.nama_roles)) {
      return errorJson("Role Owner tidak dapat dihapus dari menu ini.", 403);
    }

    if (existingJabatan._count.users > 0) {
      return errorJson(
        "Jabatan tidak dapat dihapus karena masih digunakan oleh user.",
        409
      );
    }

    await prisma.roles.delete({
      where: {
        id: BigInt(id),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Jabatan berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE /api/owner/jabatan/[id] error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat menghapus jabatan.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}