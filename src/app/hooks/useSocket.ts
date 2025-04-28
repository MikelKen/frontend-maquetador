import { useEffect, useState } from "react";
import { connectSocket, disconnectSocket } from "./serviceSocket";
import { Socket } from "socket.io-client";
import { generateColorFromString } from "@/utils/generateColorFromString";

export default function useSocket(roomId: string, userId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!roomId || !userId) return;

    const userName = "User-" + Math.floor(Math.random() * 1000);
    const userColor = generateColorFromString(userId);

    const newSocket = connectSocket({
      roomId,
      userId,
      userName,
      userColor,
    });
    setSocket(newSocket);

    return () => {
      disconnectSocket();
    };
  }, [roomId, userId]);

  return socket;
}
