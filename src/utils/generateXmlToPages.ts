import { ParseModelXml } from "@/lib/xmlParser";
import type { Editor } from "@grapesjs/studio-sdk/dist/typeConfigs/gjsExtend.js";

export async function GenerateXmlToPages(xmlFile: File, editor: Editor) {
  if (!xmlFile) return;

  const xmlText = await xmlFile.text();
  const clases = await ParseModelXml(xmlText);

  if (!clases || clases.length === 0) {
    console.error("No se encontraron clases en el XML");
    return;
  }

  for (const cls of clases) {
    const pageName = cls.name || "NuevaPagina";

    // 1. Crear la estructura dinámica
    const formFields = cls.attribute
      .map(
        (attr) => `
      <div style="flex: 1; min-width: 150px;">
        <label style="display: block; margin-bottom: 4px;">${attr.name}</label>
        <input type="text" placeholder="Ingrese ${attr.name}" style="width: 100%; padding: 8px; font-size: 14px;"/>
      </div>
    `
      )
      .join("");

    const tableHeaders = cls.attribute
      .map(
        (attr) => `
      <th style="padding: 12px; border: 1px solid #ddd;"><div>${attr.name}</div></th>
    `
      )
      .join("");

    const tableRow = cls.attribute
      .map(
        (attr) => `
      <td style="padding: 12px; border: 1px solid #ddd;"><div>${attr.name} dato</div></td>
    `
      )
      .join("");

    const componentHTML = `
      <div style="padding: 24px; font-family: Arial, sans-serif; max-width: 1200px; margin: auto; background-color: #f9fafb; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="margin-bottom: 24px; font-size: 26px; font-weight: 600; color: #111827;">
          <span>${cls.name}</span>
        </h2>
    
        <form style="margin-bottom: 32px; display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end;">
          ${formFields}
          <button type="submit" style="padding: 10px 20px; font-size: 14px; font-weight: 500; color: white; background-color: #4f46e5; border: none; border-radius: 8px; cursor: pointer;">
            <span>Guardar</span>
          </button>
        </form>
    
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <input type="text" placeholder="Buscar..." style="flex: 1; padding: 10px; font-size: 14px; border: 1px solid #d1d5db; border-radius: 8px; background-color: #fff; margin-right: 10px;"/>
          <button style="padding: 10px 20px; font-size: 14px; font-weight: 500; color: white; background-color: #4f46e5; border: none; border-radius: 8px; cursor: pointer;">
            <span>Buscar</span>
          </button>
        </div>
    
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; background-color: #fff; border-radius: 12px; overflow: hidden;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              ${tableHeaders}
              <th style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: 600; color: #374151;"><div>Acciones</div></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              ${tableRow}
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                <div style="display: flex; gap: 8px; justify-content: center;">
                  <button style="padding: 6px 12px; font-size: 12px; font-weight: 500; color: white; background-color: #10b981; border: none; border-radius: 6px; cursor: pointer;"> <span>Editar</span> </button>
                  <button style="padding: 6px 12px; font-size: 12px; font-weight: 500; color: white; background-color: #ef4444; border: none; border-radius: 6px; cursor: pointer;"> <span>Eliminar</span> </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    const newPage = editor.Pages.add({
      name: pageName || "NewPage",
      component: componentHTML,
    });

    if (!newPage) {
      console.error("No se pudo crear la página en GrapesJS:", pageName);
    }
  }
}
