import { ProductAnalyzerView } from "@/components/projects/ProductAnalyzerView";

type AnalyzePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AnalyzePage({ params }: AnalyzePageProps) {
  const { id } = await params;
  return <ProductAnalyzerView projectId={id} />;
}
