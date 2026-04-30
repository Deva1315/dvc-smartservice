import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serializeData(data: unknown) {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

function parseRequiredBigInt(value: unknown, fieldName: string) {
  if (value === undefined || value === null || value === "") {
    throw new Error(`${fieldName} wajib diisi`);
  }

  const stringValue = String(value);

  if (!/^\d+$/.test(stringValue)) {
    throw new Error(`${fieldName} harus berupa angka`);
  }

  return BigInt(stringValue);
}

function parseRequiredDate(value: unknown, fieldName: string) {
  if (!value) {
    throw new Error(`${fieldName} wajib diisi`);
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} tidak valid`);
  }

  return date;
}

function getAbsoluteBigIntDifference(valueA: bigint, valueB: bigint) {
  return valueA >= valueB ? valueA - valueB : valueB - valueA;
}

type DetailOpnamePayload = {
  tipe_item: "Barang" | "Sparepart";
  id_barang?: string | number | null;
  id_sparepart?: string | number | null;
  stock_fisik: string | number;
  keterangan?: string | null;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            {
              keterangan: {
                contains: search,
              },
            },
            {
              users: {
                nama: {
                  contains: search,
                },
              },
            },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.stock_opname.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          id: "desc",
        },
        include: {
          users: {
            select: {
              id: true,
              nama: true,
              email: true,
            },
          },
          detail_stock_opname: {
            include: {
              barang: true,
              sparepart: true,
            },
          },
        },
      }),
      prisma.stock_opname.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Data stok opname berhasil diambil",
      data: serializeData(data),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET STOK OPNAME ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data stok opname",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const idUser = parseRequiredBigInt(body.id_user, "User");
    const tanggalOpname = parseRequiredDate(
      body.tanggal_opname,
      "Tanggal opname"
    );
    const keterangan = body.keterangan?.trim() || null;
    const detailItems = body.detail_items as DetailOpnamePayload[];

    if (!Array.isArray(detailItems) || detailItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Detail stok opname wajib diisi minimal 1 item",
        },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({
      where: {
        id: idUser,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      let totalSelisih = BigInt(0);

      const stockOpname = await tx.stock_opname.create({
        data: {
          id_user: idUser,
          tanggal_opname: tanggalOpname,
          selisih_stock: BigInt(0),
          keterangan,
        },
      });

      for (const item of detailItems) {
        const stockFisik = parseRequiredBigInt(
          item.stock_fisik,
          "Stock fisik"
        );

        if (item.tipe_item === "Barang") {
          const idBarang = parseRequiredBigInt(item.id_barang, "Barang");

          const barang = await tx.barang.findUnique({
            where: {
              id: idBarang,
            },
          });

          if (!barang) {
            throw new Error("Barang tidak ditemukan");
          }

const stockSistem = barang.stock;
const selisih = getAbsoluteBigIntDifference(stockFisik, stockSistem);
totalSelisih += selisih;

          await tx.detail_stock_opname.create({
            data: {
              id_stock_opname: stockOpname.id,
              id_barang: idBarang,
              id_sparepart: null,
              stock_fisik: stockFisik,
              stock_sistem: stockSistem,
              selisih,
              keterangan: item.keterangan?.trim() || null,
            },
          });

          await tx.barang.update({
            where: {
              id: idBarang,
            },
            data: {
              stock: stockFisik,
            },
          });
        }

        if (item.tipe_item === "Sparepart") {
          const idSparepart = parseRequiredBigInt(
            item.id_sparepart,
            "Sparepart"
          );

          const sparepart = await tx.sparepart.findUnique({
            where: {
              id: idSparepart,
            },
          });

          if (!sparepart) {
            throw new Error("Sparepart tidak ditemukan");
          }

const stockSistem = sparepart.stock;
const selisih = getAbsoluteBigIntDifference(stockFisik, stockSistem);
totalSelisih += selisih;

          await tx.detail_stock_opname.create({
            data: {
              id_stock_opname: stockOpname.id,
              id_barang: null,
              id_sparepart: idSparepart,
              stock_fisik: stockFisik,
              stock_sistem: stockSistem,
              selisih,
              keterangan: item.keterangan?.trim() || null,
            },
          });

          await tx.sparepart.update({
            where: {
              id: idSparepart,
            },
            data: {
              stock: stockFisik,
            },
          });
        }
      }

      await tx.stock_opname.update({
        where: {
          id: stockOpname.id,
        },
        data: {
          selisih_stock: totalSelisih,
        },
      });

      return tx.stock_opname.findUnique({
        where: {
          id: stockOpname.id,
        },
        include: {
          users: {
            select: {
              id: true,
              nama: true,
              email: true,
            },
          },
          detail_stock_opname: {
            include: {
              barang: true,
              sparepart: true,
            },
          },
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Stok opname berhasil disimpan",
        data: serializeData(result),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST STOK OPNAME ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan stok opname",
      },
      { status: 500 }
    );
  }
}