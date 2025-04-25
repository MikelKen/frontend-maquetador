// import { useEffect, useRef } from "react";
// import { io, Socket } from "socket.io-client";

import { useEffect, useMemo } from "react";
import { io, Socket } from "socket.io-client";

// export default function useSocket() {
//   const socketRef = useRef<Socket | null>(null);

//   const userName = useRef("User-" + Math.floor(Math.random() * 1000));
//   const userColor = useRef("#" + ((Math.random() * 0xffffff) | 0).toString(16));

//   useEffect(() => {
//     socketRef.current = io("http://localhost:4000", {
//       transports: ["websocket"],
//       path: "/socket.io",
//     });
//     return () => {
//       socketRef.current?.disconnect();
//     };
//   }, []);
//   return { socketRef, userName: userName.current, userColor: userColor.current };
// }

export default function useSocket(roomId: string) {
  const socket = useMemo<Socket>(
    () =>
      io("http://localhost:4000/grapes", {
        query: { room: roomId },
      }),
    [roomId]
  );

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);
  return socket;
}
