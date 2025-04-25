import JSZip from "jszip";
import * as FileSaver from "file-saver";
import type { Editor } from "@grapesjs/studio-sdk/dist/typeConfigs/gjsExtend.js";

export async function ExportProject(editor: Editor, projectName: string = "export_angular") {
  if (!editor) return;

  const zip = new JSZip();
  const originalProject = editor.getProjectData();

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

  editor.loadProjectData(originalProject);
  const projectWithCode = { ...originalProject, pages: pagesWithCode };
  zip.file(`${projectName}.json`, JSON.stringify(projectWithCode, null, 2));

  const scriptContent = `#!/usr/bin/env ts-node
import { execSync } from 'child_process';
import { copyFileSync, writeFileSync, existsSync } from 'fs';
import { basename, join, resolve } from 'path';

const projectFile = __filename.replace(/\\.ts$/, '.json');

if (!existsSync(projectFile)) {
  console.error("Error: No se encontró el archivo JSON del proyecto:", projectFile);
  process.exit(1);
}

const projectName = basename(projectFile, '.json');
const appName = projectName;

console.log('⚙️  ng new', appName);
execSync(\`npx @angular/cli@19 new \${appName} --routing --style=css --skip-install --defaults\`, { stdio: 'inherit' });

copyFileSync(projectFile, \`\${appName}/grapesjs-project.json\`);

const project = require(resolve(projectFile));

const normalize = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ñ/g, "n").replace(/[^a-z0-9]+/gi, "-");

project.pages.forEach((page: { name: string, html: string, css: string }) => {
  const nameKebab = normalize(page.name.toLowerCase());
  console.log('🚀 Generando componente', nameKebab);
  execSync(\`npx ng generate component pages/\${nameKebab} --flat=false --module=app.module.ts\`, {
    cwd: appName, stdio: 'inherit'
  });

  writeFileSync(join(appName, 'src/app/pages', nameKebab, \`\${nameKebab}.component.html\`), page.html, 'utf-8');
  writeFileSync(join(appName, 'src/app/pages', nameKebab, \`\${nameKebab}.component.css\`), page.css, 'utf-8');
});

// Generar rutas dinámicamente
(() => {
  const imports = project.pages.map((page: { name: string }) => {
    const kebab = normalize(page.name.toLowerCase());
    const className = page.name
      .split(/\\s+/g)
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('') + 'Component';
    return \`import { \${className} } from './pages/\${kebab}/\${kebab}.component';\`;
  }).join('\\n');

  const routes = project.pages.map((page: { name: string }, i: number) => {
    const kebab = normalize(page.name.toLowerCase());
    const className = page.name
      .split(/\\s+/g)
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('') + 'Component';
    const pathStr = i === 0 ? "''" : \`'\${kebab}'\`;
    return \`  { path: \${pathStr}, component: \${className} },\`;
  }).join('\\n');

  const routesFileContent = \`// Este archivo es generado automáticamente
\${imports}

export const routes = [
\${routes}
  { path: '**', redirectTo: '' }
];
\`;

  writeFileSync(join(appName, 'src/app/app.routes.ts'), routesFileContent, 'utf-8');
  console.log('✅ app.routes.ts generado dinámicamente');
})();

// Sobrescribir app.component con router-outlet y menú
(() => {
  const navLinks = project.pages.map((page: { name: string }, i: number) => {
    const kebab = normalize(page.name.toLowerCase());
    const label = page.name;
    const link = i === 0 ? '/' : '/' + kebab;
    return \`<a routerLink="\${link}">\${label}</a>\`;
  }).join(' | ');

  const appCompHtml = \`<nav>\${navLinks}</nav>
<hr/>
<router-outlet></router-outlet>\`;

  const appCompTs = \`
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.component.html',
})
export class AppComponent {}
\`;

  writeFileSync(join(appName, 'src/app/app.component.ts'), appCompTs.trim(), 'utf-8');
  writeFileSync(join(appName, 'src/app/app.component.html'), appCompHtml.trim(), 'utf-8');
  console.log('✅ app.component.html actualizado con <router-outlet>');
})();

// Instalar dependencias
console.log('📦 npm install');
execSync('npm install', { cwd: appName, stdio: 'inherit' });

console.log('🎉 ¡Todo listo! Ahora entra en ' + appName + ' y ejecuta:');
console.log('    npm start');
`;

  zip.file(`${projectName}.ts`, scriptContent, { unixPermissions: "755" });

  const readme = `
# Instrucciones de generación

1. Descomprime este ZIP.
2. Abre terminal en la carpeta resultante.
3. Ejecuta:
   \`\`\`
   ts-node ${projectName}.ts
   \`\`\`
4. Entra en la carpeta creada:
   \`\`\`
   cd ${projectName}
   npm start
   \`\`\`

> **Requisitos**: Node.js, TypeScript (con \`ts-node\`) y conexión a Internet.
`;
  zip.file("README.txt", readme.trim());

  const content = await zip.generateAsync({ type: "blob" });
  FileSaver.saveAs(content, `${projectName}.zip`);
}
