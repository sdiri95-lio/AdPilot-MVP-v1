import { CsvUploadView } from "@/components/projects/CsvUploadView";

type ResultsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;

  return (
    <CsvUploadView projectId={id} />
  );
}
