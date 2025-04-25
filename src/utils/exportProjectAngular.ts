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

  const scriptContent = `#!/usr/bin/env node

const { exec } = require("child_process");
const fs = require("fs/promises");
const path = require("path");

const execCmd = (cmd, options = {}) =>
  new Promise((resolve, reject) =>
    exec(cmd, options, (err, stdout, stderr) => (err ? reject(stderr) : resolve(stdout)))
  );

const pascalCase = (str) =>
  str.replace(/[_\\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")).replace(/^./, (c) => c.toUpperCase());

const kebabCase = (str) => str.toLowerCase().replace(/[_\\s]+/g, "-");

async function generateAngularProject(appName) {
  console.log(\`⚙️  Creando proyecto Angular: \${appName}\`);
  await execCmd(\`npx @angular/cli@latest new \${appName} --routing --style=css --skip-install --defaults\`, {
    stdio: "inherit",
  });
}

async function extractPagesFromJson(appName) {
  const jsonFile = \`\${appName}.json\`; 
  const raw = await fs.readFile(jsonFile, "utf8");
  const json = JSON.parse(raw);
  return json.pages || [];
}

function sanitizeName(name) {
  const original = name;
  const sanitized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 _-]/g, "")
    .trim();

  if (original !== sanitized) {
    console.warn(\`⚠️  El nombre "\${original}" fue sanitizado a "\${sanitized}"\`);
  }

  return sanitized;
}

async function createComponentFromPage(appName, page) {
  const sanitized = sanitizeName(page.name);
  const kebab = kebabCase(sanitized);
  const className = pascalCase(sanitized) + "Component";
  const pageDir = path.join(appName, "src/app/pages", kebab);

  await execCmd(\`npx ng generate component pages/\${kebab} --module=app.module.ts\`, { cwd: appName });
  await fs.mkdir(pageDir, { recursive: true });

  const ts = \`
import { Component } from '@angular/core';

@Component({
  selector: 'app-\${kebab}',
  standalone: true,
  templateUrl: './\${kebab}.component.html',
  styleUrls: ['./\${kebab}.component.css']
})
export class \${className} { }
\`.trim();

  await Promise.all([
    fs.writeFile(path.join(pageDir, \`\${kebab}.component.ts\`), ts),
    fs.writeFile(path.join(pageDir, \`\${kebab}.component.html\`), page.html.trim()),
    fs.writeFile(path.join(pageDir, \`\${kebab}.component.css\`), page.css.trim()),
  ]);
}

async function generateRoutes(appName, pages) {
  const routesFile = path.join(appName, "src/app/app.routes.ts");
  const imports = pages
    .map((p) => {
      const sanitized = sanitizeName(p.name);
      const kebab = kebabCase(sanitized);
      const className = pascalCase(sanitized) + "Component";
      return \`import { \${className} } from './pages/\${kebab}/\${kebab}.component';\`;
    })
    .join("\\n");

  const routes = pages
    .map((p, i) => {
      const sanitized = sanitizeName(p.name);
      const kebab = kebabCase(sanitized);
      const className = pascalCase(sanitized) + "Component";
      return \`  { path: \${i === 0 ? \`''\` : \`'\${kebab}'\`}, component: \${className} },\`;
    })
    .join("\\n");

  const fileContent = \`// AUTO-GENERATED FILE
\${imports}

export const routes = [
\${routes}
  { path: '**', redirectTo: '' }
];\`;

  await fs.writeFile(routesFile, fileContent);
}

async function updateAppComponent(appName, pages) {
  const html = \`
  <div class="layout">
    <aside class="sidebar">
      <h2>📁 Navegación</h2>
      <ul>
        \${pages
          .map((p) => {
            const sanitized = sanitizeName(p.name);
            const kebab = kebabCase(sanitized);
            return \`<li><a routerLink="/\${kebab}" routerLinkActive="active">\${p.name}</a></li>\`;
          })
          .join("\\n")}
      </ul>
    </aside>
    <main class="content">
      <router-outlet></router-outlet>
    </main>
  </div>\`.trim();

  const ts = \`
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent { }\`.trim();

  const css = \`
.layout {
  display: flex;
  height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.sidebar {
  width: 260px;
  background: #1f2937;
  color: #fff;
  padding: 20px;
  box-shadow: 2px 0 8px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar h2 {
  margin-top: 0;
  font-size: 1.5rem;
  color: #60a5fa;
  text-align: center;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  margin: 10px 0;
}

.sidebar a {
  display: block;
  padding: 10px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: #cbd5e1;
  transition: background 0.3s, color 0.3s;
}

.sidebar a:hover {
  background: #374151;
  color: #fff;
}

.sidebar a.active {
  background: #3b82f6;
  color: #fff;
}

.content {
  flex: 1;
  background: #f9fafb;
  padding: 40px;
  overflow-y: auto;
}\`.trim();

  await Promise.all([
    fs.writeFile(path.join(appName, "src/app/app.component.html"), html),
    fs.writeFile(path.join(appName, "src/app/app.component.ts"), ts),
    fs.writeFile(path.join(appName, "src/app/app.component.css"), css),
  ]);
}

async function waitForFile(filePath, retries = 10, interval = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      await fs.access(filePath);
      return;
    } catch {
      await new Promise((res) => setTimeout(res, interval));
    }
  }
  throw new Error(\`Timeout esperando el archivo: \${filePath}\`);
}

async function main() {
  const appName = path.basename(__filename, ".js");
  if (!appName) return console.error("❌ Nombre inválido de proyecto.");

  await generateAngularProject(appName);
  const pages = await extractPagesFromJson(appName);

  for (const page of pages) {
    console.log("🛠️  Generando componente para:", page.name);
    await createComponentFromPage(appName, page);
  }

  await generateRoutes(appName, pages);
  await updateAppComponent(appName, pages);

  console.log("⏳ Esperando que se genere package.json...");
  await waitForFile(path.join(appName, "package.json"));

  console.log("📦 Instalando dependencias...");
  await execCmd("npm install", { cwd: appName });

  console.log(\`✅ Proyecto listo. Ejecuta:
cd \${appName} && npm start\`);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
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
