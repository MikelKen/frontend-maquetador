import { API_ROUTES } from "@/lib/api.routes";
import type { Editor } from "@grapesjs/studio-sdk/dist/typeConfigs/gjsExtend.js";
import { toast } from "sonner";

export async function GenerateImageToPageGemini(editor: Editor, file: File, projectName = "image-transform-code") {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(API_ROUTES.GEMINI_API.url, {
      method: API_ROUTES.GEMINI_API.method,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const erroData = await response.json();
      throw new Error(erroData.message || "Error generating image to page");
    }

    const htmlText = await response.text();

    const cleanHTML = htmlText
      .replace(/```html/g, "")
      .replace(/```/g, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .trim();

    const newPage = editor.Pages.add({
      name: projectName || "NewPage",
    });

    newPage?.getMainComponent().append(cleanHTML);
    editor.Pages.select(newPage || "home");
  } catch (error) {
    console.error("Error al generar UI desde imagen:", error);
    toast("An error occurred while generating the interface. Check the console.");
  }
}
