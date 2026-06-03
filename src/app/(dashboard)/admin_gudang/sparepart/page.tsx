import AdminGudangSparepartPage from "@/components/UI/dashboard/admin-gudang/sparepart/AdminGudangSparepartPage";
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
  const [sparepartData, supplierData] = await Promise.all([
    prisma.sparepart.findMany({
      take: 10,
      orderBy: {
        id: "desc",
      },
      include: {
        suppliers: true,
        _count: {
          select: {
            detail_stock_mutasi: true,
            detail_stock_opname: true,
            detail_tiket_servis: true,
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
    <AdminGudangSparepartPage
      initialSparepart={serializeData(sparepartData)}
      initialSupplierOptions={serializeData(supplierData)}
    />
  );
}