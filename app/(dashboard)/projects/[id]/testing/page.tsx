import { TestingPipelineView } from "@/components/projects/TestingPipelineView";

type TestingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TestingPage({ params }: TestingPageProps) {
  const { id } = await params;

  return (
    <TestingPipelineView projectId={id} />
  );
}
