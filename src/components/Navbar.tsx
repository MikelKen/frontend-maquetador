"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, Users } from "lucide-react";
import ShareDialog from "./ShareDialog";
import { TabsGenerator } from "./TabsGenerator";
import ExportAngularDialog from "./ExportAngularDialog";
import type { Editor } from "grapesjs";
import SaveAndListProject from "./SaveAndListProject";
import { useAuthStore } from "@/lib/useAuthStore";

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
  const { user: userRoom } = useAuthStore();
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
          <div className="flex flex-col leading-tight">
            <motion.span
              initial={{ opacity: 0.9, scale: 1 }}
              animate={{ opacity: [0.9, 1, 0.9], scale: [1, 1.05, 1] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-2xl font-extrabold text-cyan-300 tracking-wide"
            >
              {userRoom?.name ?? "Guest"}
              <span className="text-cyan-500">¨</span>
            </motion.span>

            <span className="text-sm font-medium text-cyan-400 tracking-widest">ASOCIAL</span>
          </div>

          <SaveAndListProject />
          <TabsGenerator editor={editor} />
          <ExportAngularDialog editor={editor} />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {/* Ícono de usuarios */}
            <Users size={18} className="text-cyan-400" />

            {/* Lista de usuarios */}
            <div className="flex -space-x-2">
              {users.length > 0 ? (
                <>
                  {users.slice(0, 5).map((user) => (
                    <div
                      key={user.id}
                      className="relative group w-9 h-9 rounded-full border-2 border-cyan-400 shadow-md flex items-center justify-center text-gray-600 text-xs font-bold uppercase overflow-hidden bg-cyan-800 hover:scale-110 transition-transform cursor-pointer"
                      style={{ backgroundColor: user.color || "#0f172a" }}
                    >
                      {user.name?.[0] ?? "?"}

                      {/* Tooltip flotante */}
                      <div className="absolute left-1/2 bottom-full transform -translate-x-1/2 mb-2 px-3 py-1 rounded-md bg-cyan-700 text-gray-600 text-[10px] font-medium opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300 z-50 pointer-events-none whitespace-nowrap">
                        {user.name}
                      </div>
                    </div>
                  ))}

                  {/* Mostrar +X si hay más de 5 usuarios */}
                  {users.length > 5 && (
                    <div className="w-9 h-9 rounded-full border-2 border-cyan-400 bg-cyan-700 flex items-center justify-center text-gray-600 text-xs font-bold hover:scale-110 transition-transform cursor-pointer">
                      +{users.length - 5}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-cyan-200 text-xs">No users</div>
              )}
            </div>

            {/* Contador de usuarios */}
            <span className="text-sm text-cyan-200 tracking-widest font-thin">{users.length} active</span>
          </div>

          <ShareDialog />
        </div>
      </div>
    </motion.header>
  );
}

export default Navbar;
