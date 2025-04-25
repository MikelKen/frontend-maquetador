"use client";
import React, { useState } from "react";
import StudioEditorComponent from "./components/StudioEditor";
import Navbar from "@/components/Navbar";
import type { Editor } from "grapesjs";

function GrapesJsPage() {
  const [editor, setEditor] = useState<Editor>();
  const handleShare = () => {
    console.log("Compartir proyecto");
  };
  return (
    <main>
      <Navbar onShare={handleShare} users={[]} editor={editor} />

      <StudioEditorComponent onEditorReady={setEditor} />
    </main>
  );
}

export default GrapesJsPage;
