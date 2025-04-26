import React from "react";

import { motion } from "framer-motion";
import { Bot, Users } from "lucide-react";
import ShareDialog from "./ShareDialog";
import { TabsGenerator } from "./TabsGenerator";
import type { Editor } from "grapesjs";
import ExportAngularDialog from "./ExportAngularDialog";

interface User {
  id: string;
  name: string;
  color: string;
}

interface Props {
  onShare: () => void;
  users: User[];
  editor?: Editor;
}

function Navbar({ users, editor }: Props) {
  console.log("Users de navbar", users);
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-[#0a0f1f] border-b border-cyan-900 p-5 shadow-[0_0_20px_#0ff5ff30] backdrop-blur-xl rounded-b-2xl relative overflow-hidden"
    >
      {/* Líneas decorativas */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500/20 via-cyan-400/40 to-cyan-500/20 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500/10 via-cyan-400/20 to-cyan-500/10 animate-pulse" />

      <div className="flex justify-between items-center relative z-10">
        {/* Logo + Nombre */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 20, -20, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          >
            <Bot size={28} className="text-cyan-400 drop-shadow-lg" />
          </motion.div>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono tracking-[0.2em]">
            NEURON<span className="text-cyan-500">AI</span>
          </div>
          <TabsGenerator />
          <ExportAngularDialog editor={editor} />
        </div>

        {/* Info usuarios y compartir */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-cyan-400" />
            <div className="flex -space-x-2">
              {users.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  className="w-7 h-7 rounded-full border-2 border-cyan-500 shadow-[0_0_6px_#22d3ee] transition-transform hover:scale-110"
                  style={{ backgroundColor: user.color }}
                  title={user.name}
                />
              ))}
            </div>
            <span className="text-sm text-cyan-200 tracking-widest font-thin">{users.length} activos</span>
          </div>

          <ShareDialog />
        </div>
      </div>
    </motion.header>
  );
}

export default Navbar;
