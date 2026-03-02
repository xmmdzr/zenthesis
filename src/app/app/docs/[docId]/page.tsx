import { DocumentEditorPane } from "@/components/document-editor-pane";

interface DocPageProps {
  params: Promise<{ docId: string }>;
}

export default async function DocumentEditorPage({ params }: DocPageProps) {
  const { docId } = await params;
  return <DocumentEditorPane docId={docId} />;
}
