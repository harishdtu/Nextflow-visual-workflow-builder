"use client";

import { Handle, Position, useReactFlow } from "reactflow";
import BaseNode from "@/components/BaseNode";

export default function TextNode({ id, data }: any) {
  const { setNodes } = useReactFlow();

  return (
    <BaseNode
      title="Text"
      icon="📝"
      loading={data.loading}
      glowColor="rgba(59,130,246,0.6)"
    >
      <textarea
        value={data.text || ""}
        onChange={(e) => {
          const value = e.target.value;

          setNodes((nds) =>
            nds.map((n) =>
              n.id === id
                ? {
                    ...n,
                    data: {
                      ...n.data,
                      text: value,
                    },
                  }
                : n
            )
          );
        }}
        placeholder="Type something..."
        rows={3}
        className="nodrag w-full bg-[#17171c] text-[#ccc] text-[11px] p-2 rounded-lg border border-[#2a2a33] focus:outline-none focus:border-[#3a3a48] resize-none placeholder-[#444] leading-relaxed"
      />

      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "#3b82f6",
          width: 8,
          height: 8,
          border: "2px solid #1e3a5f",
        }}
      />
    </BaseNode>
  );
}