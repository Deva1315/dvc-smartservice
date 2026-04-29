import ProdukDetailPage from "@/components/UI/public/produk/ProdukDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ProdukDetailPage productSlug={slug} />;
}