import type { Editor } from "@grapesjs/studio-sdk/dist/typeConfigs/gjsExtend.js";

export async function GenerateImageToPageGemini(
  editor: Editor,
  file: File,
  projectName = "image-transform-code"
): Promise<string> {
  const imageBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const prompt = `You are a frontend developer and I will give you a screenshot of a user interface. Your task is to generate a clean HTML layout with inline CSS that can be directly used in GrapesJS.

  Important constraints:
  Do NOT include <html>, <head>, or <body> tags. Wrap everything in a single <div> as the root.
  Use only plain HTML and inline CSS. Do not use Tailwind, Bootstrap, or external styles.
  Use semantic tags where appropriate: <form>, <input>, <button>, <textarea>, <table>, etc.
  Make every part of the layout editable in GrapesJS. This means:
  Avoid content inside <td> or <th> that is plain static text.
  Wrap table cell content in <div> or <span> inside each <td> or <th>, so they can be edited individually.
  Use flexbox for layout when needed.
  Avoid JavaScript.
  The code must be simple, readable, and directly usable in GrapesJS Studio.
  
  Your output must be:
  
  \`\`\`html
  <!-- Just the HTML code inside a <div>, ready to paste in GrapesJS -->`;

  const response = await fetch("/api/generate-gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageBase64,
      prompt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error GeminiAI: ${error}`);
  }
  const data = await response.json();

  const htmlCode: string = data?.choices?.[0]?.message?.content ?? "";
  const blockHtml = htmlCode.match(/```html([\\s\\S]*?)```/i);
  const html = (blockHtml ? blockHtml[1] : htmlCode).trim();

  const newPage = editor.Pages.add({
    name: projectName || "NewPage",
    component: html,
  });

  editor.Pages.select(newPage || "home");
  return html;
}
