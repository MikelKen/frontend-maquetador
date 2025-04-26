"use client";

import { useEffect, useState, useRef } from "react";
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
import { socketService } from "./socket-service";
import { Socket } from "socket.io-client";
import type { Component } from "grapesjs";

type Props = {
  onEditorReady?: (editor: Editor) => void;
  roomId: string; // Unique ID for the collaborative session
  userId: string; // Current user's ID
};

// Tipos mejorados para los eventos
type ComponentChange = {
  type: "add" | "remove" | "update" | "style" | "select" | "move";
  id: string;
  userId: string;
  timestamp: number;
  data: any;
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
    cursorUpdateTimeout?: ReturnType<typeof setTimeout>;
    cursorTimeouts?: Record<string, ReturnType<typeof setTimeout>>;
  }
}

const StudioEditorComponent = ({ onEditorReady, roomId, userId }: Props) => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const lastChangeRef = useRef<{ [key: string]: number }>({});
  const isProcessingRemoteChanges = useRef(false);
  const pendingChanges = useRef<ComponentChange[]>([]);

  // Inicializar la conexión Socket.IO
  useEffect(() => {
    if (!roomId || !userId) return;

    const socket = socketService.connect(roomId, userId);
    setSocket(socket);

    return () => {
      socketService.disconnect();
    };
  }, [roomId, userId]);

  // Inicializar el editor
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisitedGrapesEditor");
    if (!hasVisited) {
      alert("👋 ¡Bienvenido/a al editor colaborativo! Ahora puedes diseñar en tiempo real con otros usuarios.");
      localStorage.setItem("hasVisitedGrapesEditor", "true");
    }
    createStudioEditor({
      root: "#studio-editor",
      licenseKey: "c2240ba690d1463fa178fa79c4b4d757e433249c56ec4fb4ac9c0a98ab295070",
      theme: "light",
      customTheme: {
        // Tus ajustes de tema
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
            // Resto de tu tema
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
                <h1 style="font-size: 2.5rem; color: #3B82F6;">👋 Editor Colaborativo</h1>
                <p style="font-size: 1.2rem;">Diseña en tiempo real con tu equipo, como en Figma o Excalidraw.</p>
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
        autosaveIntervalMs: 30000,
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

    return () => {
      // Limpieza si es necesario
    };
  }, [onEditorReady, roomId, userId]);

  // Configurar colaboración en tiempo real una vez que el editor y el socket estén listos
  // useEffect(() => {
  //   if (!editor || !socket) return;

  //   // Solicitar el estado inicial al unirse
  //   socket.emit("get-initial-state", roomId);

  //   // Escuchar el estado inicial del servidor
  //   socket.on("initial-state", (initialState) => {
  //     if (isInitialLoad && initialState) {
  //       try {
  //         // Desactivar eventos temporalmente para evitar bucles
  //         isProcessingRemoteChanges.current = true;

  //         editor.loadProjectData(initialState);
  //         console.log("Estado inicial cargado correctamente");

  //         // Habilitar los eventos nuevamente
  //         setTimeout(() => {
  //           isProcessingRemoteChanges.current = false;
  //           // Procesar cambios pendientes si hay
  //           processPendingChanges();
  //         }, 500);
  //       } catch (error) {
  //         console.error("Error al cargar el estado inicial:", error);
  //         isProcessingRemoteChanges.current = false;
  //       }
  //       setIsInitialLoad(false);
  //     }
  //   });

  //   // Escuchar los cambios de componentes de otros usuarios
  //   socket.on("component-change", (change: ComponentChange) => {
  //     if (change.userId === userId) return; // Ignorar cambios propios

  //     // Verificar si este cambio ya se ha procesado o es más antiguo que el último cambio conocido
  //     const lastChangeTime = lastChangeRef.current[`${change.type}-${change.id}`] || 0;
  //     if (change.timestamp <= lastChangeTime) {
  //       console.log("Ignorando cambio obsoleto o duplicado");
  //       return;
  //     }

  //     // Actualizar el timestamp del último cambio para este componente
  //     lastChangeRef.current[`${change.type}-${change.id}`] = change.timestamp;

  //     // Si estamos procesando cambios remotos, encolar este cambio
  //     if (isProcessingRemoteChanges.current) {
  //       pendingChanges.current.push(change);
  //       return;
  //     }

  //     applyComponentChange(change);
  //   });

  //   // Escuchar posiciones de cursor de otros usuarios
  //   socket.on("cursor-position", (cursorData: CursorPosition) => {
  //     if (cursorData.userId === userId) return; // Ignorar cursor propio

  //     updateRemoteCursor(cursorData);
  //   });

  //   // Función para procesar cambios pendientes
  //   const processPendingChanges = () => {
  //     if (pendingChanges.current.length > 0) {
  //       console.log(`Procesando ${pendingChanges.current.length} cambios pendientes`);

  //       // Ordenar por timestamp para aplicar en orden cronológico
  //       pendingChanges.current.sort((a, b) => a.timestamp - b.timestamp);

  //       // Aplicar cambios pendientes
  //       pendingChanges.current.forEach((change) => {
  //         applyComponentChange(change);
  //       });

  //       // Limpiar cambios pendientes
  //       pendingChanges.current = [];
  //     }
  //   };

  //   // Función para aplicar un cambio de componente
  //   const applyComponentChange = (change: ComponentChange) => {
  //     try {
  //       isProcessingRemoteChanges.current = true;

  //       const componentsManager = editor.Components;
  //       const component = change.id ? componentsManager.getById(change.id) : null;

  //       switch (change.type) {
  //         case "add":
  //           if (change.data.parent) {
  //             const parentComponent = componentsManager.getById(change.data.parent);
  //             if (parentComponent) {
  //               // Evitar duplicación verificando si ya existe un componente similar
  //               const existingComponent =
  //                 parentComponent.find(
  //                   `[data-gjs-type="${change.data.type}"][data-remote-id="${change.data.remoteId}"]`
  //                 ).length > 0;
  //               if (!existingComponent) {
  //                 const added = componentsManager.addComponent(change.data.html, {
  //                   at: change.data.index || 0,
  //                   ...change.data.options,
  //                 });
  //                 const newComponent = Array.isArray(added) ? added[0] : added;
  //                 if (newComponent) {
  //                   // Marcar componente como remoto para evitar bucles
  //                   newComponent.set("attributes", {
  //                     ...newComponent.get("attributes"),
  //                     "data-remote-id": change.data.remoteId,
  //                   });
  //                 }
  //               }
  //             }
  //           } else {
  //             // Añadir a la raíz si no hay padre
  //             componentsManager.addComponent(change.data.html);
  //           }
  //           break;

  //         case "remove":
  //           if (component) {
  //             // Desactivar eventos temporalmente al eliminar
  //             component.remove({ silent: true });
  //           }
  //           break;

  //         case "update":
  //           if (component) {
  //             // Actualizar atributos si es necesario
  //             if (change.data.attributes) {
  //               component.setAttributes(change.data.attributes);
  //             }

  //             // Actualizar contenido si se proporciona
  //             if (change.data.content !== undefined) {
  //               component.set("content", change.data.content);
  //             }

  //             // Actualizar estilo si se proporciona
  //             if (change.data.style) {
  //               component.setStyle(change.data.style);
  //             }
  //           }
  //           break;

  //         case "move":
  //           if (component && change.data.parent) {
  //             const newParent = componentsManager.getById(change.data.parent);
  //             if (newParent) {
  //               // Mover el componente al nuevo padre en la posición indicada
  //               component.move(newParent, { at: change.data.index || 0 });
  //             }
  //           }
  //           break;
  //       }

  //       // Restaurar el procesamiento de eventos después de un breve retraso
  //       setTimeout(() => {
  //         isProcessingRemoteChanges.current = false;
  //         processPendingChanges(); // Procesar cualquier cambio pendiente
  //       }, 100);
  //     } catch (error) {
  //       console.error("Error al aplicar cambio remoto:", error);
  //       isProcessingRemoteChanges.current = false;
  //     }
  //   };

  //   // Configurar oyentes de eventos en el editor para transmitir cambios
  //   const setupEditorListeners = () => {
  //     // Componente añadido
  //     editor.on("component:add", (component) => {
  //       if (component && !component.opt.temporary && !isProcessingRemoteChanges.current) {
  //         // Generar un ID remoto único para este componente
  //         const remoteId = `${userId}-${Date.now()}`;

  //         // Marcar el componente con el ID remoto
  //         component.set("attributes", {
  //           ...component.getAttributes(),
  //           "data-remote-id": remoteId,
  //         });

  //         const timestamp = Date.now();
  //         lastChangeRef.current[`add-${component.getId()}`] = timestamp;

  //         socket.emit("component-change", {
  //           type: "add",
  //           id: component.getId(),
  //           timestamp,
  //           userId,
  //           data: {
  //             parent: component.parent()?.getId(),
  //             index: component.index(),
  //             html: component.toHTML(),
  //             type: component.get("type"),
  //             remoteId,
  //             options: {
  //               // Opciones adicionales para la creación
  //             },
  //           },
  //         });
  //       }
  //     });

  //     // Componente eliminado
  //     editor.on("component:remove", (component) => {
  //       if (component && !isProcessingRemoteChanges.current) {
  //         const timestamp = Date.now();
  //         lastChangeRef.current[`remove-${component.getId()}`] = timestamp;

  //         socket.emit("component-change", {
  //           type: "remove",
  //           id: component.getId(),
  //           timestamp,
  //           userId,
  //           data: {},
  //         });
  //       }
  //     });

  //     // Componente actualizado (contenido/atributos)
  //     editor.on("component:update", (component) => {
  //       if (component && !isProcessingRemoteChanges.current) {
  //         const timestamp = Date.now();
  //         lastChangeRef.current[`update-${component.getId()}`] = timestamp;

  //         socket.emit("component-change", {
  //           type: "update",
  //           id: component.getId(),
  //           timestamp,
  //           userId,
  //           data: {
  //             attributes: component.getAttributes(),
  //             content: component.get("content"),
  //           },
  //         });
  //       }
  //     });

  //     // Cambios de estilo
  //     editor.on("component:styleUpdate", (component) => {
  //       if (component && !isProcessingRemoteChanges.current) {
  //         const timestamp = Date.now();
  //         lastChangeRef.current[`style-${component.getId()}`] = timestamp;

  //         socket.emit("component-change", {
  //           type: "update",
  //           id: component.getId(),
  //           timestamp,
  //           userId,
  //           data: {
  //             style: component.getStyle(),
  //           },
  //         });
  //       }
  //     });

  //     // Movimiento de componentes
  //     editor.on("component:move", (component) => {
  //       if (component && !isProcessingRemoteChanges.current) {
  //         const timestamp = Date.now();
  //         lastChangeRef.current[`move-${component.getId()}`] = timestamp;

  //         socket.emit("component-change", {
  //           type: "move",
  //           id: component.getId(),
  //           timestamp,
  //           userId,
  //           data: {
  //             parent: component.parent()?.getId(),
  //             index: component.index(),
  //           },
  //         });
  //       }
  //     });

  //     // Rastrear posición del ratón para cursores colaborativos
  //     const canvas = editor.Canvas.getElement();
  //     if (canvas) {
  //       let throttleTimeout: ReturnType<typeof setTimeout> | null = null;

  //       canvas.addEventListener("mousemove", (event) => {
  //         // Throttle para evitar demasiados eventos
  //         if (throttleTimeout) return;

  //         throttleTimeout = setTimeout(() => {
  //           const rect = canvas.getBoundingClientRect();
  //           const x = event.clientX - rect.left;
  //           const y = event.clientY - rect.top;

  //           socket.emit("cursor-position", {
  //             userId,
  //             username: `Usuario-${userId.substring(0, 5)}`,
  //             x,
  //             y,
  //             timestamp: Date.now(),
  //           });

  //           throttleTimeout = null;
  //         }, 50);
  //       });
  //     }
  //   };

  //   // Configurar captura periódica del estado completo
  //   const setupStateCapture = () => {
  //     // Cada 10 segundos, guardar el estado completo del proyecto
  //     const intervalId = setInterval(() => {
  //       if (editor && !isProcessingRemoteChanges.current) {
  //         try {
  //           const projectState = editor.getProjectData();
  //           socket.emit("save-project-state", {
  //             roomId,
  //             state: projectState,
  //             timestamp: Date.now(),
  //           });
  //         } catch (error) {
  //           console.error("Error al guardar el estado del proyecto:", error);
  //         }
  //       }
  //     }, 10000);

  //     return () => clearInterval(intervalId);
  //   };

  //   setupEditorListeners();
  //   const cleanupStateCapture = setupStateCapture();

  //   return () => {
  //     // Limpiar oyentes de eventos cuando se desmonta el componente
  //     if (editor) {
  //       editor.off("component:add");
  //       editor.off("component:remove");
  //       editor.off("component:update");
  //       editor.off("component:styleUpdate");
  //       editor.off("component:move");

  //       const canvas = editor.Canvas.getElement();
  //       if (canvas) {
  //         canvas.removeEventListener("mousemove", () => {});
  //       }
  //     }

  //     if (socket) {
  //       socket.off("component-change");
  //       socket.off("cursor-position");
  //       socket.off("initial-state");
  //     }

  //     cleanupStateCapture();
  //   };
  // }, [editor, socket, userId, roomId, isInitialLoad]);
  useEffect(() => {
    if (!editor || !socket) return;

    socket.emit("get-initial-state", roomId);

    const handleInitialState = (initialState: any) => {
      if (isInitialLoad && initialState) {
        try {
          isProcessingRemoteChanges.current = true;
          editor.loadProjectData(initialState);
          console.log("Estado inicial cargado correctamente");
          setTimeout(() => {
            isProcessingRemoteChanges.current = false;
            processPendingChanges();
          }, 500);
        } catch (error) {
          console.error("Error al cargar el estado inicial:", error);
          isProcessingRemoteChanges.current = false;
        }
        setIsInitialLoad(false);
      }
    };

    const handleComponentChange = (change: ComponentChange) => {
      if (change.userId === userId) return;
      const lastChangeTime = lastChangeRef.current[`${change.type}-${change.id}`] || 0;
      if (change.timestamp <= lastChangeTime) {
        console.log("Ignorando cambio obsoleto o duplicado");
        return;
      }

      lastChangeRef.current[`${change.type}-${change.id}`] = change.timestamp;

      if (isProcessingRemoteChanges.current) {
        pendingChanges.current.push(change);
        return;
      }

      applyComponentChange(change);
    };

    const handleCursorPosition = (cursorData: CursorPosition) => {
      if (cursorData.userId === userId) return;
      updateRemoteCursor(cursorData);
    };

    socket.on("initial-state", handleInitialState);
    socket.on("component-change", handleComponentChange);
    socket.on("cursor-position", handleCursorPosition);

    const processPendingChanges = () => {
      if (pendingChanges.current.length > 0) {
        pendingChanges.current.sort((a, b) => a.timestamp - b.timestamp);
        pendingChanges.current.forEach((change) => {
          applyComponentChange(change);
        });
        pendingChanges.current = [];
      }
    };

    const applyComponentChange = (change: ComponentChange) => {
      try {
        isProcessingRemoteChanges.current = true;

        const componentsManager = editor.Components;
        const component = change.id ? componentsManager.getById(change.id) : null;

        switch (change.type) {
          case "add":
            if (change.data.parent) {
              const parent = componentsManager.getById(change.data.parent);
              if (parent) {
                const exists =
                  parent.find(`[data-gjs-type="${change.data.type}"][data-remote-id="${change.data.remoteId}"]`)
                    .length > 0;
                if (!exists) {
                  const added = componentsManager.addComponent(change.data.html, {
                    at: change.data.index || 0,
                    ...change.data.options,
                  });
                  const newComp = Array.isArray(added) ? added[0] : added;
                  if (newComp) {
                    newComp.set("attributes", {
                      ...newComp.get("attributes"),
                      "data-remote-id": change.data.remoteId,
                    });
                  }
                }
              }
            } else {
              componentsManager.addComponent(change.data.html);
            }
            break;

          case "remove":
            if (component) component.remove({ silent: true });
            break;

          case "update":
            if (component) {
              // Actualizar atributos si es necesario
              if (change.data.attributes) {
                component.setAttributes(change.data.attributes);
              }

              // Actualizar contenido si se proporciona
              if (change.data.content !== undefined) {
                component.set("content", change.data.content);
              }

              // Actualizar estilo si se proporciona
              if (change.data.style) {
                component.setStyle(change.data.style);
              }
            }
            break;
          case "move":
            if (component && change.data.parent) {
              const newParent = componentsManager.getById(change.data.parent);
              if (newParent) {
                // Mover el componente al nuevo padre en la posición indicada
                component.move(newParent, { at: change.data.index || 0 });
              }
            }
            break;
        }

        setTimeout(() => {
          isProcessingRemoteChanges.current = false;
          processPendingChanges();
        }, 100);
      } catch (error) {
        console.error("Error al aplicar cambio remoto:", error);
        isProcessingRemoteChanges.current = false;
      }
    };

    // Handlers definidos afuera para poder removerlos luego
    const onAdd = (component: Component) => {
      if (component && !component.opt.temporary && !isProcessingRemoteChanges.current) {
        const remoteId = `${userId}-${Date.now()}`;
        component.set("attributes", {
          ...component.getAttributes(),
          "data-remote-id": remoteId,
        });
        const timestamp = Date.now();
        lastChangeRef.current[`add-${component.getId()}`] = timestamp;

        socket.emit("component-change", {
          type: "add",
          id: component.getId(),
          timestamp,
          userId,
          data: {
            parent: component.parent()?.getId(),
            index: component.index(),
            html: component.toHTML(),
            type: component.get("type"),
            remoteId,
            options: {},
          },
        });
      }
    };

    const onRemove = (component: Component) => {
      if (component && !isProcessingRemoteChanges.current) {
        const timestamp = Date.now();
        lastChangeRef.current[`remove-${component.getId()}`] = timestamp;
        socket.emit("component-change", {
          type: "remove",
          id: component.getId(),
          timestamp,
          userId,
          data: {},
        });
      }
    };

    const onUpdate = (component: Component) => {
      if (component && !isProcessingRemoteChanges.current) {
        const timestamp = Date.now();
        lastChangeRef.current[`update-${component.getId()}`] = timestamp;
        socket.emit("component-change", {
          type: "update",
          id: component.getId(),
          timestamp,
          userId,
          data: {
            attributes: component.getAttributes(),
            content: component.get("content"),
          },
        });
      }
    };

    const onStyleUpdate = (component: Component) => {
      if (component && !isProcessingRemoteChanges.current) {
        const timestamp = Date.now();
        lastChangeRef.current[`style-${component.getId()}`] = timestamp;
        socket.emit("component-change", {
          type: "update",
          id: component.getId(),
          timestamp,
          userId,
          data: { style: component.getStyle() },
        });
      }
    };

    const onMove = (component: Component) => {
      if (component && !isProcessingRemoteChanges.current) {
        const timestamp = Date.now();
        lastChangeRef.current[`move-${component.getId()}`] = timestamp;
        socket.emit("component-change", {
          type: "move",
          id: component.getId(),
          timestamp,
          userId,
          data: {
            parent: component.parent()?.getId(),
            index: component.index(),
          },
        });
      }
    };

    editor.on("component:add", onAdd);
    editor.on("component:remove", onRemove);
    editor.on("component:update", onUpdate);
    editor.on("component:styleUpdate", onStyleUpdate);
    editor.on("component:move", onMove);

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
    // const onMouseMove = (event: MouseEvent) => {
    //   const rect = canvas.getBoundingClientRect();
    //   const x = event.clientX - rect.left;
    //   const y = event.clientY - rect.top;

    //   socket.emit("cursor-position", {
    //     userId,
    //     username: `Usuario-${userId.substring(0, 5)}`,
    //     x,
    //     y,
    //     timestamp: Date.now(),
    //   });
    // };

    // if (canvas) {
    //   canvas.addEventListener("mousemove", onMouseMove);
    // }

    // const intervalId = setInterval(() => {
    //   if (editor && !isProcessingRemoteChanges.current) {
    //     try {
    //       const projectState = editor.getProjectData();
    //       socket.emit("save-project-state", {
    //         roomId,
    //         state: projectState,
    //         timestamp: Date.now(),
    //       });
    //     } catch (error) {
    //       console.error("Error al guardar el estado del proyecto:", error);
    //     }
    //   }
    // }, 10000);

    //   // Configurar captura periódica del estado completo
    const setupStateCapture = () => {
      // Cada 10 segundos, guardar el estado completo del proyecto
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
        editor.off("component:add", onAdd);
        editor.off("component:remove", onRemove);
        editor.off("component:update", onUpdate);
        editor.off("component:styleUpdate", onStyleUpdate);
        editor.off("component:move", onMove);

        if (canvas) {
          canvas.removeEventListener("mousemove", () => {});
        }
      }

      if (socket) {
        socket.off("component-change", handleComponentChange);
        socket.off("cursor-position", handleCursorPosition);
        socket.off("initial-state", handleInitialState);
      }

      cleanupStateCapture();
    };
  }, [editor, socket, userId, roomId, isInitialLoad]);

  // Función para mostrar cursores remotos
  const updateRemoteCursor = (cursorData: CursorPosition) => {
    if (!editor) return;

    const canvas = editor.Canvas.getElement();
    if (!canvas) return;

    let cursorElement = document.getElementById(`cursor-${cursorData.userId}`);

    if (!cursorElement) {
      cursorElement = document.createElement("div");
      cursorElement.id = `cursor-${cursorData.userId}`;
      cursorElement.className = "remote-cursor";

      // Generar un color aleatorio pero consistente para este usuario
      const userColor = generateColorFromString(cursorData.userId);

      cursorElement.innerHTML = `
        <div class="cursor-pointer" style="background-color: ${userColor};"></div>
        <div class="cursor-label" style="background-color: ${userColor};">${cursorData.username}</div>
      `;
      cursorElement.style.position = "absolute";
      cursorElement.style.pointerEvents = "none";
      cursorElement.style.zIndex = "999";
      canvas.appendChild(cursorElement);

      // Añadir estilos para el cursor
      if (!document.getElementById("remote-cursor-styles")) {
        const style = document.createElement("style");
        style.id = "remote-cursor-styles";
        style.textContent = `
          .remote-cursor {
            transition: transform 0.1s ease-out;
            pointer-events: none;
          }
          .cursor-pointer {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            transform: translate(-50%, -50%);
          }
          .cursor-label {
            color: white;
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 12px;
            margin-left: 5px;
            transform: translateY(-50%);
            display: inline-block;
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
  };

  // Función para generar un color aleatorio pero consistente para cada usuario
  const generateColorFromString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
  };

  return (
    <div className="collaborative-editor-container">
      <div className="users-panel">{/* Panel de usuarios activos (puedes implementarlo después) */}</div>
      <div id="studio-editor" style={{ width: "100%", height: "100vh" }} />
      <style jsx>{`
        .collaborative-editor-container {
          position: relative;
          width: 100%;
          height: 100vh;
        }
        .users-panel {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 1000;
        }
      `}</style>
    </div>
  );
};

export default StudioEditorComponent;
