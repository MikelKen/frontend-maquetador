"use client";

import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import StudioEditorComponent from "../StudioEditorComponent";
import { v4 as uuidv4 } from "uuid";
import type { Editor } from "@grapesjs/studio-sdk/dist/typeConfigs/gjsExtend.js";

export default function CollaborativeEditorPage() {
  const params = useParams();
  const [userId] = useState(() => {
    // Generate a persistent user ID or get from session/local storage
    const storedUserId = localStorage.getItem("editor_user_id");
    if (storedUserId) return storedUserId;

    const newUserId = uuidv4();
    localStorage.setItem("editor_user_id", newUserId);
    return newUserId;
  });

  const roomId = params.roomId as string;
  const editorRef = useRef<Editor | null>(null);

  // Handle editor ready event
  const handleEditorReady = (editor: Editor) => {
    console.log("Editor is ready!");
    editorRef.current = editor;
    // You could add additional setup here
  };

  if (!roomId) {
    return <div>Room ID is required</div>;
  }

  return (
    <div className="editor-page">
      <div className="editor-header">
        <h1>Collaborative Editor - Room: {roomId}</h1>
        <div className="user-info">User ID: {userId.substring(0, 8)}</div>
      </div>

      <StudioEditorComponent roomId={roomId} userId={userId} onEditorReady={handleEditorReady} />

      <style jsx>{`
        .editor-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
          background-color: #1e293b;
          color: white;
        }
        .user-info {
          background-color: #3b82f6;
          padding: 5px 10px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
