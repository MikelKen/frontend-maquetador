"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, Users } from "lucide-react";
import ShareDialog from "./ShareDialog";
import { TabsGenerator } from "./TabsGenerator";
import ExportAngularDialog from "./ExportAngularDialog";
import type { Editor } from "grapesjs";

interface User {
  id: string;
  name: string;
  color: string;
}

interface Props {
  onShare: () => void;
  users?: User[];
  editor?: Editor;
}

function Navbar({ users = [], editor }: Props) {
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden bg-gradient-to-br from-[#0a0f1f] via-[#05080f] to-black border-b border-cyan-900 p-5 shadow-[0_0_20px_#0ff5ff30] backdrop-blur-xl rounded-b-2xl"
    >
      {/* TEXTURA DE CUADRICULA MANUAL */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-10 animate-moveGrid"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          backgroundPosition: "0 0",
          animation: "moveGrid 20s linear infinite",
        }}
      />

      {/* LÍNEAS DECORATIVAS */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500/20 via-cyan-400/40 to-cyan-500/20 animate-pulse z-10" />
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500/10 via-cyan-400/20 to-cyan-500/10 animate-pulse z-10" />

      {/* CONTENIDO */}
      <div className="flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 20, -20, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          >
            <Bot size={28} className="text-cyan-400 drop-shadow-lg" />
          </motion.div>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono tracking-[0.2em]">
            ASOCIAL<span className="text-cyan-500">¨</span>
          </div>

          <TabsGenerator editor={editor} />
          <ExportAngularDialog editor={editor} />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-cyan-400" />
            <div className="flex -space-x-2">
              {users.length > 0 ? (
                users
                  .slice(0, 5)
                  .map((user) => (
                    <div
                      key={user.id}
                      className="w-7 h-7 rounded-full border-2 border-cyan-500 shadow-[0_0_6px_#22d3ee] transition-transform hover:scale-110"
                      style={{ backgroundColor: user.color }}
                      title={user.name}
                    />
                  ))
              ) : (
                <div className="text-cyan-200 text-xs">No users</div>
              )}
            </div>
            <span className="text-sm text-cyan-200 tracking-widest font-thin">{users.length} active</span>
          </div>

          <ShareDialog />
        </div>
      </div>
    </motion.header>
  );
}

export default Navbar;
