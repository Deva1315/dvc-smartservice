import { NextRequest, NextResponse } from "next/server";
import {
  Prisma,
  transaksi_penjualan_status_transaksi,
} from "@/generated/prisma/client";
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

function parseOptionalBigInt(value: unknown, fieldName: string) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const stringValue = String(value);

  if (!/^\d+$/.test(stringValue)) {
    throw new Error(`${fieldName} harus berupa angka`);
  }

  return BigInt(stringValue);
}

function parseNumber(value: unknown, fieldName: string) {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  const normalizedValue =
    typeof value === "string"
      ? value.replace(/\./g, "").replace(",", ".")
      : value;

  const numberValue = Number(normalizedValue);

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    throw new Error(`${fieldName} harus berupa angka valid dan tidak negatif`);
  }

  return numberValue;
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function parseTransactionIdFromSearch(value: string) {
  const keyword = value.trim();

  if (!keyword) {
    return null;
  }

  const invoiceMatch = keyword.match(/^INV-\d{8}-(\d+)$/i);

  if (invoiceMatch?.[1]) {
    return BigInt(invoiceMatch[1]);
  }

  if (/^\d+$/.test(keyword)) {
    return BigInt(keyword);
  }

  return null;
}

function normalizeMetodeTransaksi(value: unknown) {
  const metode = typeof value === "string" ? value.trim() : "";

  if (!metode) {
    throw new Error("Metode pembayaran wajib dipilih");
  }

  const allowed = ["Cash", "Transfer", "QRIS", "Debit"];

  if (!allowed.includes(metode)) {
    throw new Error("Metode pembayaran tidak valid");
  }

  return metode;
}

function normalizeNamaCustomer(value: unknown) {
  const namaCust = typeof value === "string" ? value.trim() : "";

  if (!namaCust) {
    return "Pelanggan Umum";
  }

  if (namaCust.length > 150) {
    throw new Error("Nama customer maksimal 150 karakter");
  }

  return namaCust;
}

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toDecimal(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

function formatDateCode(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function buildNomorTransaksi(id: bigint | string, tanggal: Date) {
  return `INV-${formatDateCode(tanggal)}-${String(id).padStart(4, "0")}`;
}

type DetailItemPayload = {
  id_barang?: string | number | bigint | null;
  jumlah?: string | number | bigint | null;
  qty?: string | number | bigint | null;
};

type NormalizedItem = {
  id_barang: bigint;
  jumlah: bigint;
};

function normalizeDetailItems(rawItems: unknown) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error("Detail barang wajib diisi minimal 1 item");
  }

  const itemMap = new Map<string, NormalizedItem>();

  for (const rawItem of rawItems) {
    const item = rawItem as DetailItemPayload;

    const idBarang = parseRequiredBigInt(item.id_barang, "Barang");
    const jumlah = parseRequiredBigInt(
      item.jumlah ?? item.qty,
      "Jumlah barang"
    );

    if (jumlah <= BigInt(0)) {
      throw new Error("Jumlah barang harus lebih dari 0");
    }

    const key = idBarang.toString();
    const existing = itemMap.get(key);

    if (existing) {
      itemMap.set(key, {
        id_barang: idBarang,
        jumlah: existing.jumlah + jumlah,
      });
    } else {
      itemMap.set(key, {
        id_barang: idBarang,
        jumlah,
      });
    }
  }

  return Array.from(itemMap.values());
}

type TransaksiWithRelations = Prisma.transaksi_penjualanGetPayload<{
  include: {
    users: {
      select: {
        id: true;
        nama: true;
        email: true;
      };
    };
    detail_transaksi: {
      include: {
        barang: {
          include: {
            kategori_barang: true;
          };
        };
      };
    };
  };
}>;

