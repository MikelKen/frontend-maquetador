"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentDefinition, Editor, Component, DomComponents } from "grapesjs";
import GrapesJsStudio, { StudioCommands, ToastVariant } from "@grapesjs/studio-sdk/react";

import "@grapesjs/studio-sdk/style";
//import { ExportZipButton } from "./components/export_zip_button";
import useSocket from "../hooks/useSocket";
import Navbar from "../../components/Navbar";
import debounce from "@grapesjs/studio-sdk/dist/utils/debounce.js";

type ComponentJSON = ReturnType<Component["toJSON"]>;
type AddOptions = DomComponents.AddOptions;
type UpdateOptions = DomComponents.UpdateOptions;
type RemoveOptions = DomComponents.RemoveOptions;

interface AddComponentMsg {
  id: string;
  json: ComponentJSON;
}
interface UpdateComponentMsg {
  id: string;
  json: ComponentJSON;
}
interface RemoveComponentMsg {
  id: string;
}
interface CursosMoveMsg {
  id: string;
  x: number;
  y: number;
  color: string;
}
interface GrapesJs {
  shareId: string;
}

function GrapesJs({ shareId }: { shareId: string }) {
  console.log("Editor logged in with shareId", shareId);
  const [editor, setEditor] = useState<Editor>();
  const { socketRef, userName, userColor } = useSocket();
  // const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);

  const sendProjectDebounced = useRef(
    debounce(() => {
      if (editor) {
        socketRef.current?.emit("update-project", editor.getProjectData());
      }
    }, 500)
  ).current;

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    socketRef.current?.emit("join", { shareId, userName, userColor });

    socketRef.current?.on("sync-project", (proj) => {
      if (proj && editor) editor.loadProjectData(proj);
    });

    /* ---------- REMOTE EVENTS ---------- */
    socketRef.current?.on("add-component", ({ json }: AddComponentMsg) => {
      const wrapper = editor?.getWrapper();
      if (!wrapper) return;
      wrapper.append(json as ComponentDefinition, { skipSync: true } satisfies DomComponents.AddOptions);
    });

    socketRef.current?.on("update-component", ({ id, json }: UpdateComponentMsg) => {
      editor?.getComponentById(id)?.set(json, { skipSync: true } satisfies UpdateOptions);
    });

    socketRef.current?.on("remove-component", ({ id }: RemoveComponentMsg) => {
      editor?.getComponentById(id)?.remove({ skipSync: true } satisfies RemoveOptions);
    });

    socket.on("remote-cursor", (cursor: CursosMoveMsg) => {});

    return () => {
      socket.off("sync-project");
      socket.off("add-component");
      socket.off("update-component");
      socket.off("remove-component");
      socket.off("remote-cursor");
    }; // limpiar todos
  }, [editor, shareId, userName, userColor, socketRef]);

  const onReady = (ed: Editor) => {
    setEditor(ed);

    ed.on("component:add", (comp) => {
      if (!comp.getId()) comp.setId(`comp-${crypto.randomUUID()}`);
    });

    const emitAdd = (comp: Component, opts?: AddOptions) => {
      if (opts?.skipSync) return;
      socketRef.current?.emit("add-component", {
        id: comp.getId(),
        json: comp.toJSON(),
      } as AddComponentMsg);
      sendProjectDebounced();
    };

    const emitUpdate = (comp: Component, opts?: UpdateOptions) => {
      if (opts?.skipSync) return;
      socketRef.current?.emit("update-component", {
        id: comp.getId(),
        json: comp.toJSON(),
      } as UpdateComponentMsg);
      sendProjectDebounced();
    };

    const emitRemove = (comp: Component, opts?: RemoveOptions) => {
      if (opts?.skipSync) return;
      socketRef.current?.emit("remove-component", { id: comp.getId() } as RemoveComponentMsg);
      sendProjectDebounced();
    };
    ed.on("component:add", emitAdd);
    ed.on("component:update", emitUpdate);
    ed.on("component:remove", emitRemove);
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
      <Navbar onExport={getExportData} onLogData={getProjetData} onShare={handleShare} users={[]} />
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
