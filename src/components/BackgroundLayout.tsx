"use client";

import React from "react";

export default function BackgroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Glow effects */}
      <div className="absolute top-[-200px] left-[-100px] h-[500px] w-[500px] rounded-full bg-primary opacity-20 blur-[150px]" />
      <div className="absolute bottom-[-300px] right-[-100px] h-[500px] w-[500px] rounded-full bg-secondary opacity-20 blur-[150px]" />

      {/* Grid texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      {/* Actual content (your form) */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
