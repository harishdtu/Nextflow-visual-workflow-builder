"use client";

import { useState, ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import HistoryPanel from "@/components/HistoryPanel";

type Props = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  const [historyOpen, setHistoryOpen] = useState<boolean>(true);

  return (
    <div className="flex h-screen w-screen bg-[#0f0f0f] text-white overflow-hidden">
      
      {/* LEFT SIDEBAR */}
      <Sidebar />

      {/* CENTER CONTENT */}
      <div className="flex-1 h-full flex flex-col relative">
        {children}

        {/* 🔥 REOPEN BUTTON */}
        {!historyOpen && (
          <button
            onClick={() => setHistoryOpen(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-gray-800 text-white px-3 py-2 rounded-l hover:bg-gray-700 transition"
          >
            History
          </button>
        )}
      </div>

      {/* RIGHT PANEL */}
      {historyOpen && (
        <HistoryPanel onClose={() => setHistoryOpen(false)} />
      )}
    </div>
  );
}