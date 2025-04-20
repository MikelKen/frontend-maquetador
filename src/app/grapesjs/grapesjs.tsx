"use client";

import { useState } from "react";
import type { Editor } from "grapesjs";
import GrapesJsStudio, { StudioCommands, ToastVariant } from "@grapesjs/studio-sdk/react";

import "@grapesjs/studio-sdk/style";
//import { ExportZipButton } from "./components/export_zip_button";
import useSocket from "../hooks/useSocket";
import Navbar from "./components/Navbar";

function GrapesJs({ shareId }: { shareId: string }) {
  console.log("Editor logged in with shareId", shareId);
  const [editor, setEditor] = useState<Editor>();
  const { socketRef, userName, userColor } = useSocket();
  const [connectedUsers, setConnectedUsers] = useState<{ id: string; name: string; color: string }[]>([]);

  const onReady = (editor: Editor) => {
    console.log("Editor loaded", editor);
    setEditor(editor);

    let lastEmit = 0;
    const interval = 30;
    // Mover componentes
    editor?.on("component:update", () => {
      const data = editor.getProjectData();
      socketRef.current?.emit("update-project", data);
    });

    // Enviar la posicion del curdor
    const onMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastEmit > interval) {
        socketRef.current?.emit("cursor-move", {
          x: e.clientX,
          y: e.clientY,
          userId: socketRef.current?.id,
          userName,
          userColor,
        });
        lastEmit = now;
      }
    };

    window.addEventListener("mousemove", onMouseMove);

    // Escuchar el cursor de otros
    socketRef.current?.on("remote-cursor", ({ x, y, userId, userName, userColor }) => {
      const cursorId = `cursor-${userId}`;
      let cursor = document.getElementById(cursorId);

      if (!cursor) {
        cursor = document.createElement("div");
        cursor.id = cursorId;
        cursor.style.position = "fixed";
        cursor.style.width = "12px";
        cursor.style.height = "12px";
        cursor.style.borderRadius = "50%";
        cursor.style.backgroundColor = "red";
        cursor.style.pointerEvents = "none";
        cursor.style.zIndex = "9999";
        cursor.style.transition = "all 0.05s ease";
        cursor.style.opacity = "0.8";

        cursor.style.backgroundColor = userColor;

        const label = document.createElement("div");
        label.innerText = userName;
        label.style.position = "absolute";
        label.style.top = "-20px";
        label.style.left = "15px";
        label.style.fontSize = "12px";
        label.style.color = userColor;
        label.style.fontWeight = "bold";
        label.style.background = "white";
        label.style.border = `1px solid ${userColor}`;
        label.style.borderRadius = "4px";
        label.style.padding = "2px 4px";

        cursor.appendChild(label);
        document.body.appendChild(cursor);
      }
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;

      // setConnectedUsers((prevUsers) => {
      //   const exists = prevUsers.some((u) => u.id === userId);
      //   if (exists) return prevUsers;
      //   return [...prevUsers, { id: userId, name: userName, color: userColor }];
      // });

      socketRef.current?.on("cursor-remove", (userId) => {
        const cursor = document.getElementById(`cursor-${userId}`);
        if (cursor) cursor.remove();
        setConnectedUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
      });
    });

    socketRef.current?.on("update-users", (users: { id: string; name: string; color: string }[]) => {
      setConnectedUsers(users);
    });

    socketRef.current?.on("update-component", ({ id, content }) => {
      const comp = editor.getWrapper()?.find(`#${id}`)[0];
      if (comp) {
        Object.entries(content).forEach(([key, value]) => {
          comp.set(key, value);
        });
      }
    });
    socketRef.current?.on("sync-project", (data) => {
      console.log("Recibido proyecto sincronizado", data);
      if (editor) editor.loadProjectData(data);
    });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
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
