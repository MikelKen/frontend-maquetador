"use client";

import { useEffect, useRef, useState } from "react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import presetWebpage from "grapesjs-preset-webpage";
import { io, Socket } from "socket.io-client";

export default function GrapesEditor() {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [clientId, setClientId] = useState<string>("");

  useEffect(() => {
    const socket = io("http://localhost:4000"); // Cambia si tu backend está en otro host o puerto
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 Conectado al servidor con ID:", socket.id);
      setClientId(socket.id);
    });

    if (!editorRef.current) return;

    const editor = grapesjs.init({
      container: editorRef.current,
      height: "100vh",
      fromElement: false,
      storageManager: false,
      plugins: [presetWebpage],
      pluginsOpts: {
        [presetWebpage as string]: {
          blockCategories: true,
        },
      },
      blockManager: {
        appendTo: "#blocks",
      },
      styleManager: {
        appendTo: "#styles",
      },
    });

    // 🧩 Componente personalizado
    editor.Components.addType("mi-componente", {
      model: {
        defaults: {
          tagName: "div",
          attributes: { class: "mi-componente" },
          components: "¡Hola, soy un componente personalizado!",
          styles: `
            .mi-componente {
              padding: 20px;
              background-color: #e0f7fa;
              border: 2px dashed #00796b;
              text-align: center;
              font-size: 18px;
              color: #004d40;
            }
          `,
          traits: [
            {
              type: "text",
              label: "Texto",
              name: "text",
              changeProp: true,
            },
          ],
        },
        init() {
          this.on("change:text", () => {
            this.set("content", this.get("text"));
          });
        },
      },
    });

    // Bloque visible
    editor.BlockManager.add("bloque-mi-componente", {
      label: "Componente Personalizado",
      category: "Custom",
      content: { type: "mi-componente" },
    });

    // 🔁 Emitir eventos
    editor.on("component:add component:update component:remove", (model) => {
      const socket = socketRef.current;
      if (!socket || !clientId) return;

      const data = model.toJSON();
      socket.emit("editor-update", {
        id: model.get("id"),
        json: data,
        action: model._removed ? "remove" : "update",
        sender: socket.id,
      });
    });

    // 📥 Recibir eventos
    socket.on("remote-update", ({ action, json, sender }) => {
      if (sender === socketRef.current?.id) return;

      if (action === "update") {
        const found = editor.getWrapper().find(`#${json.id}`)[0];
        if (found) {
          found.set(json);
        } else {
          editor.addComponents(json);
        }
      }

      if (action === "remove") {
        const found = editor.getWrapper().find(`#${json.id}`)[0];
        found?.remove();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [clientId]);

  return (
    <div className="flex w-full h-screen">
      {/* Panel izquierdo de bloques */}
      <div id="blocks" className="w-1/5 p-4 bg-gray-100 overflow-auto border-r"></div>

      {/* Área central del editor */}
      <div ref={editorRef} className="flex-1 bg-white"></div>

      {/* Panel derecho de estilos */}
      <div id="styles" className="w-1/5 p-4 bg-gray-50 overflow-auto border-l"></div>
    </div>
  );
}
