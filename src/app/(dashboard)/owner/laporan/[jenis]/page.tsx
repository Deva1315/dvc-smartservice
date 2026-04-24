import { notFound } from "next/navigation";
import OwnerLaporanPenjualanPage from "@/components/UI/dashboard/owner/laporan/OwnerLaporanPenjualanPage";
import OwnerLaporanServisPage from "@/components/UI/dashboard/owner/laporan/OwnerLaporanServisPage";
import OwnerLaporanStockBarangPage from "@/components/UI/dashboard/owner/laporan/OwnerLaporanStockBarangPage";
import OwnerLaporanStockSparepartPage from "@/components/UI/dashboard/owner/laporan/OwnerLaporanStockSparepartPage";
import OwnerLaporanPerangkatServisBelumDiambilPage from "@/components/UI/dashboard/owner/laporan/OwnerLaporanPerangkatServisBelumDiambilPage";
import OwnerLaporanPendapatanGabunganPage from "@/components/UI/dashboard/owner/laporan/OwnerLaporanPendapatanGabunganPage";

type PageProps = {
  params: Promise<{
    jenis: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { jenis } = await params;

  if (jenis === "penjualan") {
    return <OwnerLaporanPenjualanPage />;
  }

  if (jenis === "servis") {
    return <OwnerLaporanServisPage />;
  }

  if (jenis === "stock-barang") {
    return <OwnerLaporanStockBarangPage />;
  }

  if (jenis === "stock-sparepart") {
    return <OwnerLaporanStockSparepartPage />;
  }

  if (jenis === "perangkat-servis-belum-diambil") {
    return <OwnerLaporanPerangkatServisBelumDiambilPage />;
  }

  if (jenis === "pendapatan-gabungan") {
    return <OwnerLaporanPendapatanGabunganPage />;
  }

  notFound();
}