import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const generatorRamdonColor = () =>
  "#" +
  Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0");

const generateRandomName = () => "Invitado" + Math.floor(Math.random() * 1000);

const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [userName] = useState(generateRandomName());
  const [userColor] = useState(generatorRamdonColor());

  useEffect(() => {
    const socket = io("http://localhost:4000", {
      transports: ["websocket"],
    });

    socket.emit("join", { userName, userColor });

    socketRef.current = socket;
    return () => {
      socket.disconnect();
    };
  }, [userName, userColor]);
  return { socketRef, userName, userColor };
};

export default useSocket;
