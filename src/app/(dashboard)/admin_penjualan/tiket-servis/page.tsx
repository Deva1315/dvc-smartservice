import AdminPenjualanTiketServisPage from "@/components/UI/dashboard/admin-penjualan/tiket-servis/AdminPenjualanTiketServisPage";
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

export default async function Page() {
  const [tiketServisData, dropPointData] = await Promise.all([
    prisma.tiket_servis.findMany({
      take: 10,
      orderBy: {
        tanggal_masuk: "desc",
      },
      include: {
        drop_point: {
          select: {
            id: true,
            nama_drop_point: true,
            alamat: true,
            phone: true,
            jam_operasional: true,
          },
        },
      },
    }),
    prisma.drop_point.findMany({
      orderBy: {
        nama_drop_point: "asc",
      },
      select: {
        id: true,
        nama_drop_point: true,
        alamat: true,
        phone: true,
        jam_operasional: true,
      },
    }),
  ]);

  return (
    <AdminPenjualanTiketServisPage
      initialTiketServis={serializeData(tiketServisData)}
      initialDropPointOptions={serializeData(dropPointData)}
    />
  );
}