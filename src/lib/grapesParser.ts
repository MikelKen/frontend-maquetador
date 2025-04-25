import type { Editor } from "@grapesjs/studio-sdk/dist/typeConfigs/gjsExtend.js";

export function grapesParser(editor: Editor) {
  if (!editor) return null;

  const originalProject = editor.getProjectData();
  const pagesWithCode: Array<{ id: string; name: string; html: string; css: string }> = [];

  for (const page of originalProject.pages) {
    editor.loadProjectData({ ...originalProject, pages: [page] });
    const html = editor.getHtml();
    const css = editor.getCss() || "";
    pagesWithCode.push({ id: page.id, name: page.name, html, css });
  }

  editor.loadProjectData(originalProject);

  return {
    ...originalProject,
    pages: pagesWithCode,
  };
}
