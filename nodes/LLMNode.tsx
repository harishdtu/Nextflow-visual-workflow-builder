"use client";

import { Handle, Position, useReactFlow } from "reactflow";
import BaseNode from "@/components/BaseNode";

const MODELS = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
  { value: "gemini-3-flash-preview", label: "Gemini 3 Flash Preview" },
  { value: "gemini-3.1-flash-lite-preview", label: "Gemini 3.1 Flash Lite Preview" },
];

export default function LLMNode({ id, data }: any) {
  const { setNodes } = useReactFlow();

  const update = (key: string, value: string) => {
    setNodes((nds) =>
      nds.map((n) => n.id === id ? { ...n, data: { ...n.data, [key]: value } } : n)
    );
  };

  return (
    <div className="relative">
      <BaseNode title="LLM" icon="🤖" loading={data.loading} glowColor="rgba(168,85,247,0.6)">
        <select
          value={data.model || "gemini-2.0-flash"}
          onChange={(e) => update("model", e.target.value)}
          className="nodrag w-full text-[11px] rounded-lg px-2 py-1.5 mb-2 focus:outline-none border border-[#2a2a33] focus:border-[#3a3a48]"
          style={{ background: "#0e0e10", color: "#aaa" }}
        >
          {MODELS.map((m) => (
            <option key={m.value} value={m.value} style={{ background: "#0e0e10", color: "#aaa" }}>
              {m.label}
            </option>
          ))}
        </select>

        <textarea
          value={data.text || ""}
          onChange={(e) => update("text", e.target.value)}
          placeholder="System prompt (optional)..."
          rows={2}
          className="nodrag w-full bg-[#17171c] text-[#ccc] text-[11px] p-2 rounded-lg border border-[#2a2a33] focus:outline-none focus:border-[#3a3a48] resize-none placeholder-[#444] mb-2"
        />

        {data.output && (
          <div className="bg-[#17171c] border border-[#2a2a33] rounded-lg p-2 max-h-28 overflow-y-auto">
            <p className="text-[10px] text-[#999] leading-relaxed whitespace-pre-wrap break-words">
              {data.output}
            </p>
          </div>
        )}
      </BaseNode>

      <Handle type="target" position={Position.Left} id="system"
        style={{ top: 48, background: "#6366f1", width: 8, height: 8, border: "2px solid #312e81" }} />
      <Handle type="target" position={Position.Left} id="user"
        style={{ top: 72, background: "#8b5cf6", width: 8, height: 8, border: "2px solid #4c1d95" }} />
      <Handle type="target" position={Position.Left} id="image"
        style={{ top: 96, background: "#a855f7", width: 8, height: 8, border: "2px solid #581c87" }} />
      <Handle type="source" position={Position.Right}
        style={{ background: "#a855f7", width: 8, height: 8, border: "2px solid #581c87" }} />
    </div>
  );
}