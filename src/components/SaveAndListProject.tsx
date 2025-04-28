import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListTableProjects } from "./ListTableProjects";
import { API_ROUTES } from "@/lib/api.routes";
import { FolderPlus } from "lucide-react";
import { toast } from "sonner";
import AlerDialog from "./AlerDialog";

interface Project {
  name: string;
  link: string;
  created_at?: string;
  updated_at?: string;
  shareId: string;
}
interface ProjectApiResponse {
  name: string;
  shareId: string;
  createdAt?: string;
  updatedAt?: string;
}

function SaveAndListProject() {
  const [projectName, setProjectName] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareIdToDelete, setShareIdToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchProjects();
    }
  }, [open]);

  const fetchProjects = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("No hay token disponible");

      const response = await fetch(API_ROUTES.PROJECT_LIST.url, {
        method: API_ROUTES.PROJECT_LIST.method,
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error al cargar proyectos");

      const data: ProjectApiResponse[] = await response.json();
      const originUrl = new URL(window.location.href).origin;

      const formattedProjects: Project[] = data.map((project) => ({
        name: project.name,
        link: `${originUrl}/grapesjs/${project.shareId}`,
        shareId: project.shareId,
        created_at: project.createdAt,
        updated_at: project.updatedAt,
      }));

      setProjects(formattedProjects);
    } catch (error) {
      console.error(error);
      toast("Error loading projects", {
        description: "Please try again .",
      });
    }
  };

  const handleCrearNewProject = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("No hay token disponible");

      const response = await fetch(`${API_ROUTES.PROJECT_CREATE.url}`, {
        method: API_ROUTES.PROJECT_CREATE.method,
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: projectName }),
      });

      if (!response.ok) throw new Error("Error al crear el proyecto");

      await fetchProjects();
      setProjectName("my_project");
      toast("Project successfully created", {
        description: "Now you can start a new project.",
      });
    } catch (error) {
      console.error(error);
      toast("Error created project", {
        description: "Please try again .",
      });
    }
  };

  const askDeleteProject = (shareId: string) => {
    setShareIdToDelete(shareId);

    setDeleteDialogOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!shareIdToDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay token disponible");

      const response = await fetch(`${API_ROUTES.PROJECT_DELETE.url}/${shareIdToDelete}`, {
        method: API_ROUTES.PROJECT_DELETE.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error al eliminar proyecto");

      toast("Project successfully deleted", {
        description: "Delete your projects that you will no longer use.",
      });

      setDeleteDialogOpen(false);
      setShareIdToDelete(null);
      await fetchProjects();
    } catch (error) {
      console.error(error);
      toast("Error deleting project", { description: "Please try again." });
    }
  };

  return (
    <>
      {/* Botón para abrir modal de proyectos */}
      <Button
        variant="outline"
        className="text-cyan-500 border-cyan-500 hover:bg-cyan-500 hover:text-white transition-all flex items-center gap-2"
        onClick={() => setOpen(true)}
      >
        <FolderPlus size={16} />
        My Projects
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative w-[1000px] max-w-[95vw] max-h-[90vh] bg-[#0f172a] text-cyan-100 border border-cyan-700 rounded-2xl shadow-2xl p-10 overflow-y-auto">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-cyan-300 hover:text-red-400 transition"
            >
              ✕
            </button>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-cyan-400">Create new project</h2>
                <p className="text-cyan-200">Create your project with your designed pages.</p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="text-cyan-300">
                  Project Name
                </Label>

                <div className="flex gap-4">
                  <Input
                    id="name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="bg-[#1e293b] text-cyan-200 border-cyan-500 flex-1"
                    placeholder="my project"
                  />
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleCrearNewProject}
                    className="bg-cyan-600 hover:bg-cyan-700 flex items-center gap-2"
                  >
                    Create project
                  </Button>
                </div>
              </div>

              <ListTableProjects
                projects={projects}
                onDelete={(shareId) => askDeleteProject(shareId)}
                onEdit={fetchProjects}
              />
            </div>
          </div>
        </div>
      )}

      {/* Componente de AlertDialog separado */}
      <AlerDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={confirmDeleteProject} />
    </>
  );
}

export default SaveAndListProject;
