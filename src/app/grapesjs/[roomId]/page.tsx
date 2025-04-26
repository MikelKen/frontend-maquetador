"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import StudioEditorComponent from "../components/StudioEditor";
import { v4 as uuidv4 } from "uuid";
import type { Editor } from "@grapesjs/studio-sdk/dist/typeConfigs/gjsExtend.js";
import Navbar from "@/components/Navbar";
import useSocket from "@/app/hooks/useSocket";

interface User {
  id: string;
  name: string;
  color: string;
}

export default function CollaborativeEditorPage() {
  const [editor, setEditor] = useState<Editor>();
  const [users, setUsers] = useState<User[]>([]);
  const params = useParams();
  const roomId = params.roomId as string;
  const editorRef = useRef<Editor | null>(null);

  const [userId] = useState(() => {
    // Generate a persistent user ID or get from session/local storage
    const storedUserId = localStorage.getItem("editor_user_id");
    if (storedUserId) return storedUserId;

    const newUserId = uuidv4();
    localStorage.setItem("editor_user_id", newUserId);
    return newUserId;
  });
  const socket = useSocket(roomId, userId);

  useEffect(() => {
    if (!socket) return;

    const handleRoomUsers = (activeUsers: User[]) => {
      console.log("Users in room", activeUsers);
      setUsers(activeUsers);
    };
    const handleUserJoined = (data: { userId: string; allUsers: User[] }) => {
      console.log(`User ${data.userId} joined the room`, data.allUsers);
      setUsers(data.allUsers);
    };

    const handleUserLeft = ({ id }: { id: string }) => {
      console.log(`User ${id} left the room`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    };

    socket.on("room-users", handleRoomUsers);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);

    setTimeout(() => {
      socket.emit("get-room-users");
    }, 200);

    return () => {
      socket.off("room-users", handleRoomUsers);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
    };
  }, [socket]);

  const handleShare = () => {
    console.log("Sharing editor...");
  };

  // Handle editor ready event
  const handleEditorReady = (editor: Editor) => {
    console.log("Editor is ready!");
    editorRef.current = editor;
    setEditor(editor);
    // You could add additional setup here
  };

  if (!roomId) {
    return <div>Room ID is required</div>;
  }

  if (!socket) {
    return <div>Conectando...</div>; // 👈 Este es tu nuevo control
  }
  console.log("user colaborador", users);
  return (
    <div className="editor-page">
      <Navbar onShare={handleShare} users={users} editor={editor} />
      <StudioEditorComponent roomId={roomId} userId={userId} socket={socket} onEditorReady={handleEditorReady} />
    </div>
  );
}
