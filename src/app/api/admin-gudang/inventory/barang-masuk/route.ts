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

type DetailItemPayload = {
  tipe_item: "Barang" | "Sparepart";
  id_barang?: string | number | null;
  id_sparepart?: string | number | null;
  jumlah: string | number;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;

    const where = {
      jenis_mutasi: "Barang Masuk",
      ...(search
        ? {
            OR: [
              {
                keterangan: {
                  contains: search,
                },
              },
              {
                suppliers: {
                  nama_supplier: {
                    contains: search,
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.stock_mutasi.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          id: "desc",
        },
        include: {
          suppliers: true,
          users: {
            select: {
              id: true,
              nama: true,
              email: true,
            },
          },
          detail_stock_mutasi: {
            include: {
              barang: true,
              sparepart: true,
            },
          },
        },
      }),
      prisma.stock_mutasi.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Data barang masuk berhasil diambil",
      data: serializeData(data),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET BARANG MASUK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data barang masuk",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const idUser = parseRequiredBigInt(body.id_user, "User");
    const idSupplier = parseRequiredBigInt(body.id_supplier, "Supplier");
    const tanggalMutasi = parseRequiredDate(
      body.tanggal_mutasi,
      "Tanggal mutasi"
    );
    const keterangan = body.keterangan?.trim() || null;
    const detailItems = body.detail_items as DetailItemPayload[];

    if (!Array.isArray(detailItems) || detailItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Detail item wajib diisi minimal 1 item",
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

    const supplier = await prisma.suppliers.findUnique({
      where: {
        id: idSupplier,
      },
    });

    if (!supplier) {
      return NextResponse.json(
        {
          success: false,
          message: "Supplier tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const stockMutasi = await tx.stock_mutasi.create({
        data: {
          id_user: idUser,
          id_supplier: idSupplier,
          jenis_mutasi: "Barang Masuk",
          tanggal_mutasi: tanggalMutasi,
          keterangan,
        },
      });

      for (const item of detailItems) {
        const jumlah = parseRequiredBigInt(item.jumlah, "Jumlah");

        if (jumlah <= BigInt(0)) {
          throw new Error("Jumlah item harus lebih dari 0");
        }

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

          await tx.detail_stock_mutasi.create({
            data: {
              id_stock_mutasi: stockMutasi.id,
              id_barang: idBarang,
              id_sparepart: null,
              jumlah,
            },
          });

          await tx.barang.update({
            where: {
              id: idBarang,
            },
            data: {
              stock: {
                increment: jumlah,
              },
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

          await tx.detail_stock_mutasi.create({
            data: {
              id_stock_mutasi: stockMutasi.id,
              id_barang: null,
              id_sparepart: idSparepart,
              jumlah,
            },
          });

          await tx.sparepart.update({
            where: {
              id: idSparepart,
            },
            data: {
              stock: {
                increment: jumlah,
              },
            },
          });
        }
      }

      return tx.stock_mutasi.findUnique({
        where: {
          id: stockMutasi.id,
        },
        include: {
          suppliers: true,
          users: {
            select: {
              id: true,
              nama: true,
              email: true,
            },
          },
          detail_stock_mutasi: {
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
        message: "Barang masuk berhasil disimpan",
        data: serializeData(result),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST BARANG MASUK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan barang masuk",
      },
      { status: 500 }
    );
  }
}