// import { resolve } from "path";

// export async function imageTransformCode(editor: Editor, file: File, projectName = "image-transform-code"):Promise<string> {
//     const base64 = await new Promise<string>((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onload = () => resolve(reader.result as string);
//         reader.onerror = (err) => reject(err);
//         reader.readAsDataURL(file);
//       });

//       // 2. Extraer solo el contenido base64 sin encabezado
//       const base64Content = base64.split(",")[1];
// }
