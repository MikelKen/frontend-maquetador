"use client";

import { useEffect } from "react";
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

type Props = {
  onEditorReady?: (editor: Editor) => void;
};
const StudioEditorComponent = ({ onEditorReady }: Props) => {
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisitedGrapesEditor");

    if (!hasVisited) {
      alert("👋 ¡Bienvenido/a al editor! Aquí podrás diseñar tus páginas con libertad.");
      localStorage.setItem("hasVisitedGrapesEditor", "true");
    }

    createStudioEditor({
      root: "#studio-editor",
      licenseKey: "c2240ba690d1463fa178fa79c4b4d757e433249c56ec4fb4ac9c0a98ab295070",
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
        id: "UNIQUE_PROJECT_ID",
        default: {
          pages: [
            {
              name: "Página Inicial",
              styles: "",
              component: `<section style="padding: 50px; text-align: center; color: white;">
                  <h1 style="font-size: 2.5rem; color: #3B82F6;">👋 ¡Bienvenido al editor!</h1>
                  <p style="font-size: 1.2rem;">Empezá a construir tu página con los bloques de la izquierda.</p>
                </section>`,
            },
          ],
        },
      },
      identity: {
        id: "UNIQUE_END_USER_ID",
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
        onEditorReady?.(editor);
      },
    });
  }, [onEditorReady]);

  return <div id="studio-editor" style={{ width: "100%", height: "100vh" }} />;
};

export default StudioEditorComponent;
