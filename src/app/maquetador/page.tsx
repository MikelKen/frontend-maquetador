import React from "react";
import LeftSidebar from "./components/LeftSidebar";
import DrawEditor from "./components/DrawEditor";
import RightSidebar from "./components/RightSidebar";

function DrawingPage() {
  return (
    <>
      <main>
        <section className="flex h-full flex-row">
          <LeftSidebar />
          <DrawEditor />
          <RightSidebar />
        </section>
      </main>
    </>
  );
}

export default DrawingPage;
