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

function isOwnerRole(roleName?: string | null) {
  return roleName?.trim().toLowerCase() === "owner";
}

function isAlamatDropPointLengkap(value: string) {
  const alamat = value.trim();

  if (alamat.length < 25) {
    return false;
  }

  const bagianAlamat = alamat
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (bagianAlamat.length < 4) {
    return false;
  }

  const hasJalan = /\b(jalan|jl\.?)\b/i.test(alamat);
  const hasNomor = /\b(nomor|no\.?)\s*\d+|\b\d+[a-z]?\b/i.test(alamat);
  const hasBali = /\bbali\b/i.test(alamat);

  return hasJalan && hasNomor && hasBali;
}

function mapDropPointRow(dropPoint: {
  id: bigint;
  nama_drop_point: string;
  alamat: string;
  phone: string | null;
  jam_operasional: string | null;
}) {
  return {
    id: dropPoint.id.toString(),
    nama_drop_point: dropPoint.nama_drop_point,
    alamat: dropPoint.alamat,
    phone: dropPoint.phone,
    jam_operasional: dropPoint.jam_operasional,
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

    const dropPoints = await prisma.drop_point.findMany({
      orderBy: {
        nama_drop_point: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data drop point berhasil diambil.",
      dropPoints: dropPoints.map(mapDropPointRow),
    });
  } catch (error) {
    console.error("GET /api/owner/drop-point error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil data drop point.",
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

    const nama_drop_point = String(body?.nama_drop_point ?? "").trim();
    const alamat = String(body?.alamat ?? "").trim();
    const phoneRaw = String(body?.phone ?? "").trim();
    const jam_operasional_raw = String(body?.jam_operasional ?? "").trim();

    if (!nama_drop_point) {
      return errorJson("Nama drop point wajib diisi.", 400);
    }

    if (!alamat) {
      return errorJson("Alamat wajib diisi.", 400);
    }

    if (!isAlamatDropPointLengkap(alamat)) {
  return errorJson(
    "Mohon isi alamat lebih lengkap, contoh: Jalan Margapati Nomor 2, Sukawati, Gianyar, Bali.",
    400
  );
}

    const existingDropPoint = await prisma.drop_point.findFirst({
      where: {
        nama_drop_point,
      },
      select: {
        id: true,
      },
    });

    if (existingDropPoint) {
      return errorJson("Nama drop point sudah digunakan.", 409);
    }

    const createdDropPoint = await prisma.drop_point.create({
      data: {
        nama_drop_point,
        alamat,
        phone: phoneRaw || null,
        jam_operasional: jam_operasional_raw || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Drop point berhasil ditambahkan.",
      dropPoint: mapDropPointRow(createdDropPoint),
    });
  } catch (error) {
    console.error("POST /api/owner/drop-point error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat menambah drop point.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}