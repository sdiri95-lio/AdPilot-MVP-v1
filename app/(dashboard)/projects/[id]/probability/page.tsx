import { WinningProbabilityView } from "@/components/projects/WinningProbabilityView";

type ProbabilityPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProbabilityPage({ params }: ProbabilityPageProps) {
  const { id } = await params;
  return <WinningProbabilityView projectId={id} />;
}
