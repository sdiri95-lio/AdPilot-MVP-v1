import { ProfitCalculatorView } from "@/components/projects/ProfitCalculatorView";

type ProfitPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProfitPage({ params }: ProfitPageProps) {
  const { id } = await params;
  return <ProfitCalculatorView projectId={id} />;
}
