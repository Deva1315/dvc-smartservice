import AdminGudangBarangPage from "@/components/UI/dashboard/admin-gudang/barang/AdminGudangBarangPage";
import { prisma } from "@/lib/prisma";

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

export default async function Page() {
  const [barangData, kategoriData, supplierData] = await Promise.all([
    prisma.barang.findMany({
      take: 10,
      orderBy: {
        id: "desc",
      },
      include: {
        kategori_barang: true,
        suppliers: true,
        _count: {
          select: {
            detail_stock_mutasi: true,
            detail_stock_opname: true,
            detail_transaksi: true,
          },
        },
      },
    }),

    prisma.kategori_barang.findMany({
      take: 10,
      orderBy: {
        id: "desc",
      },
      include: {
        _count: {
          select: {
            barang: true,
          },
        },
      },
    }),

    prisma.suppliers.findMany({
      take: 10,
      orderBy: {
        id: "desc",
      },
      include: {
        _count: {
          select: {
            sparepart: true,
            stock_mutasi: true,
          },
        },
      },
    }),
  ]);

  return (
    <AdminGudangBarangPage
      initialBarang={serializeData(barangData)}
      initialKategoriOptions={serializeData(kategoriData)}
      initialSupplierOptions={serializeData(supplierData)}
    />
  );
}