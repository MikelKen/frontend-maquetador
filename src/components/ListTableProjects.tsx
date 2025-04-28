import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import UpdateNameProject from "./UpdateNameProject";

interface Project {
  name: string;
  link: string;
  created_at?: string;
  updated_at?: string;
  shareId: string;
}

interface ListTableProjectsProps {
  projects: Project[];
  onDelete: (shareId: string, projectName: string) => void;
  onEdit: () => void;
}
export function ListTableProjects({ projects, onDelete, onEdit }: ListTableProjectsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-cyan-400">My Projects</h2>

      <div className="max-h-[400px] overflow-y-auto overflow-x-auto rounded-lg border border-cyan-700">
        <Table>
          <TableHeader className="sticky top-0 bg-[#0f172a] z-10">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.shareId}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell className="max-w-[300px] truncate">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 underline break-words"
                    title={project.link}
                  >
                    {project.link}
                  </a>
                </TableCell>
                <TableCell>{project.created_at ? new Date(project.created_at).toLocaleString() : "-"}</TableCell>
                <TableCell>{project.updated_at ? new Date(project.updated_at).toLocaleString() : "-"}</TableCell>
                <TableCell className="flex justify-end gap-2 pr-4">
                  <UpdateNameProject shareId={project.shareId} onUpdated={onEdit} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-red-700 text-red-400"
                    onClick={() => onDelete(project.shareId, project.name)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
