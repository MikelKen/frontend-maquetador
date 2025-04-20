import GrapesJs from "../grapesjs";

export default function ProjectEditorPage({ params }: { params: { id: string } }) {
  return <GrapesJs shareId={params.id} />;
}
