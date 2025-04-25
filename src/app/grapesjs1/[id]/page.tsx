import GrapesJsPageWrapper from "../grapesjsPageWrapper";

export default function ProjectEditorPage({ params }: { params: { id: string } }) {
  return <GrapesJsPageWrapper shareId={params.id} />;
}
