import { NextRequest, NextResponse } from "next/server";
import {
  pembayaran_servis_status_pembayaran,
  transaksi_penjualan_status_transaksi,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth/get-auth-session";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{
    jenis: string;
  }>;
};

type PeriodeLaporan = "harian" | "mingguan" | "bulanan" | "tahunan";

type JenisLaporan =
  | "penjualan"
  | "servis"
  | "stock-barang"
  | "stock-sparepart"
  | "pendapatan-gabungan";

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

async function requireOwnerSession() {
  const session = await getAuthSession();

  if (!session) {
    throw new Error("Unauthorized. Silakan login terlebih dahulu.");
  }

  const role = normalizeRole(session.roleName);

  if (role !== "owner") {
    throw new Error("Forbidden. Hanya Owner yang dapat mengakses laporan.");
  }

  return session;
}

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseJenisLaporan(value: string): JenisLaporan | null {
  const allowedJenis: JenisLaporan[] = [
    "penjualan",
    "servis",
    "stock-barang",
    "stock-sparepart",
    "pendapatan-gabungan",
  ];

  if (allowedJenis.includes(value as JenisLaporan)) {
    return value as JenisLaporan;
  }

  return null;
}

function parsePeriode(value: string | null): PeriodeLaporan {
  if (
    value === "harian" ||
    value === "mingguan" ||
    value === "bulanan" ||
    value === "tahunan"
  ) {
    return value;
  }

  return "harian";
}

function parseTanggal(value: string | null) {
  if (!value) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  return date;
}

function addDays(date: Date, amount: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function getStartOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function getStartOfWeekMonday(date: Date) {
  const nextDate = getStartOfDay(date);
  const day = nextDate.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  nextDate.setDate(nextDate.getDate() + diffToMonday);

  return nextDate;
}

function getStartOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getStartOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1);
}

function getDateRange(periode: PeriodeLaporan, tanggal: Date) {
  if (periode === "mingguan") {
    const startDate = getStartOfWeekMonday(tanggal);
    const endDate = addDays(startDate, 7);

    return {
      startDate,
      endDate,
    };
  }

  if (periode === "bulanan") {
    const startDate = getStartOfMonth(tanggal);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);

    return {
      startDate,
      endDate,
    };
  }

  if (periode === "tahunan") {
    const startDate = getStartOfYear(tanggal);
    const endDate = new Date(startDate.getFullYear() + 1, 0, 1);

    return {
      startDate,
      endDate,
    };
  }

  const startDate = getStartOfDay(tanggal);
  const endDate = addDays(startDate, 1);

  return {
    startDate,
    endDate,
  };
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

function buildNomorNotaServis(id: bigint | string, tanggal: Date) {
  return `SRV-${formatDateCode(tanggal)}-${String(id).padStart(4, "0")}`;
}

function formatDateDisplay(value: Date | string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value: unknown) {
  const numberValue = toNumber(value);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(numberValue);
}

function getPerangkatDisplay(item: {
  jenis_perangkat: string;
  merk_perangkat: string | null;
}) {
  if (!item.merk_perangkat) {
    return item.jenis_perangkat;
  }

  return `${item.jenis_perangkat} - ${item.merk_perangkat}`;
}

function getStatusStock(stock: bigint | number | string) {
  const stockNumber = toNumber(stock);

  if (stockNumber <= 0) {
    return "Habis";
  }

  if (stockNumber <= 5) {
    return "Menipis";
  }

  return "Aman";
}

