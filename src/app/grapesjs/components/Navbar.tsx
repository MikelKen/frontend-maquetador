import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface User {
  id: string;
  name: string;
  color: string;
}

interface Props {
  onExport: () => void;
  onLogData: () => void;
  onShare: () => void;
  users: User[];
}

function Navbar({ onExport, onLogData, onShare, users }: Props) {
  return (
    <div className="p-2 bg-black shadow flex justify-between items-center px-6">
      <div className="text-xl font-bold text-gray-700">Diagramador</div>

      <div className="flex items-center gap-6">
        <button onClick={onLogData} className="text-sm border rounded px-3 py-1">
          Log Data
        </button>
        <button onClick={onExport} className="text-sm border rounded px-3 py-1">
          Exportar HTML/CSS
        </button>

        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {users.slice(0, 5).map((user) => (
              <div
                key={user.id}
                className="w-6 h-6 rounded-full border-2 border-white"
                style={{ backgroundColor: user.color }}
                title={user.name}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">{users.length} usuarios editando</span>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Compartir</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <DialogHeader>
              <DialogTitle>Compartir</DialogTitle>
              <DialogDescription>Colaboración en vivo.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-0">
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input id="name" value="Pedro Duarte" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Enlace
                </Label>
                <div className="col-span-4 flex gap-2">
                  <Input id="username" value="https://maquetador" className="flex-10" readOnly />
                  <DialogFooter>
                    <Button type="submit">Copiar Enlace</Button>
                  </DialogFooter>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <button
          onClick={onShare}
          className="bg-blue-600 text-white rounded px-4 py-1 text-sm hover:bg-blue-700 transition"
        >
          Compartir
        </button>
      </div>
    </div>
  );
}

export default Navbar;
