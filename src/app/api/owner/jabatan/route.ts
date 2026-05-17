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

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session) {
      return errorJson("Unauthorized.", 401);
    }

    if (!isOwnerRole(session.roleName)) {
      return errorJson("Akses ditolak.", 403);
    }

    const jabatan = await prisma.roles.findMany({
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        nama_roles: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data jabatan berhasil diambil.",
      jabatan: jabatan.map(mapJabatanRow),
    });
  } catch (error) {
    console.error("GET /api/owner/jabatan error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil data jabatan.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return errorJson("Unauthorized.", 401);
    }

    if (!isOwnerRole(session.roleName)) {
      return errorJson("Akses ditolak.", 403);
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
      return errorJson("Role Owner tidak dapat dibuat dari menu ini.", 403);
    }

    const existingRoles = await prisma.roles.findMany({
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

    const createdJabatan = await prisma.roles.create({
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
      message: "Jabatan berhasil ditambahkan.",
      jabatan: mapJabatanRow(createdJabatan),
    });
  } catch (error) {
    console.error("POST /api/owner/jabatan error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat menambah jabatan.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}