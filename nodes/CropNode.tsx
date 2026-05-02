"use client";

import { Handle, Position, useReactFlow } from "reactflow";
import { useEffect } from "react";
import BaseNode from "@/components/BaseNode";

export default function CropNode({ id, data }: any) {
  const { setNodes, getNodes, getEdges } = useReactFlow();

  useEffect(() => {
    const nodes = getNodes();
    const edges = getEdges();
    const edge = edges.find((e) => e.target === id);
    if (!edge) return;
    const source = nodes.find((n) => n.id === edge.source);
    if (!source) return;
    const imageUrl = source.data?.imageUrl || source.data?.output;
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const x = ((data.cropX ?? 0) / 100) * img.width;
      const y = ((data.cropY ?? 0) / 100) * img.height;
      const w = Math.max(1, ((data.cropW ?? 100) / 100) * img.width);
      const h = Math.max(1, ((data.cropH ?? 100) / 100) * img.height);
      canvas.width = w;
      canvas.height = h;
      ctx?.drawImage(img, x, y, w, h, 0, 0, w, h);
      const cropped = canvas.toDataURL("image/jpeg");
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, output: cropped, imageUrl: cropped } } : n
        )
      );
    };
  }, [data.cropX, data.cropY, data.cropW, data.cropH]);

  const sliders = [
    { key: "cropX", label: "X", color: "accent-blue-500" },
    { key: "cropY", label: "Y", color: "accent-purple-500" },
    { key: "cropW", label: "W", color: "accent-green-500", default: 100 },
    { key: "cropH", label: "H", color: "accent-red-500", default: 100 },
  ];

  return (
    <BaseNode title="Crop Image" icon="✂️" loading={data.loading} glowColor="rgba(239,68,68,0.5)">
      {data.output ? (
        <img src={data.output} className="w-full h-[100px] object-cover rounded-lg mb-2" />
      ) : (
        <div className="h-[60px] border border-dashed border-[#2a2a33] rounded-lg flex items-center justify-center mb-2">
          <span className="text-[10px] text-[#555]">Connect an image</span>
        </div>
      )}

      <div className="space-y-1.5">
        {sliders.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <span className="text-[9px] text-[#666] w-4">{s.label}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={data[s.key] ?? (s.default || 0)}
              onChange={(e) =>
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === id ? { ...n, data: { ...n.data, [s.key]: Number(e.target.value) } } : n
                  )
                )
              }
              className={`nodrag flex-1 ${s.color}`}
            />
            <span className="text-[9px] text-[#555] w-6 text-right">
              {data[s.key] ?? (s.default || 0)}
            </span>
          </div>
        ))}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#ef4444", width: 8, height: 8, border: "2px solid #7f1d1d" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#ef4444", width: 8, height: 8, border: "2px solid #7f1d1d" }}
      />
    </BaseNode>
  );
}