function buildTransaksiResponse(transaksi: TransaksiWithRelations) {
  const subtotalFromDetail = transaksi.detail_transaksi.reduce((total, item) => {
    return total + toNumber(item.sub_total);
  }, 0);

  const subtotalTransaksi = toNumber(transaksi.subtotal_transaksi);
  const diskonTransaksi = toNumber(transaksi.diskon_transaksi);
  const totalTransaksi = toNumber(transaksi.total_transaksi);
  const nominalBayar = toNumber(transaksi.nominal_bayar);
  const kembalian = toNumber(transaksi.kembalian);

  return {
    id: transaksi.id,
    nomor_transaksi: buildNomorTransaksi(
      transaksi.id,
      transaksi.tanggal_transaksi
    ),
    id_user: transaksi.id_user,
    nama_cust: transaksi.nama_cust,
    tanggal_transaksi: transaksi.tanggal_transaksi,

    subtotal_transaksi: transaksi.subtotal_transaksi,
    diskon_transaksi: transaksi.diskon_transaksi,
    total_transaksi: transaksi.total_transaksi,
    nominal_bayar: transaksi.nominal_bayar,
    kembalian: transaksi.kembalian,

    metode_transaksi: transaksi.metode_transaksi,
    status_transaksi: transaksi.status_transaksi,

    subtotal: subtotalTransaksi || subtotalFromDetail,
    diskon: diskonTransaksi,
    total: totalTransaksi,
    nominal_bayar_number: nominalBayar,
    kembalian_number: kembalian,

    admin: {
      id: transaksi.users.id,
      nama: transaksi.users.nama,
      email: transaksi.users.email,
    },

    detail_transaksi: transaksi.detail_transaksi.map((item) => ({
      id: item.id,
      id_transaksi: item.id_transaksi,
      id_barang: item.id_barang,
      jumlah: item.jumlah,
      harga_satuan: item.harga_satuan,
      sub_total: item.sub_total,
      barang: item.barang,
    })),
  };
}

