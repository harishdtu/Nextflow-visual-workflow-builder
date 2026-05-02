"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import HistoryPanel from "@/components/HistoryPanel";

export default function DashboardLayout({ children }: any) {
  const [historyOpen, setHistoryOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen bg-[#0f0f0f] text-white">
      
      {/* LEFT */}
      <Sidebar />

      {/* CENTER */}
      <div className="flex-1 h-full flex flex-col relative">
        {children}

        {/* 🔥 REOPEN BUTTON */}
        {!historyOpen && (
          <button
            onClick={() => setHistoryOpen(true)}
            className="fixed right-0 top-1/2 z-50 bg-gray-800 text-white px-3 py-2 rounded-l"
          >
            History
          </button>
        )}
      </div>

      {/* RIGHT */}
      {historyOpen && (
        <HistoryPanel onClose={() => setHistoryOpen(false)} />
      )}
    </div>
  );
}