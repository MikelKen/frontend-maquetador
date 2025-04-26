// app/prueba/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function RedirectToRoom() {
  const router = useRouter();

  useEffect(() => {
    const newRoomId = uuidv4();
    router.replace(`/prueba/${newRoomId}`);
  }, [router]);

  return <p>Redireccionando a nueva sala...</p>;
}
