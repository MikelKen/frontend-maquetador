import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (options: { roomId: string; userId: string; userName: string; userColor: string }) => {
  if (!socket) {
    socket = io("http://localhost:4000", {
      query: options,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
