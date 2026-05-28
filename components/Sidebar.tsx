"use client";

import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";

export default function Sidebar() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const [collapsed, setCollapsed] = useState(false);

  const onDragStart = (event: React.DragEvent, type: string) => {
    event.dataTransfer.setData("nodeType", type);
    event.dataTransfer.effectAllowed = "move";
  };

  const nodeItems = [
    { type: "textNode", icon: "📝", label: "Text" },
    { type: "llmNode", icon: "🤖", label: "AI" },
    { type: "imageNode", icon: "🖼️", label: "Image" },
    { type: "videoNode", icon: "🎥", label: "Video" },
    { type: "cropNode", icon: "✂️", label: "Crop" },
    { type: "frameNode", icon: "🎞", label: "Frame" },
  ];

  return (
    <div
      className={`flex flex-col border-r border-[#222] bg-[#0f0f0f] text-white transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* HEADER */}
      <div className="p-3 border-b border-[#222] flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="text-sm font-bold">NextFlow AI 🚀</h1>
            {user && (
              <p className="text-[10px] text-gray-400 truncate">
                {user.emailAddresses[0]?.emailAddress}
              </p>
            )}
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-xs text-gray-400 hover:text-white"
        >
          {collapsed ? "➡️" : "⬅️"}
        </button>
      </div>

      {/* NODES */}
      <div className="flex-1 p-2 space-y-2">
        {nodeItems.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => onDragStart(e, item.type)}
            className={`flex items-center gap-2 p-2 rounded-lg cursor-grab hover:bg-[#1f1f1f] border border-transparent hover:border-[#333] transition-all ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <span className="text-sm">{item.icon}</span>
            {!collapsed && <span className="text-xs">{item.label}</span>}
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="p-2 border-t border-[#222]">
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs hover:bg-red-900/30 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span>🚪</span>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}