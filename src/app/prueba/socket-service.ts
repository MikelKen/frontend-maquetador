import { io, Socket } from "socket.io-client";

export class SocketService {
  private socket: Socket | null = null;
  private roomId: string | null = null;

  connect(roomId: string, userId: string) {
    this.roomId = roomId;
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:4000", {
      query: { roomId, userId },
    });

    console.log(`Connected to room: ${roomId} as user: ${userId}`);

    this.socket.on("connect", () => {
      console.log("Socket connected");
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Get the socket instance
  getSocket() {
    return this.socket;
  }

  // Join a specific editing room
  joinRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit("join-room", roomId);
      this.roomId = roomId;
    }
  }

  // Leave the current room
  leaveRoom() {
    if (this.socket && this.roomId) {
      this.socket.emit("leave-room", this.roomId);
      this.roomId = null;
    }
  }
}

export const socketService = new SocketService();
