import JSZip from "jszip";
import * as FileSaver from "file-saver";
import type { Editor } from "@grapesjs/studio-sdk/dist/typeConfigs/gjsExtend.js";

export async function ExportProjectAngular(editor: Editor, projectName: string = "export_angular") {
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

  console.log("⚙️  ng new", projectWithCode);

  const scriptContent = `#!/usr/bin/env node
/**
 * generate-from-grapes.js
 * Automatiza la creación de un proyecto Angular v19
 * desde un JSON exportado de GrapesJS.
 */
const { exec } = require("child_process");
const fs = require("fs/promises");
const path = require("path");

// Obtener el nombre del archivo actual sin la extensión .js
const projectName = path.basename(__filename, '.js');  // Usamos __filename para obtener la ruta completa del archivo

if (!projectName) {
  console.error("Error: El nombre del proyecto no puede ser vacío.");
  process.exit(1);  // Salir si no se puede obtener el nombre
}

const appName = \`\${projectName}\`;
console.log('⚙️  ng new', appName);
execSync(\`npx @angular/cli@19 new \${appName} --routing --style=css --skip-install --defaults\`, { stdio: 'inherit' });

fs.copyFileSync(\`\${appName}.json\`, \`\${appName}/grapesjs-project.json\`);

const project = require(path.resolve(\`\${appName}.json\`));
project.pages.forEach(page => {
  const normalize = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ñ/g, "n").replace(/[^a-z0-9]+/gi, "-");

  const nameKebab = normalize(page.name.toLowerCase());
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

(() => {
  const imports = project.pages.map(page => {
    const normalize = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ñ/g, "n").replace(/[^a-z0-9]+/gi, "-");

    const kebab = normalize(page.name.toLowerCase());
    const className = page.name
      .split(/\\s+/g)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join('') + 'Component';
     return \`import { \${className} } from './pages/\${kebab}/\${kebab}.component';\`;
  }).join('\\n');

  const routes = project.pages.map((page, i) => {
  const normalize = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ñ/g, "n").replace(/[^a-z0-9]+/gi, "-");

   const kebab = normalize(page.name.toLowerCase());

    const className = page.name
      .split(/\\s+/g)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join('') + 'Component';
    const pathStr = i === 0 ? "''" : \`'\${kebab}'\`;
    return \`  { path: \${pathStr}, component: \${className} },\`;
  }).join('\\n');

  const routesFileContent = \`// Este archivo es generado automáticamente
\${imports}  // Incluir los imports generados

export const routes = [
\${routes}  // Incluir las rutas generadas
  { path: '**', redirectTo: '' }  // Ruta de fallback
];
\`;

  fs.writeFileSync(
    path.join(appName, 'src/app/app.routes.ts'),
    routesFileContent,
    'utf-8'
  );
  console.log('✅ app.routes.ts generado dinámicamente');
})();

// 4.5) Sobreescribir app.component.html con <router-outlet> y menú
(() => {
  const navLinks = project.pages.map((page, i) => {
  const normalize = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ñ/g, "n").replace(/[^a-z0-9]+/gi, "-");

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
import { RouterModule } from '@angular/router';  // Importamos RouterModule aquí
import { routes } from './app.routes';  // Importa las rutas definidas

@Component({
  selector: 'app-root',
  standalone: true,  // Este es un componente standalone
  imports: [RouterModule],  // Aquí agregamos RouterModule dinámicamente
  templateUrl: './app.component.html',
})
export class AppComponent {}
  \`;

  fs.writeFileSync(
    path.join(appName, 'src/app/app.component.ts'),
    appCompTs,
    'utf-8'
  );

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
  zip.file(`${projectName}.js`, scriptContent, { unixPermissions: "755" });

  const readme = `
# Instrucciones de generación

1. Descomprime este ZIP.
2. Abre terminal en la carpeta resultante.
3. Ejecuta:
   \`\`\`
   node \`\${projectName}.js\`
   \`\`\`
4. Entra en la carpeta creada:
   \`\`\`
   cd \`\${projectName}\`
   npm start
   \`\`\`

> **Requisitos**: Node.js y conexión a Internet.
`;
  zip.file("README.txt", readme.trim());

  const content = await zip.generateAsync({ type: "blob" });
  FileSaver.saveAs(content, `${projectName}.zip`);
}
