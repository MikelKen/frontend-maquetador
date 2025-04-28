import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import type { Editor } from "grapesjs";

import ImageToUIComponent from "./ImageToUIComponent";
import XmlToUIComponent from "./XmlToUIComponent";

export function TabsGenerator({ editor }: { editor?: Editor }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-cyan-500 border-cyan-500 hover:bg-cyan-500 hover:text-white transition-all"
        >
          Generator
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-[#0f172a] text-cyan-100 border border-cyan-700 rounded-xl shadow-2xl px-8 py-6 !top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2">
        <DialogHeader>
          <DialogTitle>Generator UI</DialogTitle>
          <DialogDescription>Upload an image or XML to get started</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="imageAI" className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-4 bg-[#1e293b] border border-cyan-700 rounded-lg overflow-hidden">
            <TabsTrigger value="imageAI" className="data-[state=active]:bg-cyan-700">
              Image to UI
            </TabsTrigger>
            <TabsTrigger value="xmlCrud" className="data-[state=active]:bg-cyan-700">
              XML to UI
            </TabsTrigger>
          </TabsList>

          {/* Imagen a UI */}
          <ImageToUIComponent editor={editor} />

          {/* XML a UI */}
          <XmlToUIComponent editor={editor} />
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
