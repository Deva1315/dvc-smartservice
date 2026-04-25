import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

type RouteParams = {
  params: Promise<{
    nomorTiket: string;
    detailId: string;
  }>;
};

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
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

      const detail = await tx.detail_tiket_servis.findUnique({
        where: {
          id: detailId,
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
      message: "Sparepart berhasil dihapus dari tiket dan stok dikembalikan",
      data: serializeData(result),
    });
  } catch (error) {
    console.error("DELETE SPAREPART TEKNISI ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal menghapus sparepart dari tiket",
      },
      { status: 500 }
    );
  }
}