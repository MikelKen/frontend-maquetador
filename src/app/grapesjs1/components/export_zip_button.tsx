"use client";

import { Editor } from "@grapesjs/studio-sdk/dist/typeConfigs/gjsExtend.js";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { useCallback } from "react";

export function ExportZipButton({ editor }: { editor?: Editor }) {
  const exportZip = useCallback(async () => {
    if (!editor) return;

    const zip = new JSZip();

    // 1) Extraemos el proyecto completo original
    const originalProject = editor.getProjectData();

    // 2) Por cada página, recargamos SOLO esa página y extraemos su HTML/CSS
    const pagesWithCode: Array<{
      id: string;
      name: string;
      html: string;
      css: string;
    }> = [];
    for (const page of originalProject.pages) {
      editor.loadProjectData({ ...originalProject, pages: [page] });
      const html = editor.getHtml();
      const css = editor.getCss() || "";
      pagesWithCode.push({ id: page.id, name: page.name, html, css });
    }

    // 3) Restauramos el proyecto completo en el editor
    editor.loadProjectData(originalProject);

    // 4) Preparamos el JSON que incluirá html+css por página
    const projectWithCode = { ...originalProject, pages: pagesWithCode };
    zip.file("grapesjs-project.json", JSON.stringify(projectWithCode, null, 2));

    // 5) Script de generación (generate-from-grapes.js)
    const scriptContent = `#!/usr/bin/env node
/**
 * generate-from-grapes.js
 * Automatiza la creación de un proyecto Angular v19
 * desde un JSON exportado de GrapesJS.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1) Crear proyecto base sin analytics ni prompts
const appName = 'grapesjs-angular-app';
console.log('⚙️  ng new', appName);
execSync(\`npx @angular/cli@19 new \${appName} --routing --style=css --skip-install --defaults\`, { stdio: 'inherit' });

// 2) Copiar JSON dentro
fs.copyFileSync('grapesjs-project.json', \`\${appName}/grapesjs-project.json\`);

// 3) Generar componentes y volcar HTML/CSS
const project = require(path.resolve('grapesjs-project.json'));
project.pages.forEach(page => {
  const nameKebab = page.name.toLowerCase().replace(/\\s+/g, '-');
  console.log('🚀 Generando componente', nameKebab);
  execSync(\`npx ng generate component pages/\${nameKebab} --flat=false --module=app.module.ts\`, {
    cwd: appName, stdio: 'inherit'
  });
  fs.writeFileSync(
    path.join(appName, 'src/app/pages', nameKebab, \`\${nameKebab}.component.html\`),
    page.html,
    'utf-8'
  );
  fs.writeFileSync(
    path.join(appName, 'src/app/pages', nameKebab, \`\${nameKebab}.component.css\`),
    page.css,
    'utf-8'
  );
});

// 4) Generar dinámicamente el AppRoutingModule
(() => {
  const imports = project.pages.map(page => {
    const kebab = page.name.toLowerCase().replace(/\\s+/g, '-');
    const className = page.name
      .split(/\\s+/g)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join('') + 'Component';
    return \`import { \${className} } from './pages/\${kebab}/\${kebab}.component';\`;
  }).join('\\n');

  const routes = project.pages.map((page, i) => {
    const kebab = page.name.toLowerCase().replace(/\\s+/g, '-');
    const className = page.name
      .split(/\\s+/g)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join('') + 'Component';
    const pathStr = i === 0 ? "''" : \`'\${kebab}'\`;
    return \`  { path: \${pathStr}, component: \${className} },\`;
  }).join('\\n');

  const routingModule = \`import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
\${imports}

const routes: Routes = [
\${routes}
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}\`;

  fs.writeFileSync(
    path.join(appName, 'src/app/app-routing.module.ts'),
    routingModule,
    'utf-8'
  );
  console.log('✅ app-routing.module.ts generado dinámicamente');
})();

// 4.5) Sobreescribir app.component.html con <router-outlet> y menú
(() => {
  const navLinks = project.pages.map((page, i) => {
    const kebab = page.name.toLowerCase().replace(/\\s+/g, '-');
    const label = page.name;
    const link = i === 0 ? '/' : '/' + kebab;
    return \`<a routerLink="\${link}">\${label}</a>\`;
  }).join(' | ');

  const appCompHtml = \`<nav>\${navLinks}</nav>
<hr/>
<router-outlet></router-outlet>\`;

  fs.writeFileSync(
    path.join(appName, 'src/app/app.component.html'),
    appCompHtml,
    'utf-8'
  );
  console.log('✅ app.component.html actualizado con <router-outlet>');
})();

// 5) Instalar dependencias
console.log('📦 npm install');
execSync('npm install', { cwd: appName, stdio: 'inherit' });

console.log('🎉 ¡Todo listo! Ahora entra en ' + appName + ' y ejecuta:');
console.log('    npm start');
`;
    zip.file("generate-from-grapes.js", scriptContent, { unixPermissions: "755" });

    // 6) README.txt
    const readme = `
# Instrucciones de generación

1. Descomprime este ZIP.
2. Abre terminal en la carpeta resultante.
3. Ejecuta:
   \`\`\`
   node generate-from-grapes.js
   \`\`\`
4. Entra en la carpeta creada:
   \`\`\`
   cd grapesjs-angular-app
   npm start
   \`\`\`
5. Abre http://localhost:4200.

> **Requisitos**: Node.js y conexión a Internet.
`;
    zip.file("README.txt", readme.trim());

    // 7) Descarga el ZIP
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "grapesjs-angular-bootstrap.zip");
  }, [editor]);

  return (
    <button onClick={exportZip} className="px-4 py-2 bg-teal-600 text-white rounded">
      Exportar ZIP con proyecto Angular
    </button>
  );
}
