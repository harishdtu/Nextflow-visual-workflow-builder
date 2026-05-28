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
  glowColor = "rgba(168,85,247,0.45)",
  children,
}: BaseNodeProps) {
  return (
    <div
      className={`
        relative
        w-[245px]
        rounded-[24px]
        overflow-visible
        border
        bg-[#08090d]
        transition-all
        duration-300
        backdrop-blur-xl
        ${
          loading
            ? "border-transparent"
            : "border-[#1a1b22] hover:border-[#2b2d36]"
        }
      `}
      style={{
        boxShadow: loading
          ? `0 0 30px ${glowColor}`
          : `
            inset 0 1px 0 rgba(255,255,255,0.03),
            0 0 0 1px rgba(255,255,255,0.02)
          `,
      }}
    >
      {/* subtle top glow */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-[24px]" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#14151b] rounded-t-[24px] bg-[#090a0f]">
        <div className="flex items-center gap-3">
          {/* icon box */}
          <div className="w-8 h-8 rounded-xl border border-[#23242d] bg-[#111218] flex items-center justify-center shadow-inner">
            <span className="text-[14px] opacity-80">
              {icon}
            </span>
          </div>

          {/* title */}
          <span className="text-[11px] uppercase tracking-[0.18em] text-[#8b8d98] font-medium">
            {title}
          </span>
        </div>

        {/* loading dot */}
        {loading && (
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{
              background: glowColor,
              boxShadow: `0 0 12px ${glowColor}`,
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {children}
      </div>
    </div>
  );
}