"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import createStudioEditor from "@grapesjs/studio-sdk";
import {
  flexComponent,
  rteProseMirror,
  tableComponent,
  swiperComponent,
  accordionComponent,
  listPagesComponent,
  fsLightboxComponent,
  lightGalleryComponent,
} from "@grapesjs/studio-sdk-plugins";
import "@grapesjs/studio-sdk/style";
import type { Editor } from "@grapesjs/studio-sdk/dist/typeConfigs/gjsExtend.js";
import { Socket } from "socket.io-client";
import { generateColorFromString } from "@/utils/generateColorFromString";
import { toast } from "sonner";

type Props = {
  onEditorReady?: (editor: Editor) => void;
  roomId: string;
  userId: string;
  socket: Socket;
};
type CursorPosition = {
  userId: string;
  username: string;
  x: number;
  y: number;
  timestamp: number;
};

declare global {
  interface Window {
    cursorTimeouts: Record<string, ReturnType<typeof setTimeout>>;
  }
}

const StudioEditorComponent = ({ onEditorReady, roomId, userId, socket }: Props) => {
  const [editor, setEditor] = useState<Editor | null>(null);

  const isProcessingRemoteChanges = useRef(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisitedGrapesEditor");

    if (!hasVisited) {
      toast("👋 Welcome to the editor! Here you can design your pages freely..");
      localStorage.setItem("hasVisitedGrapesEditor", "true");
    }

    createStudioEditor({
      root: "#studio-editor",
      licenseKey: `${process.env.NEXT_PUBLIC_GRAPEJS_API_KEY}`, //"c2240ba690d1463fa178fa79c4b4d757e433249c56ec4fb4ac9c0a98ab295070",
      theme: "light",
      customTheme: {
        default: {
          colors: {
            global: {
              text: "#E0E6F0",
              focus: "#3B82F6",
              border: "#334155",
              background1: "#0F172A",
              background2: "#1E293B",
              background3: "#1E293B",
              placeholder: "#64748B",
              backgroundHover: "#1E40AF",
            },
            symbol: {
              text: "#FFFFFF",
              background1: "#3B82F6",
              background2: "#2563EB",
              background3: "#1E3A8A",
            },
            primary: {
              text: "#FFFFFF",
              background1: "#3B82F6",
              background3: "#1E293B",
              backgroundHover: "#2563EB",
            },
            selector: {
              text: "#E0E6F0",
              background1: "#1E40AF",
              background2: "#3B82F6",
            },
            component: {
              text: "#FFFFFF",
              background1: "#1E3A8A",
              background2: "#1D4ED8",
              background3: "#3B82F6",
            },
          },
        },
      },
      project: {
        type: "web",
        id: roomId,
        default: {
          pages: [
            {
              name: "Página Inicial",
              styles: "",
              component: `<section style="padding: 50px; text-align: center; color: white;">
                  <h1 style="font-size: 2.5rem; color: #3B82F6;">👋 Welcome to the editor!</h1>
                  <p style="font-size: 1.2rem;">Empezá a construir tu página con los bloques de la izquierda.</p>
                </section>`,
            },
          ],
        },
      },
      identity: {
        id: userId,
      },
      assets: {
        storageType: "cloud",
      },
      storage: {
        type: "cloud",
        autosaveChanges: 100,
        autosaveIntervalMs: 10000,
      },
      plugins: [
        flexComponent.init({}),
        rteProseMirror.init({}),
        tableComponent.init({}),
        swiperComponent.init({}),
        accordionComponent.init({}),
        listPagesComponent.init({}),
        fsLightboxComponent.init({}),
        lightGalleryComponent.init({}),
      ],
      onEditor(editor: Editor) {
        setEditor(editor);
        onEditorReady?.(editor);
      },
    });
  }, [onEditorReady, roomId, userId]);

  // Colaboracion en tiempo real
  useEffect(() => {
    if (!editor || !socket) return;
    socket.emit("get-initial-state", roomId);
    const handleInitialState = (initialState: unknown) => {
      if (isInitialLoad && initialState) {
        try {
          isProcessingRemoteChanges.current = true;
          editor.loadProjectData(initialState);
          console.log("Estado inicial cargado correctamente");
          setTimeout(() => {
            isProcessingRemoteChanges.current = false;
          }, 500);
        } catch (error) {
          console.error("Error al cargar el estado inicial:", error);
          isProcessingRemoteChanges.current = false;
        }
        setIsInitialLoad(false);
      }
    };

    const handleCursorPosition = (cursorData: CursorPosition) => {
      if (cursorData.userId === userId) return;
      updateRemoteCursor(cursorData);
    };

    socket.on("initial-state", handleInitialState);
    socket.on("cursor-position", handleCursorPosition);
    // Rastrear posición del ratón para cursores colaborativos
    const canvas = editor.Canvas.getElement();

    if (canvas) {
      let throttleTimeout: ReturnType<typeof setTimeout> | null = null;

      canvas.addEventListener("mousemove", (event) => {
        // Throttle para evitar demasiados eventos
        if (throttleTimeout) return;

        throttleTimeout = setTimeout(() => {
          const rect = canvas.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;

          socket.emit("cursor-position", {
            userId,
            username: `Usuario-${userId.substring(0, 5)}`,
            x,
            y,
            timestamp: Date.now(),
          });

          throttleTimeout = null;
        }, 50);
      });
    }
    const setupStateCapture = () => {
      const intervalId = setInterval(() => {
        if (editor && !isProcessingRemoteChanges.current) {
          try {
            const projectState = editor.getProjectData();
            socket.emit("save-project-state", {
              roomId,
              state: projectState,
              timestamp: Date.now(),
            });
          } catch (error) {
            console.error("Error al guardar el estado del proyecto:", error);
          }
        }
      }, 10000);

      return () => clearInterval(intervalId);
    };
    const cleanupStateCapture = setupStateCapture();
    return () => {
      if (editor) {
        if (canvas) {
          canvas.removeEventListener("mousemove", () => {});
        }
      }
      if (socket) {
        socket.off("cursor-position", handleCursorPosition);
      }
      cleanupStateCapture();
    };
  }, [editor, socket, userId, roomId, isInitialLoad]);

  // // Funcion para mostrar los cursores remotos
  const updateRemoteCursor = useCallback(
    (cursorData: CursorPosition) => {
      if (!editor) return;

      const canvas = editor.Canvas.getElement();
      if (!canvas) return;

      let cursorElement = document.getElementById(`cursor-${cursorData.userId}`);

      if (!cursorElement) {
        cursorElement = document.createElement("div");
        cursorElement.id = `cursor-${cursorData.userId}`;
        cursorElement.className = "remote-cursor";

        const userColor = generateColorFromString(cursorData.userId);

        cursorElement.innerHTML = `
          <div class="cursor-pointer" style="border-left-color: ${userColor};"></div>
          <div class="cursor-label" style="background-color: ${userColor};">${cursorData.username}</div>
        `;
        cursorElement.style.position = "absolute";
        cursorElement.style.pointerEvents = "none";
        cursorElement.style.zIndex = "999";
        canvas.appendChild(cursorElement);

        if (!document.getElementById("remote-cursor-styles")) {
          const style = document.createElement("style");
          style.id = "remote-cursor-styles";
          style.textContent = `
            .remote-cursor {
              transition: transform 0.12s ease-out;
              pointer-events: none;
              display: flex;
              align-items: center;
            }
            .cursor-pointer {
              width: 0;
              height: 0;
              border-left: 10px solid;
              border-top: 6px solid transparent;
              border-bottom: 6px solid transparent;
              transform: translate(-50%, -50%) rotate(-20deg);
            }
            .cursor-label {
              color: white;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 12px;
              margin-left: 8px;
              transform: translateY(-50%);
              display: inline-block;
              white-space: nowrap;
              font-weight: 500;
            }
          `;
          document.head.appendChild(style);
        }
      }

      // Actualizar posición del cursor
      cursorElement.style.transform = `translate(${cursorData.x}px, ${cursorData.y}px)`;

      // Auto-eliminar cursor después de inactividad
      if (!window.cursorTimeouts) {
        window.cursorTimeouts = {};
      }

      if (window.cursorTimeouts[cursorData.userId]) {
        clearTimeout(window.cursorTimeouts[cursorData.userId]);
      }

      window.cursorTimeouts[cursorData.userId] = setTimeout(() => {
        if (cursorElement && cursorElement.parentNode) {
          cursorElement.parentNode.removeChild(cursorElement);
        }
      }, 5000);
    },
    [editor]
  );

  return <div id="studio-editor" style={{ width: "100%", height: "100vh" }} />;
};

export default StudioEditorComponent;
