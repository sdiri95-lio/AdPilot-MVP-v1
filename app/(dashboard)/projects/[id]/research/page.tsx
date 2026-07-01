import { ProductDatabaseView } from "@/components/projects/ProductDatabaseView";

type ResearchPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ResearchPage({ params }: ResearchPageProps) {
  const { id } = await params;

  return (
    <ProductDatabaseView projectId={id} />
  );
}
