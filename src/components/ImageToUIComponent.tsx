import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { UploadCloud } from "lucide-react";
import type { Editor } from "grapesjs";
import { GenerateImageToPage } from "@/utils/generateImageToPageOpenAI";
import { GenerateImageToPageGemini } from "@/utils/generateImageTopageGemini";

function ImageToUIComponent({ editor, onSuccess }: { editor?: Editor; onSuccess?: () => void }) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileImage, setFileImage] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const onDropImage = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileImage(file);
      setImagePreview(url);
    }
  }, []);
  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: onDropImage,
  });

  const handleGenerate = async (source: "Gemini" | "OpenAI") => {
    if (!editor || !fileImage) return;
    setIsGenerating(true);

    try {
      if (source === "Gemini") {
        await GenerateImageToPageGemini(editor, fileImage, "GeneratedByGemini");
      } else {
        await GenerateImageToPage(editor, fileImage, "GeneratedByOpenAI");
      }

      setFileImage(null);
      setImagePreview(null);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error generando UI:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <TabsContent value="imageAI">
      <Card className="bg-[#1e293b] border border-cyan-700 text-cyan-100">
        <CardHeader>
          <CardTitle>Image to UI</CardTitle>
          <CardDescription className="text-cyan-400">Upload or drag an image here to generate UI.</CardDescription>
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
        <CardFooter className="flex justify-between w-full">
          {isGenerating ? (
            <div className="text-cyan-400 animate-pulse text-sm w-full text-center">Generating UI, please wait...</div>
          ) : (
            <>
              <Button
                className="bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer"
                disabled={!imagePreview}
                onClick={() => handleGenerate("Gemini")}
              >
                Generate UI Gemini
              </Button>
              <Button
                variant={"outline"}
                className="border-cyan-600 text-cyan-300 hover:bg-cyan-800 cursor-pointer"
                disabled={!imagePreview}
                onClick={() => handleGenerate("OpenAI")}
              >
                Generate UI Open AI
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </TabsContent>
  );
}

export default ImageToUIComponent;
