"use client";

import { Handle, Position, useReactFlow } from "reactflow";
import { useState } from "react";

export default function ImageNode({ id, data }: any) {
  const { setNodes } = useReactFlow();
  const [error, setError] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(false);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      if (!base64) return;
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? { ...n, data: { ...n.data, imageUrl: base64, output: base64 } }
            : n
        )
      );
    };
    reader.onerror = () => console.error("FileReader failed");
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const hasImage = !!data.imageUrl && !error;

  return (
    <div
      className={`bg-[#0e0e10] border rounded-xl w-[220px] overflow-hidden transition-all duration-300 ${
        data.loading
          ? "animate-pulse border-transparent"
          : "border-[#1e1e24] hover:border-[#2e2e38]"
      }`}
      style={data.loading ? { boxShadow: "0 0 18px 3px rgba(234,179,8,0.5)" } : {}}
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-[#1e1e24] bg-[#0a0a0c]">
        <span className="text-[11px]">🖼️</span>
        <span className="text-[11px] font-medium text-[#888]">Image</span>
      </div>

      {/* Body */}
      <div className="p-2.5">
        <label className="block cursor-pointer">
          {hasImage ? (
            <div className="relative group">
              {/* key forces img remount when src changes */}
              <img
                key={data.imageUrl?.slice(-20)}
                src={data.imageUrl}
                alt="uploaded"
                onError={() => setError(true)}
                className="w-full h-[130px] object-cover rounded-lg block"
                style={{ display: "block" }}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <span className="text-[11px] text-white">Replace image</span>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-[#2a2a33] rounded-lg h-[100px] flex flex-col items-center justify-center gap-2 hover:border-[#555] transition-colors">
              <span className="text-2xl">🖼️</span>
              <span className="text-[10px] text-[#555]">
                {error ? "Failed to load — try again" : "Click or drag an image"}
              </span>
              <span className="text-[9px] text-[#3a3a3a]">png · jpg · jpeg · webp</span>
            </div>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#eab308", width: 8, height: 8, border: "2px solid #713f12" }}
      />
    </div>
  );
}