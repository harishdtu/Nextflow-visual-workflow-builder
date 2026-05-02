"use client";

import { Handle, Position, useReactFlow } from "reactflow";
import { useReactFlow } from "reactflow";
import BaseNode from "@/components/BaseNode";

export default function ImageNode({ id, data }: any) {
  const { setNodes } = useReactFlow();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, imageUrl: url, output: url } } : n
      )
    );
    e.target.value = "";
  };

  return (
    <BaseNode title="Image" icon="🖼️" loading={data.loading} glowColor="rgba(234,179,8,0.5)">
      <label className="block cursor-pointer">
        {data.imageUrl ? (
          <div className="relative group">
            <img src={data.imageUrl} className="w-full h-[130px] object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <span className="text-[11px] text-white">Replace image</span>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-[#2a2a33] rounded-lg h-[80px] flex flex-col items-center justify-center gap-1 hover:border-[#444] transition-colors">
            <span className="text-base">🖼️</span>
            <span className="text-[10px] text-[#555]">png, jpg, jpeg</span>
          </div>
        )}
        <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      </label>
      <Handle type="source" position={Position.Right}
        style={{ background: "#eab308", width: 8, height: 8, border: "2px solid #713f12" }} />

    const url = URL.createObjectURL(file);

    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, imageUrl: url } }
          : n
      )
    );
  };

  return (
    <BaseNode title="🖼️ Upload Image" data={data}>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="nodrag text-xs text-gray-400 w-full"
      />
      {data.imageUrl && (
        <img
          src={data.imageUrl}
          className="mt-2 rounded w-full h-32 object-cover"
        />
      )}
    </BaseNode>
  );
}
