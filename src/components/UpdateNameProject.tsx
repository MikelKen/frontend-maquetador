import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { API_ROUTES } from "@/lib/api.routes";

interface UpdateNameProjectProps {
  shareId: string;
  onUpdated: () => void;
}

function UpdateNameProject({ shareId, onUpdated }: UpdateNameProjectProps) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      toast("Project name cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay token disponible");

      const response = await fetch(`${API_ROUTES.PROJECT_PATH.url}/${shareId}`, {
        method: API_ROUTES.PROJECT_PATH.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!response.ok) throw new Error("Error al actualizar el nombre");

      toast("Project name updated successfully", {
        description: "The new name has been saved.",
      });

      setOpen(false);
      setNewName("");
      onUpdated(); // Refresca los proyectos
    } catch (error) {
      console.error(error);
      toast("Error updating project name", {
        description: "Please try again.",
      });
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-cyan-700 text-cyan-400">
          <Pencil size={18} />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl bg-[#0f172acc] text-cyan-100 border border-cyan-700 rounded-xl shadow-2xl px-8 py-6 !top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">Update project name</DialogTitle>
          <DialogDescription className="text-cyan-200">Enter the new name for your project.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="flex gap-4">
            <Input
              id="new-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New project name"
              className="flex-1 bg-[#1e293b] text-cyan-200 border-cyan-500"
            />
            <Button
              variant={"outline"}
              type="button"
              onClick={handleUpdateName}
              className="text-cyan-500 border-cyan-500 hover:bg-cyan-500 hover:text-white transition-all"
            >
              Update
            </Button>
          </div>
        </div>

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}

export default UpdateNameProject;