async function getLaporanPenjualan(startDate: Date, endDate: Date) {
  const data = await prisma.transaksi_penjualan.findMany({
    where: {
      status_transaksi: transaksi_penjualan_status_transaksi.Dibayar,
      tanggal_transaksi: {
        gte: startDate,
        lt: endDate,
      },
    },
    orderBy: {
      tanggal_transaksi: "desc",
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

  const rows = data.map((item) => {
    const totalItem = item.detail_transaksi.reduce((total, detail) => {
      return total + toNumber(detail.jumlah);
    }, 0);

    return {
      id: `LPJ-${item.id.toString()}`,
      id_transaksi: item.id,
      tanggal: formatDateDisplay(item.tanggal_transaksi),
      tanggal_raw: item.tanggal_transaksi,
      no_nota: buildNomorTransaksi(item.id, item.tanggal_transaksi),
      customer: "Customer Umum",
      total_item: totalItem,
      total_bayar: formatCurrency(item.total_transaksi),
      total_bayar_number: toNumber(item.total_transaksi),
      metode_transaksi: item.metode_transaksi,
      admin: item.users.nama,
      detail: item.detail_transaksi.map((detail) => ({
        id: detail.id,
        nama_barang: detail.barang.nama_barang,
        kode_barang: detail.barang.kode_barang,
        kategori: detail.barang.kategori_barang.nama_kategori,
        jumlah: detail.jumlah,
        harga_satuan: detail.harga_satuan,
        sub_total: detail.sub_total,
      })),
    };
  });

  const totalNominal = rows.reduce(
    (total, item) => total + item.total_bayar_number,
    0
  );

  return {
    data: rows,
    summary: {
      total_data: rows.length,
      total_item: rows.reduce((total, item) => total + item.total_item, 0),
      total_nominal: totalNominal,
      total_nominal_display: formatCurrency(totalNominal),
    },
  };
}

async function getLaporanServis(startDate: Date, endDate: Date) {
  const data = await prisma.pembayaran_servis.findMany({
    where: {
      status_pembayaran: pembayaran_servis_status_pembayaran.Dibayar,
      tanggal_pembayaran: {
        gte: startDate,
        lt: endDate,
      },
    },
    orderBy: {
      tanggal_pembayaran: "desc",
    },
    include: {
      users: {
        select: {
          id: true,
          nama: true,
          email: true,
        },
      },
      tiket_servis: {
        include: {
          detail_tiket_servis: {
            include: {
              jasa_servis: true,
              sparepart: true,
            },
          },
        },
      },
    },
  });

  const rows = data.map((item) => {
    const totalItem = item.tiket_servis.detail_tiket_servis.reduce(
      (total, detail) => total + toNumber(detail.jumlah),
      0
    );

    return {
      id: `LSV-${item.id.toString()}`,
      id_pembayaran_servis: item.id,
      id_tiket_servis: item.id_tiket_servis,
      tanggal: formatDateDisplay(item.tanggal_pembayaran),
      tanggal_raw: item.tanggal_pembayaran,
      no_nota: buildNomorNotaServis(item.id, item.tanggal_pembayaran),
      nomor_tiket: item.tiket_servis.nomor_tiket,
      customer: item.tiket_servis.nama_cust,
      total_item: totalItem,
      total_bayar: formatCurrency(item.total_pembayaran),
      total_bayar_number: toNumber(item.total_pembayaran),
      metode_pembayaran: item.metode_pembayaran,
      admin: item.users.nama,
      perangkat: getPerangkatDisplay(item.tiket_servis),
      detail: item.tiket_servis.detail_tiket_servis.map((detail) => ({
        id: detail.id,
        tipe: detail.id_jasa_servis ? "Jasa" : "Sparepart",
        nama:
          detail.jasa_servis?.nama_jasa_servis ||
          detail.sparepart?.nama_sparepart ||
          "-",
        jumlah: detail.jumlah,
        harga: detail.harga,
        subtotal: detail.subtotal,
      })),
    };
  });

  const totalNominal = rows.reduce(
    (total, item) => total + item.total_bayar_number,
    0
  );

  return {
    data: rows,
    summary: {
      total_data: rows.length,
      total_item: rows.reduce((total, item) => total + item.total_item, 0),
      total_nominal: totalNominal,
      total_nominal_display: formatCurrency(totalNominal),
    },
  };
}

async function getLaporanStockBarang(startDate: Date, endDate: Date) {
  const [barangData, mutasiPeriode, mutasiSetelahPeriode] = await Promise.all([
    prisma.barang.findMany({
      orderBy: {
        nama_barang: "asc",
      },
      include: {
        kategori_barang: true,
      },
    }),

    prisma.detail_stock_mutasi.findMany({
      where: {
        id_barang: {
          not: null,
        },
        stock_mutasi: {
          tanggal_mutasi: {
            gte: startDate,
            lt: endDate,
          },
        },
      },
      include: {
        stock_mutasi: true,
      },
    }),

    prisma.detail_stock_mutasi.findMany({
      where: {
        id_barang: {
          not: null,
        },
        stock_mutasi: {
          tanggal_mutasi: {
            gte: endDate,
          },
        },
      },
      include: {
        stock_mutasi: true,
      },
    }),
  ]);

  const masukPeriodeMap = new Map<string, number>();
  const keluarPeriodeMap = new Map<string, number>();
  const masukSetelahPeriodeMap = new Map<string, number>();
  const keluarSetelahPeriodeMap = new Map<string, number>();

  for (const detail of mutasiPeriode) {
    if (!detail.id_barang) continue;

    const barangId = detail.id_barang.toString();
    const jumlah = toNumber(detail.jumlah);
    const jenisMutasi = detail.stock_mutasi.jenis_mutasi.trim().toLowerCase();

    if (jenisMutasi === "barang masuk") {
      masukPeriodeMap.set(
        barangId,
        (masukPeriodeMap.get(barangId) || 0) + jumlah
      );
    }

    if (jenisMutasi === "barang keluar") {
      keluarPeriodeMap.set(
        barangId,
        (keluarPeriodeMap.get(barangId) || 0) + jumlah
      );
    }
  }

  for (const detail of mutasiSetelahPeriode) {
    if (!detail.id_barang) continue;

    const barangId = detail.id_barang.toString();
    const jumlah = toNumber(detail.jumlah);
    const jenisMutasi = detail.stock_mutasi.jenis_mutasi.trim().toLowerCase();

    if (jenisMutasi === "barang masuk") {
      masukSetelahPeriodeMap.set(
        barangId,
        (masukSetelahPeriodeMap.get(barangId) || 0) + jumlah
      );
    }

    if (jenisMutasi === "barang keluar") {
      keluarSetelahPeriodeMap.set(
        barangId,
        (keluarSetelahPeriodeMap.get(barangId) || 0) + jumlah
      );
    }
  }

  const rows = barangData.map((item) => {
    const barangId = item.id.toString();

    const stokSaatIni = toNumber(item.stock);

    const barangMasuk = masukPeriodeMap.get(barangId) || 0;
    const barangKeluar = keluarPeriodeMap.get(barangId) || 0;

    const barangMasukSetelahPeriode = masukSetelahPeriodeMap.get(barangId) || 0;
    const barangKeluarSetelahPeriode = keluarSetelahPeriodeMap.get(barangId) || 0;

    const stokAkhir =
      stokSaatIni - barangMasukSetelahPeriode + barangKeluarSetelahPeriode;

    const stokAwal = stokAkhir - barangMasuk + barangKeluar;

    return {
      id: `LSB-${item.id.toString()}`,
      id_barang: item.id,
      kode_barang: item.kode_barang,
      nama_barang: item.nama_barang,
      kategori: item.kategori_barang.nama_kategori,
      stok_awal: stokAwal,
      barang_masuk: barangMasuk,
      barang_keluar: barangKeluar,
      stok_akhir: stokAkhir,
      status: getStatusStock(stokAkhir),
      harga: item.harga,
      harga_display: formatCurrency(item.harga),
    };
  });

  return {
    data: rows,
    summary: {
      total_data: rows.length,
      total_stok_awal: rows.reduce((total, item) => total + item.stok_awal, 0),
      total_barang_masuk: rows.reduce(
        (total, item) => total + item.barang_masuk,
        0
      ),
      total_barang_keluar: rows.reduce(
        (total, item) => total + item.barang_keluar,
        0
      ),
      total_stok_akhir: rows.reduce(
        (total, item) => total + item.stok_akhir,
        0
      ),
      total_aman: rows.filter((item) => item.status === "Aman").length,
      total_menipis: rows.filter((item) => item.status === "Menipis").length,
      total_habis: rows.filter((item) => item.status === "Habis").length,
    },
  };
}

async function getLaporanStockSparepart(startDate: Date, endDate: Date) {
  const [sparepartData, mutasiPeriode, mutasiSetelahPeriode] =
    await Promise.all([
      prisma.sparepart.findMany({
        orderBy: {
          nama_sparepart: "asc",
        },
        include: {
          suppliers: true,
        },
      }),

      prisma.detail_stock_mutasi.findMany({
        where: {
          id_sparepart: {
            not: null,
          },
          stock_mutasi: {
            tanggal_mutasi: {
              gte: startDate,
              lt: endDate,
            },
          },
        },
        include: {
          stock_mutasi: true,
        },
      }),

      prisma.detail_stock_mutasi.findMany({
        where: {
          id_sparepart: {
            not: null,
          },
          stock_mutasi: {
            tanggal_mutasi: {
              gte: endDate,
            },
          },
        },
        include: {
          stock_mutasi: true,
        },
      }),
    ]);

  const masukPeriodeMap = new Map<string, number>();
  const keluarPeriodeMap = new Map<string, number>();
  const masukSetelahPeriodeMap = new Map<string, number>();
  const keluarSetelahPeriodeMap = new Map<string, number>();

  for (const detail of mutasiPeriode) {
    if (!detail.id_sparepart) continue;

    const sparepartId = detail.id_sparepart.toString();
    const jumlah = toNumber(detail.jumlah);
    const jenisMutasi = detail.stock_mutasi.jenis_mutasi.trim().toLowerCase();

    if (jenisMutasi === "barang masuk") {
      masukPeriodeMap.set(
        sparepartId,
        (masukPeriodeMap.get(sparepartId) || 0) + jumlah
      );
    }

    if (jenisMutasi === "barang keluar") {
      keluarPeriodeMap.set(
        sparepartId,
        (keluarPeriodeMap.get(sparepartId) || 0) + jumlah
      );
    }
  }

  for (const detail of mutasiSetelahPeriode) {
    if (!detail.id_sparepart) continue;

    const sparepartId = detail.id_sparepart.toString();
    const jumlah = toNumber(detail.jumlah);
    const jenisMutasi = detail.stock_mutasi.jenis_mutasi.trim().toLowerCase();

    if (jenisMutasi === "barang masuk") {
      masukSetelahPeriodeMap.set(
        sparepartId,
        (masukSetelahPeriodeMap.get(sparepartId) || 0) + jumlah
      );
    }

    if (jenisMutasi === "barang keluar") {
      keluarSetelahPeriodeMap.set(
        sparepartId,
        (keluarSetelahPeriodeMap.get(sparepartId) || 0) + jumlah
      );
    }
  }

  const rows = sparepartData.map((item) => {
    const sparepartId = item.id.toString();

    const stokSaatIni = toNumber(item.stock);

    const barangMasuk = masukPeriodeMap.get(sparepartId) || 0;
    const barangKeluar = keluarPeriodeMap.get(sparepartId) || 0;

    const barangMasukSetelahPeriode =
      masukSetelahPeriodeMap.get(sparepartId) || 0;
    const barangKeluarSetelahPeriode =
      keluarSetelahPeriodeMap.get(sparepartId) || 0;

    const stokAkhir =
      stokSaatIni - barangMasukSetelahPeriode + barangKeluarSetelahPeriode;

    const stokAwal = stokAkhir - barangMasuk + barangKeluar;

    return {
      id: `LSS-${item.id.toString()}`,
      id_sparepart: item.id,
      kode_sparepart: item.kode_sparepart,
      nama_sparepart: item.nama_sparepart,
      supplier: item.suppliers.nama_supplier,
      stok_awal: stokAwal,
      barang_masuk: barangMasuk,
      barang_keluar: barangKeluar,
      stok_akhir: stokAkhir,
      status: getStatusStock(stokAkhir),
      harga: item.harga,
      harga_display: formatCurrency(item.harga),
    };
  });

  return {
    data: rows,
    summary: {
      total_data: rows.length,
      total_stok_awal: rows.reduce((total, item) => total + item.stok_awal, 0),
      total_barang_masuk: rows.reduce(
        (total, item) => total + item.barang_masuk,
        0
      ),
      total_barang_keluar: rows.reduce(
        (total, item) => total + item.barang_keluar,
        0
      ),
      total_stok_akhir: rows.reduce(
        (total, item) => total + item.stok_akhir,
        0
      ),
      total_aman: rows.filter((item) => item.status === "Aman").length,
      total_menipis: rows.filter((item) => item.status === "Menipis").length,
      total_habis: rows.filter((item) => item.status === "Habis").length,
    },
  };
}

async function getLaporanPendapatanGabungan(startDate: Date, endDate: Date) {
  const [penjualan, servis] = await Promise.all([
    prisma.transaksi_penjualan.findMany({
      where: {
        status_transaksi: transaksi_penjualan_status_transaksi.Dibayar,
        tanggal_transaksi: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: {
        tanggal_transaksi: "desc",
      },
      include: {
        detail_transaksi: {
          include: {
            barang: true,
          },
        },
      },
    }),
    prisma.pembayaran_servis.findMany({
      where: {
        status_pembayaran: pembayaran_servis_status_pembayaran.Dibayar,
        tanggal_pembayaran: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: {
        tanggal_pembayaran: "desc",
      },
      include: {
        tiket_servis: true,
      },
    }),
  ]);

  const penjualanRows = penjualan.map((item) => {
    const firstDetail = item.detail_transaksi[0] || null;
    const totalItem = item.detail_transaksi.reduce((total, detail) => {
      return total + toNumber(detail.jumlah);
    }, 0);

    return {
      id: `LPG-PJ-${item.id.toString()}`,
      tanggal: formatDateDisplay(item.tanggal_transaksi),
      tanggal_raw: item.tanggal_transaksi,
      sumber: "Penjualan" as const,
      referensi: buildNomorTransaksi(item.id, item.tanggal_transaksi),
      keterangan:
        item.detail_transaksi.length === 1 && firstDetail
          ? `Penjualan ${firstDetail.barang.nama_barang}`
          : `Penjualan ${totalItem} item barang`,
      nominal: formatCurrency(item.total_transaksi),
      nominal_number: toNumber(item.total_transaksi),
    };
  });

  const servisRows = servis.map((item) => ({
    id: `LPG-SRV-${item.id.toString()}`,
    tanggal: formatDateDisplay(item.tanggal_pembayaran),
    tanggal_raw: item.tanggal_pembayaran,
    sumber: "Servis" as const,
    referensi: buildNomorNotaServis(item.id, item.tanggal_pembayaran),
    keterangan: `Servis ${getPerangkatDisplay(item.tiket_servis)} - Tiket ${item.tiket_servis.nomor_tiket}`,
    nominal: formatCurrency(item.total_pembayaran),
    nominal_number: toNumber(item.total_pembayaran),
  }));

  const rows = [...penjualanRows, ...servisRows].sort((a, b) => {
    return (
      new Date(b.tanggal_raw).getTime() - new Date(a.tanggal_raw).getTime()
    );
  });

  const totalPenjualan = penjualanRows.reduce(
    (total, item) => total + item.nominal_number,
    0
  );

  const totalServis = servisRows.reduce(
    (total, item) => total + item.nominal_number,
    0
  );

  const totalGabungan = totalPenjualan + totalServis;

  return {
    data: rows,
    summary: {
      total_data: rows.length,
      total_penjualan: totalPenjualan,
      total_penjualan_display: formatCurrency(totalPenjualan),
      total_servis: totalServis,
      total_servis_display: formatCurrency(totalServis),
      total_gabungan: totalGabungan,
      total_gabungan_display: formatCurrency(totalGabungan),
    },
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireOwnerSession();

    const { jenis } = await params;
    const jenisLaporan = parseJenisLaporan(jenis);

    if (!jenisLaporan) {
      return NextResponse.json(
        {
          success: false,
          message: "Jenis laporan tidak valid.",
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);

    const periode = parsePeriode(searchParams.get("periode"));
    const tanggal = parseTanggal(searchParams.get("tanggal"));
    const { startDate, endDate } = getDateRange(periode, tanggal);

    let result:
      | Awaited<ReturnType<typeof getLaporanPenjualan>>
      | Awaited<ReturnType<typeof getLaporanServis>>
      | Awaited<ReturnType<typeof getLaporanStockBarang>>
      | Awaited<ReturnType<typeof getLaporanStockSparepart>>
      | Awaited<ReturnType<typeof getLaporanPendapatanGabungan>>;

    if (jenisLaporan === "penjualan") {
      result = await getLaporanPenjualan(startDate, endDate);
    } else if (jenisLaporan === "servis") {
      result = await getLaporanServis(startDate, endDate);
    } else if (jenisLaporan === "stock-barang") {
      result = await getLaporanStockBarang(startDate, endDate);
    } else if (jenisLaporan === "stock-sparepart") {
      result = await getLaporanStockSparepart(startDate, endDate);
    } else {
      result = await getLaporanPendapatanGabungan(startDate, endDate);
    }

    return NextResponse.json({
      success: true,
      message: "Data laporan berhasil diambil.",
      jenis: jenisLaporan,
      periode,
      tanggal: tanggal.toISOString().slice(0, 10),
      range: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      data: serializeData(result.data),
      summary: serializeData(result.summary),
    });
  } catch (error) {
    console.error("GET OWNER LAPORAN ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Gagal mengambil data laporan.";

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