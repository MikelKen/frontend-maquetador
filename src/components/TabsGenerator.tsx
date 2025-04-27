import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp, ClipboardPaste, UploadCloud, FileText, XCircle } from "lucide-react";
import Image from "next/image";
import type { Editor } from "grapesjs";
import { GenerateXmlToPages } from "../utils/generateXmlToPages";
import ExportAngularDialog from "./ExportAngularDialog";

export function TabsGenerator({ editor }: { editor?: Editor }) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [xmlContent, setXmlContent] = useState<string>("");
  const [modoPegado, setModoPegado] = useState(false);
  const [modoDrag, setModoDrag] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [xmlFile, setXmlFile] = useState<File | null>(null);

  // Imagen dropzone
  const onDropImage = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  }, []);
  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: onDropImage,
  });

  // XML dropzone
  const onDropXml = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setXmlFile(file);
      setFileName(file.name);
      setProgress(0); // Reset progres

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
    let blob: File | undefined;
    if (modoPegado && xmlContent.trim()) {
      blob = new File([xmlContent], "pego-xml.xml", { type: "text/xml" });
    } else if (modoDrag && xmlFile) {
      blob = xmlFile;
    }

    if (blob) {
      await GenerateXmlToPages(blob, editor);
      alert("¡Páginas generadas exitosamente!");
    } else {
      alert("Selecciona o pega un archivo XML válido");
    }
  };

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
          <TabsContent value="imageAI">
            <Card className="bg-[#1e293b] border border-cyan-700 text-cyan-100">
              <CardHeader>
                <CardTitle>Image to UI</CardTitle>
                <CardDescription className="text-cyan-400">
                  Upload or drag an image here to generate UI.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  {...getImageRootProps()}
                  className="w-full h-64 border-2 border-dashed border-cyan-600 bg-[#0f172a] rounded-lg flex items-center justify-center text-center text-sm cursor-pointer hover:bg-cyan-900/20 transition"
                >
                  <input {...getImageInputProps()} />
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Vista previa"
                      width={400}
                      height={600}
                      unoptimized
                      className="max-h-full max-w-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-cyan-300">
                      <UploadCloud className="w-10 h-10 text-cyan-400" />
                      <span className="text-sm">Drag or click to upload image</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" disabled={!imagePreview}>
                  Generate UI
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* XML a UI */}
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
                <Button
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  disabled={!xmlContent}
                  onClick={handleGenerateXmlToUI}
                >
                  Generate XML to UI
                </Button>
                <div className="flex-1"></div>

                <ExportAngularDialog editor={editor} xmlFile={xmlFile ?? undefined} />
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
