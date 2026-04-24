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

function mapUserRow(user: {
  id: bigint;
  nama: string;
  email: string;
  id_roles: bigint;
  address: string | null;
  phone: string | null;
  photo_profile_path: string | null;
  roles: {
    id: bigint;
    nama_roles: string;
  };
}) {
  return {
    id: user.id.toString(),
    nama: user.nama,
    email: user.email,
    roleId: user.id_roles.toString(),
    roleName: user.roles.nama_roles,
    address: user.address,
    phone: user.phone,
    photoProfilePath: user.photo_profile_path,
  };
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

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session) {
      return errorJson("Unauthorized.", 401);
    }

    if (!isOwnerRole(session.roleName)) {
      return errorJson("Akses ditolak.", 403);
    }

    const [employees, availableRoles] = await prisma.$transaction([
      prisma.users.findMany({
        where: {
          roles: {
            is: {
              nama_roles: {
                not: "Owner",
              },
            },
          },
        },
        include: {
          roles: true,
        },
        orderBy: {
          nama: "asc",
        },
      }),
      prisma.roles.findMany({
        where: {
          nama_roles: {
            not: "Owner",
          },
        },
        orderBy: {
          nama_roles: "asc",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Data pegawai berhasil diambil.",
      employees: employees.map(mapUserRow),
      availableRoles: availableRoles.map((role) => ({
        value: role.id.toString(),
        label: role.nama_roles,
      })),
    });
  } catch (error) {
    console.error("GET /api/owner/pegawai error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil data pegawai.",
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

    const formData = await request.formData();

    const nama = String(formData.get("nama") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "").trim();
    const phoneRaw = String(formData.get("phone") ?? "").trim();
    const addressRaw = String(formData.get("address") ?? "").trim();
    const roleIdRaw = String(formData.get("id_roles") ?? "").trim();
    const photo = formData.get("photo");

    if (!nama) {
      return errorJson("Nama wajib diisi.", 400);
    }

    if (!email) {
      return errorJson("Email wajib diisi.", 400);
    }

    if (!password) {
      return errorJson("Password wajib diisi.", 400);
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
      return errorJson("Role Owner tidak dapat dibuat dari menu ini.", 403);
    }

    let photoProfilePath: string | null = null;

    if (photo instanceof File && photo.size > 0) {
      photoProfilePath = await fileToDataUrl(photo);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await prisma.users.create({
      data: {
        id_roles: BigInt(roleIdRaw),
        nama,
        email,
        password: hashedPassword,
        address: addressRaw || null,
        phone: phoneRaw || null,
        photo_profile_path: photoProfilePath,
      },
      include: {
        roles: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pegawai berhasil ditambahkan.",
      employee: mapUserRow(createdUser),
    });
  } catch (error) {
    console.error("POST /api/owner/pegawai error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat menambah pegawai.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}