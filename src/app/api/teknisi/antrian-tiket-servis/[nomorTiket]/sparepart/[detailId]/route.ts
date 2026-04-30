import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth/get-auth-session";

function serializeData(data: unknown) {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (typeof value === "bigint") return value.toString();

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

async function requireTeknisiSession() {
  const session = await getAuthSession();

  if (!session) {
    throw new Error("Unauthorized. Silakan login terlebih dahulu.");
  }

  const role = normalizeRole(session.roleName);

  if (role !== "teknisi" && role !== "owner") {
    throw new Error(
      "Forbidden. Hanya Teknisi atau Owner yang dapat menghapus sparepart servis."
    );
  }

  return session;
}

type RouteParams = {
  params: Promise<{
    nomorTiket: string;
    detailId: string;
  }>;
};

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireTeknisiSession();

    const { nomorTiket, detailId } = await params;

    const result = await prisma.$transaction(async (tx) => {
      const tiket = await tx.tiket_servis.findUnique({
        where: {
          nomor_tiket: nomorTiket,
        },
      });

      if (!tiket) {
        throw new Error("Tiket servis tidak ditemukan");
      }

      if (tiket.status_servis === "Dibatalkan") {
        throw new Error("Sparepart tidak dapat dihapus karena tiket sudah dibatalkan.");
      }

      if (tiket.status_servis === "Diambil") {
        throw new Error("Sparepart tidak dapat dihapus karena tiket sudah diambil.");
      }

      const detail = await tx.detail_tiket_servis.findUnique({
        where: {
          id: detailId,
        },
        include: {
          sparepart: true,
        },
      });

      if (!detail) {
        throw new Error("Detail sparepart tidak ditemukan");
      }

      if (detail.id_tiket_servis !== tiket.id) {
        throw new Error("Detail sparepart tidak sesuai dengan tiket servis");
      }

      if (!detail.id_sparepart) {
        throw new Error("Detail ini bukan sparepart");
      }

      await tx.sparepart.update({
        where: {
          id: detail.id_sparepart,
        },
        data: {
          stock: {
            increment: detail.jumlah,
          },
        },
      });

      const stockMutasi = await tx.stock_mutasi.create({
        data: {
          id_user: BigInt(session.id),
          id_supplier: null,
          jenis_mutasi: "Barang Masuk",
          tanggal_mutasi: new Date(),
          keterangan: [
            "Sumber: Pengembalian Sparepart Servis",
            `No. Tiket: ${tiket.nomor_tiket}`,
            `Pelanggan: ${tiket.nama_cust}`,
            `Sparepart: ${detail.sparepart?.nama_sparepart || "-"}`,
            "Keterangan: Sparepart dihapus dari tiket servis sehingga stok dikembalikan",
          ].join("\n"),
        },
      });

      await tx.detail_stock_mutasi.create({
        data: {
          id_stock_mutasi: stockMutasi.id,
          id_barang: null,
          id_sparepart: detail.id_sparepart,
          jumlah: detail.jumlah,
        },
      });

      await tx.detail_tiket_servis.delete({
        where: {
          id: detailId,
        },
      });

      const aggregate = await tx.detail_tiket_servis.aggregate({
        where: {
          id_tiket_servis: tiket.id,
        },
        _sum: {
          subtotal: true,
        },
      });

      const updatedTiket = await tx.tiket_servis.update({
        where: {
          id: tiket.id,
        },
        data: {
          estimasi_biaya: aggregate._sum.subtotal || 0,
        },
      });

      return updatedTiket;
    });

    return NextResponse.json({
      success: true,
      message:
        "Sparepart berhasil dihapus dari tiket, stok dikembalikan, dan tercatat sebagai Barang Masuk",
      data: serializeData(result),
    });
  } catch (error) {
    console.error("DELETE SPAREPART TEKNISI ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Gagal menghapus sparepart dari tiket";

    const status = message.includes("Unauthorized")
      ? 401
      : message.includes("Forbidden")
      ? 403
      : message.includes("tidak ditemukan")
      ? 404
      : message.includes("tidak sesuai") ||
        message.includes("bukan sparepart") ||
        message.includes("tidak dapat")
      ? 400
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