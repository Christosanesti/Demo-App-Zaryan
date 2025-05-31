import Navbar from "@/components/Navbar";
import React, { ReactNode } from "react";

function layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex w-full min-h-screen flex-col">
      {/* Enhanced Background with Multiple Gradients */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(59,130,246,0.05)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(147,51,234,0.05)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.03)_0%,_transparent_70%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 w-full overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

export default layout;
