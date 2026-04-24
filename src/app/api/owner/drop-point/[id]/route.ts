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

    const dropPoint = await prisma.drop_point.findUnique({
      where: {
        id: BigInt(id),
      },
    });

    if (!dropPoint) {
      return errorJson("Drop point tidak ditemukan.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Detail drop point berhasil diambil.",
      dropPoint: mapDropPointRow(dropPoint),
    });
  } catch (error) {
    console.error("GET /api/owner/drop-point/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil detail drop point.",
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

    const existingDropPoint = await prisma.drop_point.findUnique({
      where: {
        id: BigInt(id),
      },
    });

    if (!existingDropPoint) {
      return errorJson("Drop point tidak ditemukan.", 404);
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

    const duplicatedDropPoint = await prisma.drop_point.findFirst({
      where: {
        nama_drop_point,
        NOT: {
          id: BigInt(id),
        },
      },
      select: {
        id: true,
      },
    });

    if (duplicatedDropPoint) {
      return errorJson("Nama drop point sudah digunakan.", 409);
    }

    const updatedDropPoint = await prisma.drop_point.update({
      where: {
        id: BigInt(id),
      },
      data: {
        nama_drop_point,
        alamat,
        phone: phoneRaw || null,
        jam_operasional: jam_operasional_raw || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Drop point berhasil diperbarui.",
      dropPoint: mapDropPointRow(updatedDropPoint),
    });
  } catch (error) {
    console.error("PATCH /api/owner/drop-point/[id] error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat memperbarui drop point.";

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

    const dropPoint = await prisma.drop_point.findUnique({
      where: {
        id: BigInt(id),
      },
      select: {
        id: true,
        nama_drop_point: true,
      },
    });

    if (!dropPoint) {
      return errorJson("Drop point tidak ditemukan.", 404);
    }

    const usedByTicketCount = await prisma.tiket_servis.count({
      where: {
        id_drop_point: BigInt(id),
      },
    });

    if (usedByTicketCount > 0) {
      return errorJson(
        "Drop point tidak dapat dihapus karena masih digunakan oleh tiket servis.",
        409
      );
    }

    await prisma.drop_point.delete({
      where: {
        id: BigInt(id),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Drop point ${dropPoint.nama_drop_point} berhasil dihapus.`,
    });
  } catch (error) {
    console.error("DELETE /api/owner/drop-point/[id] error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat menghapus drop point.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}