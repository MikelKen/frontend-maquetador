"use client";

import { useEffect, useState } from "react";
import type { ComponentDefinition, Editor } from "grapesjs";
import GrapesJsStudio, { StudioCommands, ToastVariant } from "@grapesjs/studio-sdk/react";

import "@grapesjs/studio-sdk/style";
//import { ExportZipButton } from "./components/export_zip_button";
import useSocket from "../hooks/useSocket";
import Navbar from "../../components/Navbar";

interface ComponentUpdatePayload {
  id: string;
  content: ComponentDefinition;
}

interface ConnectedUser {
  id: string;
  name: string;
  color: string;
}

function GrapesJs({ shareId }: { shareId: string }) {
  console.log("Editor logged in with shareId", shareId);
  const [editor, setEditor] = useState<Editor | undefined>();
  const { socketRef, userName, userColor } = useSocket();
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);

  useEffect(() => {
    socketRef.current?.emit("join", { shareId, userName, userColor });
  }, [shareId, socketRef, userName, userColor]);

  // Eventos de socket para grapejs
  const onReady = (editor: Editor) => {
    console.log("Editor loaded", editor);
    setEditor(editor);

    editor.on("component:add", (comp, opts) => {
      if (opts?.origin === "remote") return;

      const parent = comp.parent();
      if (parent && parent.get("status") === "building") return;

      comp.set("status", "building");
      if (!comp.getId()) comp.setId(`comp-${crypto.randomUUID()}`);
      socketRef.current?.emit("add-component", {
        parentId: comp.parent()?.getId() || "", // "" = wrapper
        json: comp.toJSON(),
      });

      comp.set("status", "");
    });

    const send = (comp: any) =>
      socketRef.current?.emit("update-component", {
        id: comp.getId(),
        content: comp.toJSON(),
      } as ComponentUpdatePayload);

    editor.on("component:update", send);
    editor.on("component:input", send);
    // editor.on("component:update:content", send);

    editor.on("component:remove", (comp) => {
      socketRef.current?.emit("remove-component", { id: comp.getId() });
    });

    /*Enviar instancia completa cada vez que se guarda algo */
    editor.on("storage:store", () => {
      socketRef.current?.emit("update-project", editor.getProjectData());
    });

    // Eventos entrantes por WebSocket
    socketRef.current?.on("add-component", ({ parentId, json }) => {
      const id = json.attributes?.id;
      if (id && editor.getWrapper()?.find(`#${id}`)[0]) return;
      const parent = (parentId && editor.getWrapper()?.find(`#${parentId}`)[0]) || editor.getWrapper();
      parent?.append(json, { origin: "remote" });
    });
    socketRef.current?.on("update-component", ({ id, content }) => {
      const target = editor.getWrapper()?.find(`#${id}`)[0];
      if (target) target.set(content);
    });

    socketRef.current?.on("remove-component", ({ id }: { id: string }) => {
      editor.getWrapper()?.find(`#${id}`)[0]?.remove();
    });

    socketRef.current?.on("sync-project", (data) => data && editor.loadProjectData(data));

    socketRef.current?.on("update-users", (users: ConnectedUser[]) => {
      setConnectedUsers(users);
    });
    //  // 👆 Posición del cursor
    //   const onMouseMove = (e: MouseEvent) => {
    //     const now = Date.now();
    //    // if (now - lastEmit > interval) {
    //       socketRef.current?.emit("cursor-move", {
    //         x: e.clientX,
    //         y: e.clientY,
    //         userId: socketRef.current?.id,
    //         userName,
    //         userColor,
    //       });
    //      // lastEmit = now;
    //     }
    //   };

    //   window.addEventListener("mousemove", onMouseMove);

    //   // 👁️ Escuchar cursor remoto
    //   socketRef.current?.on("remote-cursor", ({ x, y, userId, userName, userColor }) => {
    //     const cursorId = `cursor-${userId}`;
    //     let cursor = document.getElementById(cursorId);

    //     if (!cursor) {
    //       cursor = document.createElement("div");
    //       cursor.id = cursorId;
    //       cursor.style.position = "fixed";
    //       cursor.style.width = "12px";
    //       cursor.style.height = "12px";
    //       cursor.style.borderRadius = "50%";
    //       cursor.style.backgroundColor = "red";
    //       cursor.style.pointerEvents = "none";
    //       cursor.style.zIndex = "9999";
    //       cursor.style.transition = "all 0.05s ease";
    //       cursor.style.opacity = "0.8";

    //       cursor.style.backgroundColor = userColor;

    //       const label = document.createElement("div");
    //       label.innerText = userName;
    //       label.style.position = "absolute";
    //       label.style.top = "-20px";
    //       label.style.left = "15px";
    //       label.style.fontSize = "12px";
    //       label.style.color = userColor;
    //       label.style.fontWeight = "bold";
    //       label.style.background = "white";
    //       label.style.border = `1px solid ${userColor}`;
    //       label.style.borderRadius = "4px";
    //       label.style.padding = "2px 4px";

    //       cursor.appendChild(label);
    //       document.body.appendChild(cursor);
    //     }
    //     cursor.style.left = `${x}px`;
    //     cursor.style.top = `${y}px`;
    //   });
    //   // ❌ Cuando un usuario se va, removemos su cursor
    //   socketRef.current?.on("cursor-remove", (userId) => {
    //     const cursor = document.getElementById(`cursor-${userId}`);
    //     if (cursor) cursor.remove();
    //     setConnectedUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
    //   });

    //   // 👥 Lista de usuarios conectados
    //   socketRef.current?.on("update-users", (users: { id: string; name: string; color: string }[]) => {
    //     setConnectedUsers(users);
    //   });

    //   // 🔁 Cambios individuales (actualización de props de componente)
    //   socketRef.current?.on("update-component", ({ id, content }) => {
    //     const comp = editor.getWrapper()?.find(`#${id}`)[0];
    //     if (comp) {
    //       Object.entries(content).forEach(([key, value]) => {
    //         comp.set(key, value);
    //       });
    //     }
    //   });

    //   // 📦 Sincronización total del proyecto
    //   socketRef.current?.on("sync-project", (data) => {
    //     try {
    //       if (editor) {
    //         editor.loadProjectData(data);
    //         editor.runCommand(StudioCommands.toastAdd, {
    //           id: "sync-ok",
    //           headers: "Proyecto actualizado",
    //           content: "Cambios recibidos de otro usuario",
    //           variant: ToastVariant.Info,
    //         });
    //       }
    //     } catch (err) {
    //       console.log("Error al sincronizar proyecto", err);
    //     }
    //   });

    //   return () => {
    //     window.removeEventListener("mousemove", onMouseMove);
    //   };
  };

  const showToast = (id: string) =>
    editor?.runCommand(StudioCommands.toastAdd, {
      id,
      header: "Exportación completada",
      content: "Código Angular generado correctamente",
      variant: ToastVariant.Success,
    });

  const getProjetData = () => {
    if (editor) {
      console.log({ projectData: editor?.getProjectData() });
      showToast("log-project-data");
    }
  };

  const getExportData = () => {
    if (editor) {
      console.log({ html: editor?.getHtml(), css: editor?.getCss() });
      showToast("log-html-css");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Enlace copiado al portapapeles");
  };
  return (
    <main className="flex flex-col h-screen">
      <Navbar onExport={getExportData} onLogData={getProjetData} onShare={handleShare} users={connectedUsers} />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 h-full overflow-hidden">
          <GrapesJsStudio
            onReady={onReady}
            options={{
              licenseKey: "YOUR_LICENSE_KEY",
              project: {
                default: {
                  pages: [
                    {
                      name: "Home",
                      component: `<h1 style="padding: 2rem; text-align: center">Hello Studio 👋</h1>`,
                    },
                  ],
                },
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}

export default GrapesJs;
