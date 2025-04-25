"use client";
import dynamic from "next/dynamic";

const GrapesJs = dynamic(() => import("./grapesjs"), {
  ssr: false,
});

export default function GrapesJsPageWrapper({ shareId }: { shareId: string }) {
  return <GrapesJs shareId={shareId} />;
}
