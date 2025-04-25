import React from "react";
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
import { Share2 } from "lucide-react";

function ShareDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-cyan-500 border-cyan-500 hover:bg-cyan-500 hover:text-white transition-all"
        >
          <Share2 size={16} />
          Compartir
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl bg-[#0f172a] text-cyan-100 border border-cyan-700 rounded-xl shadow-2xl px-8 py-6 !top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">Compartir acceso</DialogTitle>
          <DialogDescription className="text-cyan-200">Activá la colaboración.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="name" className="text-right text-cyan-300">
              Nombre
            </Label>
            <Input id="name" value="Sistema Neuron" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="link" className="text-right text-cyan-300">
              Enlace
            </Label>
            <div className="col-span-4 flex gap-2">
              <Input
                id="link"
                value="https://neuron-designer.app"
                className="flex-1 bg-[#1e293b] text-cyan-200 border-cyan-500"
                readOnly
              />
              <DialogFooter>
                <Button type="button" className="bg-cyan-600 hover:bg-cyan-700">
                  Copiar
                </Button>
              </DialogFooter>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShareDialog;
