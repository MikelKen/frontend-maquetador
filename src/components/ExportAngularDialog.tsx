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
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { ExportProjectAngular } from "@/utils/exportProjectAngular";
import type { Editor } from "grapesjs";
import { ExportXmlAngular } from "@/utils/exportXMLAngular";

function ExportAngularDialog({ editor, xmlFile }: { editor?: Editor; xmlFile?: File }) {
  const [projectName, setProjectName] = useState<string>("export_angular");

  const handleProjectExport = () => {
    if (!editor) return;
    if (xmlFile) {
      ExportXmlAngular(xmlFile, projectName);
    } else {
      ExportProjectAngular(editor, projectName.trim());
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-cyan-500 border-cyan-500 hover:bg-cyan-500 hover:text-white transition-all"
        >
          <Download size={16} />
          Export project
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl bg-[#0f172a] text-cyan-100 border border-cyan-700 rounded-xl shadow-2xl px-8 py-6 !top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">Export in Angular project</DialogTitle>
          <DialogDescription className="text-cyan-200">
            Generate an Angular project with your designed pages.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="name" className="text-right text-cyan-300">
              Project Name
            </Label>
            <Input
              id="name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="col-span-3 bg-[#1e293b] text-cyan-200 border-cyan-500"
              placeholder="mi-proyecto-angular"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" className="bg-cyan-600 hover:bg-cyan-700" onClick={handleProjectExport}>
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ExportAngularDialog;
