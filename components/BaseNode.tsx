"use client";

import { ReactNode } from "react";

interface BaseNodeProps {
  title: string;
  icon: string;
  loading?: boolean;
  glowColor?: string;
  children: ReactNode;
}

export default function BaseNode({
  title,
  icon,
  loading,
  glowColor = "rgba(168,85,247,0.6)",
  children,
}: BaseNodeProps) {
  return (
    <div
      className={`bg-[#0e0e10] border rounded-xl w-[220px] transition-all duration-300 ${
        loading
          ? "animate-pulse border-transparent"
          : "border-[#1e1e24] hover:border-[#2e2e38]"
      }`}
      style={
        loading
          ? { boxShadow: `0 0 18px 3px ${glowColor}`, borderColor: "transparent" }
          : {}
      }
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-[#1e1e24] bg-[#0a0a0c] rounded-t-xl">
        <span className="text-[11px]">{icon}</span>
        <span className="text-[11px] font-medium text-[#888]">{title}</span>
        {loading && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
        )}
      </div>
      {/* Content */}
      <div className="p-2.5">{children}</div>
    </div>
  );
}