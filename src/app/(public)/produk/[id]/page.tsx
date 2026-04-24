import { notFound } from "next/navigation";
import ProdukDetailPage from "@/components/UI/public/produk/ProdukDetailPage";
import { dummyBarang } from "@/lib/dummy/product";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = dummyBarang.find((item) => item.id.toString() === id);

  if (!product) {
    notFound();
  }

  return <ProdukDetailPage product={product} />;
}