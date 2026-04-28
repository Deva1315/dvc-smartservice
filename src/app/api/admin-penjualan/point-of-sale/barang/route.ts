import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth/get-auth-session";

export const runtime = "nodejs";

function serializeData(data: unknown) {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (typeof value === "bigint") {
        return value.toString();
      }

      if (
        value &&
        typeof value === "object" &&
        value.constructor?.name === "Decimal"
      ) {
        return value.toString();
      }

      return value;
    })
  );
}

function normalizeRole(roleName: string) {
  return roleName.toLowerCase().replace(/\s+/g, "_");
}

async function requireAdminPenjualanSession() {
  const session = await getAuthSession();

  if (!session) {
    throw new Error("Unauthorized. Silakan login terlebih dahulu.");
  }

  const role = normalizeRole(session.roleName);

  if (role !== "admin_penjualan" && role !== "owner") {
    throw new Error(
      "Forbidden. Hanya Admin Penjualan atau Owner yang dapat mengakses POS."
    );
  }

  return session;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminPenjualanSession();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 100);
    const skip = (page - 1) * limit;

    const where = {
      ...(search
        ? {
            OR: [
              {
                nama_barang: {
                  contains: search,
                },
              },
              {
                kode_barang: {
                  contains: search,
                },
              },
              {
                merk_barang: {
                  contains: search,
                },
              },
              {
                kategori_barang: {
                  nama_kategori: {
                    contains: search,
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [barang, total] = await Promise.all([
      prisma.barang.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          nama_barang: "asc",
        },
        include: {
          kategori_barang: true,
        },
      }),
      prisma.barang.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Data barang POS berhasil diambil",
      data: serializeData(barang),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET POS BARANG ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Gagal mengambil data barang POS";

    const status = message.includes("Unauthorized")
      ? 401
      : message.includes("Forbidden")
      ? 403
      : 500;

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status }
    );
  }
}