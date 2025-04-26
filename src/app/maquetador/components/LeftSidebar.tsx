import React from "react";

function LeftSidebar() {
  return (
    <section className="flex flex-col border-t border-gray-800 bg-gray-900 text-gray-400 min-w-[227px] sticky left-0 h-full max-sm:hidden select-none overflow-y-auto pb-20 flex-col border-gray-700 bg-black">
      <h3 className="border border-gray-800 px-5 py-4 text-xs uppercase">Layers</h3>
      <div className="flex flex-col"></div>
    </section>
  );
}

export default LeftSidebar;
