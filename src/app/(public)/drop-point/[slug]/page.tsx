import { notFound } from "next/navigation";
import DropPointDetailPage from "@/components/UI/public/drop-point/DropPointDetailPage";
import { extractDropPointIdFromSlug } from "@/utils/public/public-drop-point.utils";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const dropPointId = extractDropPointIdFromSlug(slug);

  if (!dropPointId) {
    notFound();
  }

  return <DropPointDetailPage dropPointId={dropPointId} />;
}