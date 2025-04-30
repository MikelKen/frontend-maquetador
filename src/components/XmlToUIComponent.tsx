import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import type { Editor } from "grapesjs";
import { GenerateXmlToPages } from "@/utils/generateXmlToPages";
import { FileUp, ClipboardPaste, UploadCloud, FileText, XCircle } from "lucide-react";
import { useDropzone } from "react-dropzone";
import ExportAngularDialog from "./ExportAngularDialog";
import { toast } from "sonner";

function XmlToUIComponent({ editor, onSuccess }: { editor?: Editor; onSuccess?: () => void }) {
  const [xmlContent, setXmlContent] = useState<string>("");
  const [modoPegado, setModoPegado] = useState(false);
  const [modoDrag, setModoDrag] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // XML dropzone
  const onDropXml = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setXmlFile(file);
      setFileName(file.name);
      setProgress(0);

      const reader = new FileReader();

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const porc = Math.round((event.loaded / event.total) * 100);
          setProgress(porc);
        }
      };

      reader.onloadend = () => {
        setProgress(100);
        setXmlContent(reader.result as string);
      };

      reader.readAsText(file);
    }
  }, []);

  const { getRootProps: getXmlRootProps, getInputProps: getXmlInputProps } = useDropzone({
    accept: { "text/xml": [".xml"] },
    multiple: false,
    onDrop: onDropXml,
  });

  const handleGenerateXmlToUI = async () => {
    if (!editor) return;
    setIsGenerating(true);
    let blob: File | undefined;
    if (modoPegado && xmlContent.trim()) {
      blob = new File([xmlContent], "pego-xml.xml", { type: "text/xml" });
    } else if (modoDrag && xmlFile) {
      blob = xmlFile;
    }

    if (blob) {
      await GenerateXmlToPages(blob, editor);
      toast("¡Páginas generadas exitosamente!");
      if (onSuccess) onSuccess();
    } else {
      toast("Selecciona o pega un archivo XML válido");
    }
  };
  return (
    <TabsContent value="xmlCrud">
      <Card className="bg-[#1e293b] border border-cyan-700 text-cyan-100">
        <CardHeader>
          <CardTitle>Upload XML Diagram</CardTitle>
          <CardDescription className="text-cyan-400">Upload an XML file or paste its contents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setModoDrag(true);
                setModoPegado(false);
              }}
              className="bg-cyan-700 hover:bg-cyan-600 text-white"
            >
              <FileUp className="w-4 h-4" />
              Upload XML File
            </Button>
            <Button
              onClick={() => {
                setModoPegado(true);
                setModoDrag(false);
              }}
              variant="outline"
              className="border-cyan-500 text-cyan-300"
            >
              <ClipboardPaste className="w-4 h-4" />
              Paste Content
            </Button>
          </div>

          {modoPegado ? (
            <textarea
              value={xmlContent}
              onChange={(e) => setXmlContent(e.target.value)}
              className="w-full h-40 border-2 border-cyan-600 rounded-lg bg-[#0f172a] p-2 text-sm font-mono text-cyan-200 resize-none outline-none"
              placeholder="Paste the XML content here..."
            />
          ) : modoDrag ? (
            <div
              {...getXmlRootProps()}
              className="w-full h-auto min-h-[160px] border-2 border-dashed border-cyan-600 bg-[#0f172a] p-4 rounded-lg text-center cursor-pointer hover:bg-cyan-900/10 transition flex flex-col justify-center items-center gap-2"
            >
              <input {...getXmlInputProps()} />
              {fileName ? (
                <div className="w-full bg-[#1e293b] text-cyan-200 p-3 rounded-md border border-cyan-600 shadow-sm space-y-1">
                  <div className="flex justify-between items-center text-sm font-mono">
                    <span className="truncate flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {fileName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-cyan-400">{progress}%</span>
                      <button
                        onClick={() => {
                          setFileName(null);
                          setXmlContent("");
                          setProgress(0);
                        }}
                        className="text-red-400  hover:text-red-600 transition"
                        title="Eliminar archivo"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-cyan-900 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="text-cyan-300 text-sm flex flex-col items-center gap-1">
                  <span className="text-2xl">
                    <UploadCloud className="w-8 h-8 text-cyan-400" />
                  </span>
                  <strong>Drag your XMI file here or click to select</strong>
                  <small className="text-cyan-400 text-xs">Supported formats: .xml</small>
                </div>
              )}
            </div>
          ) : (
            <div className="text-cyan-400 text-sm">Select an option above to continue.</div>
          )}
        </CardContent>
        <CardFooter className="flex items-center">
          {isGenerating ? (
            <div className="text-cyan-400 animate-pulse text-sm w-full text-center">
              Generating UI on pages, please wait...
            </div>
          ) : (
            <>
              <Button
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
                disabled={!xmlContent}
                onClick={handleGenerateXmlToUI}
              >
                Generate XML to UI
              </Button>
              <div className="flex-1"></div>

              <ExportAngularDialog editor={editor} xmlFile={xmlFile ?? undefined} />
            </>
          )}
        </CardFooter>
      </Card>
    </TabsContent>
  );
}

export default XmlToUIComponent;
