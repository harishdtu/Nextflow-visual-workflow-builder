"use client";

import { Handle, Position } from "reactflow";
import BaseNode from "@/components/BaseNode";

export default function FrameNode({ id, data }: any) {
 const timestamp =
  data.extractedTimestamp ??
  (data.timestamp ? `${data.timestamp}%` : "0%");

  return (
    <BaseNode
      title="Extract Frame"
      icon="🎬"
      loading={data.loading}
      glowColor="rgba(34,197,94,0.4)"
    >
      {/* Frame preview */}
      <div className="relative rounded-lg overflow-hidden border border-[#1e1e26] bg-[#0a0a0d]">
        {data.extractedFrame ? (
          <>
            <img
              src={data.extractedFrame}
              alt="Extracted frame"
              className="w-full h-[140px] object-contain bg-black block"
            />
            {/* Timestamp gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-2.5 py-2">
              <span className="text-[10px] text-white/90 font-medium tracking-wide">
                {timestamp}
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-[140px] flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#111116] to-[#0d0d11]">
            <span className="text-2xl opacity-20">🎬</span>
            <span className="text-[9px] text-[#2e2e3e] lowercase tracking-widest">
              Connect a video
            </span>
          </div>
        )}
      </div>

      {/* Metadata row */}
      {data.extractedFrame && timestamp && (
        <div className="mt-2 pt-2 border-t border-[#1a1a22] flex items-center justify-between">
          <span className="text-[9px] text-[#484858] lowercase tracking-widest">
            Timestamp
          </span>
          <span className="text-[10px] text-emerald-400 font-medium">
            {timestamp}
          </span>
        </div>
      )}

      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: "#22c55e",
          width: 8,
          height: 8,
          border: "2px solid #052e16",
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "#22c55e",
          width: 8,
          height: 8,
          border: "2px solid #052e16",
        }}
      />
    </BaseNode>
  );
}