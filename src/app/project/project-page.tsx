"use client";

import { useState } from "react";
import type { Editor, Component } from "grapesjs";
import GrapesJsStudio, { StudioCommands, ToastVariant } from "@grapesjs/studio-sdk/react";

import "@grapesjs/studio-sdk/style";
import useSocket from "../hooks/useSocket";
import debounce from "lodash/debounce";

const genId = () => `c-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

const findComponent = (editor: Editor | undefined, id: string): Component | undefined =>
  editor?.getWrapper()?.find(`#${id}`)[0];

export default function ProjectDesing({ shareId = "default" }: { shareId?: string }) {
  const [editor, setEditor] = useState<Editor>();
  const socket = useSocket(shareId);

  const onReady = (editor: Editor) => {
    console.log("Editor loaded", editor);
    setEditor(editor);
    const wrap = editor.getWrapper()!;
    if (!wrap.getId()) wrap.setId(genId());
    socket.emit("project:request");

    /*----------EMIT------------- */
    // const emitAdd = (comp: Component) => socket.emit("component:add", { id: comp.getId(), json: comp.toJSON() });

    // const emitUpdate = debounce(
    //   (comp: Component) => socket.emit("component:update", { id: comp.getId(), json: comp.toJSON() }),
    //   120
    // );

    // const emitRemove = (comp: Component) => socket.emit("component:remove", { id: comp.getId() });

    /*-----------1. ADD------------- */
    editor.on("component:add", (model, opts = {}) => {
      if (opts.silent) return;
      const id = genId();
      model.setId(id);

      const parentId = model.parent()?.getId() || wrap.getId()!;

      socket.emit("component:add", { id, parentId, json: model.toJSON() });
    });

    socket.on("component:add", ({ id, parentId, json }) => {
      const parent = findComponent(editor, parentId) || wrap;

      parent.append(
        {
          ...json,
          attributes: { ...(json.attributes || {}), id },
        },
        { silent: true }
      );
    });
    // editor.on("component:add", (comp, opts?: { silent?: boolean }) => {
    //   if (opts?.silent) return;
    //   if (!comp.getId()) comp.setId(genId());
    //   socket.emit("component:add", {
    //     id: comp.getId(),
    //     json: comp.toJSON(),
    //   });
    // });
    // socket.on("component:add", ({ id, json }) => {
    //   if (findComponent(editor, id)) return;

    //   editor.addComponents({ ...json, attributes: { ...(json.attributes || {}), id } }, { silent: true });
    // });

    /*-----------2. Remove------------- */
    editor.on("component:remove", (model, opts = {}) => {
      if (opts.silent) return;
      socket.emit("component:remove", model.getId());
    });

    socket.on("component:remove", (id: string) => {
      const m = findComponent(editor, id);
      if (m) m.remove({ silent: true });
    });

    // editor.on("component:remove", (comp, opts?: { silent?: boolean }) => {
    //   if (opts?.silent) return;
    //   socket.emit("component:remove", comp.getId());
    // });
    // socket.on("component:remove", (id: string) => {
    //   findComponent(editor, id)?.remove({ silent: true });
    // });

    /*-----------3. Update------------- */
    const emitUpdate = debounce((model: Component) => {
      const payload = {
        id: model.getId(),
        tagName: model.get("tagName"),
        type: model.get("type"),
        attributes: model.getAttributes(),
        style: model.getStyle(),
        content: model.get("content"),

        components: model.components().map((comp) => comp.toJSON({})),
      };
      socket.emit("component:update", payload);
    }, 100);

    editor.on("component:update", (model, opts = {}) => {
      if (opts.silent) return;
      emitUpdate(model);
    });

    socket.on("component:update", ({ id, json }) => {
      const m = findComponent(editor, id);
      if (m) m.set(json, { silent: true });
    });

    // const emitUpdate = debounce((comp: Component) => {
    //   socket.emit("component:update", comp.toJSON());
    // }, 120);
    // editor.on("component:update", (comp, opts?: { silent?: boolean }) => {
    //   if (opts?.silent) return;
    //   emitUpdate(comp);
    // });
    // socket.on("component:update", (json: any) => {
    //   const c = findComponent(editor, json.attributes?.id);
    //   if (c) c.set(json, { silent: true });
    // });

    /*-----------4. Style Update------------- */
    editor.on("component:styleUpdate", (c, style) => {
      socket.emit("component:style", { id: c.getId(), style });
    });

    socket.on("component:style", ({ id, style }) => {
      findComponent(editor, id)?.setStyle(style);
    });

    // editor.on("component:styleUpdate", (comp, style) => {
    //   socket.emit("component:style", {
    //     id: comp.getId(),
    //     style,
    //   });
    // });
    // socket.on("component:style", ({ id, style }) => {
    //   findComponent(editor, id)?.setStyle(style, { silent: true });
    // });
    /*-----------5. Content Update------------- */

    // editor.on("component:change:content", (comp: Component, newVal: string, opts: Record<string, any>) => {
    //   if (opts.silent) return;

    //   const id = comp.getId?.();
    //   if (!id) return;
    //   socket.emit("component:content", { id, content: newVal });
    // });
    editor.on("component:change:content", (comp: Component, newVal: string, opts: Record<string, any>) => {
      // Ignora los que vengan con silent (o con opts.remote si lo quisieras)
      if (opts.silent) return;

      const id = comp.getId?.();
      if (!id) return;
      socket.emit("component:content", { id, content: newVal });
    });

    socket.on("component:content", ({ id, content }) => {
      findComponent(editor, id)?.set("content", content);
    });

    // editor.on("component:change:content", (comp, content: string, opts?: { silent?: boolean }) => {
    //   if (opts?.silent) return;
    //   socket.emit("component:change:content", {
    //     id: comp.getId(),
    //     content,
    //   });
    // });
    // socket.on("component:change:content", ({ id, content }: { id: string; content: string }) => {
    //   const c = findComponent(editor, id);
    //   if (c) c.set("content", content, { silent: true });
    // });

    // socket.on("component:content", ({ id, content }) => {
    //   const comp = findComponent(editor, id);
    //   if (!comp) return;

    //   comp.set("content", content, { silent: true });
    // });

    // socket.on("project:snapshot", (snap) => {
    //   if (snap?.pages?.length) {
    //     editor.loadProjectData(snap);

    //     const wrapper = editor.getWrapper();
    //     if (!wrapper) return;

    //     const allComps = wrapper.find("*");
    //     allComps.forEach((c) => {
    //       if (!c.getId()) c.setId(genId());
    //     });
    //   }
    // });
    socket.on("project:snapshot", (snap) => {
      if (!snap?.pages?.length) return;
      editor.loadProjectData(snap);

      // Asigna IDs al wrapper y sus hijos
      const w = editor.getWrapper()!;
      if (!w.getId()) w.setId(genId());
      w.find("*").forEach((c) => {
        if (!c.getId()) c.setId(genId());
      });
    });
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

  return (
    <main className="flex h-screen flex-col justify-between p-5 gap-2">
      <div className="p-1 flex gap-5">
        <div className="font-bold">SDK example Next.js</div>
        <button className="border rounded px-2" onClick={getProjetData}>
          Log Project Data
        </button>
        <button className="border rounded px-2" onClick={getExportData}>
          Log HTML/CSS
        </button>
      </div>
      <div className="flex-1 w-full h-full overflow-hidden">
        <GrapesJsStudio
          onReady={onReady}
          options={{
            licenseKey: "YOUR_LICENSE_KEY",
            project: {
              default: {
                pages: [
                  {
                    name: "Home",
                    component: `<h1 style="padding: 2rem; text-align: center">
                      Hello Studio 👋
                    </h1>`,
                  },
                ],
              },
            },
          }}
        />
      </div>
    </main>
  );
}