async function getTransaksiLengkap(idTransaksi: bigint) {
  const transaksi = await prisma.transaksi_penjualan.findUnique({
    where: {
      id: idTransaksi,
    },
    include: {
      users: {
        select: {
          id: true,
          nama: true,
          email: true,
        },
      },
      detail_transaksi: {
        include: {
          barang: {
            include: {
              kategori_barang: true,
            },
          },
        },
      },
    },
  });

  if (!transaksi) {
    throw new Error("Gagal mengambil data transaksi terbaru");
  }

  return transaksi;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminPenjualanSession();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const page = parsePositiveInteger(searchParams.get("page"), 1);
    const limit = parsePositiveInteger(searchParams.get("limit"), 10);
    const skip = (page - 1) * limit;
    const searchId = parseTransactionIdFromSearch(search);

    const orWhere: Prisma.transaksi_penjualanWhereInput[] = [
      {
        nama_cust: {
          contains: search,
        },
      },
      {
        metode_transaksi: {
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
      {
        detail_transaksi: {
          some: {
            barang: {
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
              ],
            },
          },
        },
      },
    ];

    if (searchId) {
      orWhere.unshift({
        id: searchId,
      });
    }

    const where: Prisma.transaksi_penjualanWhereInput = search
      ? {
          OR: orWhere,
        }
      : {};

    const [transaksi, total] = await Promise.all([
      prisma.transaksi_penjualan.findMany({
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
          detail_transaksi: {
            include: {
              barang: {
                include: {
                  kategori_barang: true,
                },
              },
            },
          },
        },
      }),
      prisma.transaksi_penjualan.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Data transaksi POS berhasil diambil",
      data: serializeData(transaksi.map((item) => buildTransaksiResponse(item))),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET POS TRANSAKSI ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Gagal mengambil data transaksi POS";

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

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminPenjualanSession();
    const body = await request.json();
    const action = String(body.action ?? body.mode ?? "").trim();

    if (action === "create_draft") {
      const transaksi = await prisma.$transaction(
        async (tx) => {
          await tx.transaksi_penjualan.deleteMany({
            where: {
              id_user: BigInt(session.id),
              status_transaksi: transaksi_penjualan_status_transaksi.Belum_Bayar,
              detail_transaksi: {
                none: {},
              },
            },
          });

          return tx.transaksi_penjualan.create({
            data: {
              id_user: BigInt(session.id),
              nama_cust: "Pelanggan Umum",
              tanggal_transaksi: new Date(),
              subtotal_transaksi: toDecimal(0),
              diskon_transaksi: toDecimal(0),
              total_transaksi: toDecimal(0),
              nominal_bayar: toDecimal(0),
              kembalian: toDecimal(0),
              metode_transaksi: "Cash",
              status_transaksi: transaksi_penjualan_status_transaksi.Belum_Bayar,
            },
            include: {
              users: {
                select: {
                  id: true,
                  nama: true,
                  email: true,
                },
              },
              detail_transaksi: {
                include: {
                  barang: {
                    include: {
                      kategori_barang: true,
                    },
                  },
                },
              },
            },
          });
        },
        {
          maxWait: 10000,
          timeout: 20000,
        }
      );

      return NextResponse.json(
        {
          success: true,
          message: "Draft transaksi POS berhasil dibuat",
          data: serializeData(buildTransaksiResponse(transaksi)),
        },
        { status: 201 }
      );
    }

    const idTransaksi = parseOptionalBigInt(
      body.id_transaksi ?? body.idTransaksi ?? body.transaksi_id,
      "ID transaksi"
    );

    const namaCust = normalizeNamaCustomer(body.nama_cust ?? body.namaCustomer);

    const metodeTransaksi = normalizeMetodeTransaksi(
      body.metode_transaksi ?? body.metodePembayaran
    );

    const diskon = parseNumber(body.diskon_transaksi ?? body.diskon, "Diskon");

    const nominalBayarInput = parseNumber(
      body.nominal_bayar ?? body.nominalBayar,
      "Nominal bayar"
    );

    const detailItems = normalizeDetailItems(
      body.detail_items ?? body.items ?? body.cart
    );

    const transaksiId = await prisma.$transaction(
      async (tx) => {
        let transaksi = idTransaksi
          ? await tx.transaksi_penjualan.findUnique({
              where: {
                id: idTransaksi,
              },
            })
          : null;

        if (idTransaksi && !transaksi) {
          throw new Error("Transaksi POS tidak ditemukan");
        }

        if (transaksi && transaksi.status_transaksi !== "Belum_Bayar") {
          throw new Error(
            "Transaksi hanya dapat dibayar jika statusnya masih Belum Bayar"
          );
        }

        if (transaksi && transaksi.id_user !== BigInt(session.id)) {
          throw new Error(
            "Forbidden. Transaksi ini bukan milik sesi admin saat ini"
          );
        }

        if (!transaksi) {
          transaksi = await tx.transaksi_penjualan.create({
            data: {
              id_user: BigInt(session.id),
              nama_cust: namaCust,
              tanggal_transaksi: new Date(),
              subtotal_transaksi: toDecimal(0),
              diskon_transaksi: toDecimal(0),
              total_transaksi: toDecimal(0),
              nominal_bayar: toDecimal(0),
              kembalian: toDecimal(0),
              metode_transaksi: metodeTransaksi,
              status_transaksi: transaksi_penjualan_status_transaksi.Belum_Bayar,
            },
          });
        }

        const idBarangList = detailItems.map((item) => item.id_barang);

        const barangList = await tx.barang.findMany({
          where: {
            id: {
              in: idBarangList,
            },
          },
        });

        const barangMap = new Map(
          barangList.map((barang) => [barang.id.toString(), barang])
        );

        const itemTransaksi: {
          id_barang: bigint;
          jumlah: bigint;
          harga_satuan: number;
          sub_total: number;
        }[] = [];

        let subtotalTransaksi = 0;

        for (const item of detailItems) {
          const barang = barangMap.get(item.id_barang.toString());

          if (!barang) {
            throw new Error("Barang tidak ditemukan");
          }

          if (barang.stock < item.jumlah) {
            throw new Error(
              `Stok barang ${barang.nama_barang} tidak mencukupi. Stok tersedia: ${barang.stock.toString()}`
            );
          }

          const hargaSatuan = toNumber(barang.harga);
          const jumlahNumber = Number(item.jumlah);
          const subTotal = hargaSatuan * jumlahNumber;

          subtotalTransaksi += subTotal;

          itemTransaksi.push({
            id_barang: item.id_barang,
            jumlah: item.jumlah,
            harga_satuan: hargaSatuan,
            sub_total: subTotal,
          });
        }

        if (diskon > subtotalTransaksi) {
          throw new Error("Diskon tidak boleh melebihi subtotal transaksi");
        }

        const totalTransaksi = Math.max(subtotalTransaksi - diskon, 0);

        if (metodeTransaksi === "Cash" && nominalBayarInput < totalTransaksi) {
          throw new Error("Nominal bayar belum mencukupi total transaksi");
        }

        const nominalBayar =
          metodeTransaksi === "Cash" ? nominalBayarInput : totalTransaksi;

        const kembalian =
          metodeTransaksi === "Cash"
            ? Math.max(nominalBayar - totalTransaksi, 0)
            : 0;

        const nomorTransaksi = buildNomorTransaksi(
          transaksi.id,
          transaksi.tanggal_transaksi
        );

        await tx.detail_transaksi.deleteMany({
          where: {
            id_transaksi: transaksi.id,
          },
        });

        const stockMutasi = await tx.stock_mutasi.create({
          data: {
            id_user: BigInt(session.id),
            id_supplier: null,
            jenis_mutasi: "Barang Keluar",
            tanggal_mutasi: transaksi.tanggal_transaksi,
            keterangan: `Sumber: POS Penjualan\nNo. Transaksi: ${nomorTransaksi}`,
          },
        });

        await tx.detail_transaksi.createMany({
          data: itemTransaksi.map((item) => ({
            id_transaksi: transaksi.id,
            id_barang: item.id_barang,
            jumlah: item.jumlah,
            harga_satuan: toDecimal(item.harga_satuan),
            sub_total: toDecimal(item.sub_total),
          })),
        });

        await tx.detail_stock_mutasi.createMany({
          data: itemTransaksi.map((item) => ({
            id_stock_mutasi: stockMutasi.id,
            id_barang: item.id_barang,
            id_sparepart: null,
            jumlah: item.jumlah,
          })),
        });

        for (const item of itemTransaksi) {
          const updatedBarang = await tx.barang.updateMany({
            where: {
              id: item.id_barang,
              stock: {
                gte: item.jumlah,
              },
            },
            data: {
              stock: {
                decrement: item.jumlah,
              },
            },
          });

          if (updatedBarang.count === 0) {
            const barang = barangMap.get(item.id_barang.toString());

            throw new Error(
              `Stok barang ${barang?.nama_barang ?? "terpilih"} tidak mencukupi`
            );
          }
        }

        await tx.transaksi_penjualan.update({
          where: {
            id: transaksi.id,
          },
          data: {
            nama_cust: namaCust,
            subtotal_transaksi: toDecimal(subtotalTransaksi),
            diskon_transaksi: toDecimal(diskon),
            total_transaksi: toDecimal(totalTransaksi),
            nominal_bayar: toDecimal(nominalBayar),
            kembalian: toDecimal(kembalian),
            metode_transaksi: metodeTransaksi,
            status_transaksi: transaksi_penjualan_status_transaksi.Dibayar,
          },
        });

        return transaksi.id;
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );

    const transaksiLengkap = await getTransaksiLengkap(transaksiId);
    const result = buildTransaksiResponse(transaksiLengkap);

    return NextResponse.json(
      {
        success: true,
        message: "Transaksi POS berhasil dibayar",
        data: serializeData(result),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST POS TRANSAKSI ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Gagal menyimpan transaksi POS";

    const status = message.includes("Unauthorized")
      ? 401
      : message.includes("Forbidden")
      ? 403
      : message.includes("tidak ditemukan")
      ? 404
      : message.includes("wajib") ||
        message.includes("harus") ||
        message.includes("maksimal") ||
        message.includes("tidak boleh") ||
        message.includes("mencukupi") ||
        message.includes("Stok") ||
        message.includes("Belum Bayar")
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