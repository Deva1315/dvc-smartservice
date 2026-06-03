import AdminPenjualanJasaServisPage from "@/components/UI/dashboard/admin-penjualan/jasa-servis/AdminPenjualanJasaServisPage";
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

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default async function Page() {
  const data = await prisma.jasa_servis.findMany({
    take: 10,
    orderBy: {
      id: "desc",
    },
    include: {
      _count: {
        select: {
          detail_tiket_servis: true,
        },
      },
    },
  });

  const initialData = serializeData(
    data.map((item) => ({
      ...item,
      slug: createSlug(item.nama_jasa_servis),
    }))
  );

  return <AdminPenjualanJasaServisPage initialData={initialData} />;
}