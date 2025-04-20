"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/useAuthStore";
import { API_ROUTES } from "@/lib/api.routes";

interface Props {
  params: {
    id: string;
  };
}
function ProjectPage({ params }: Props) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const shareId = params.id;

  useEffect(() => {
    if (!user) {
      router.push(`/auth/login?redirect=/project/${shareId}`);
      return;
    }

    fetch(`${API_ROUTES.PROJECT_SHARE.url}/${shareId}`, {
      method: API_ROUTES.PROJECT_SHARE.method,
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        console.log("Proyecto cargado: ", data);
        setLoading(false);
      })
      .catch(() => {
        router.push(`/auth/sign-in?redirect=/project/${shareId}`);
      });
  }, [shareId, user, router]);

  if (loading) return <div>Cargando projecto</div>;

  return (
    <div>
      <div>Editor colaboratibo para projecto {shareId}</div>
    </div>
  );
}

export default ProjectPage;
