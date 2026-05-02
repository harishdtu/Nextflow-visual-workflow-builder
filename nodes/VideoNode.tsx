"use client";

import { Handle, Position, useReactFlow } from "reactflow";
import BaseNode from "@/components/BaseNode";

export default function VideoNode({ id, data }: any) {
  const { setNodes } = useReactFlow();

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, videoUrl: null, uploading: true } } : n
      )
    );

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-video", { method: "POST", body: formData });
      const result = await res.json();
      const videoUrl = result.secure_url;
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? { ...n, data: { ...n.data, videoUrl, output: videoUrl, uploading: false, timestamp: "10%" } }
            : n
        )
      );
    } catch {
      setNodes((nds) =>
        nds.map((n) => n.id === id ? { ...n, data: { ...n.data, uploading: false } } : n)
      );
    }
    e.target.value = "";
  };

  return (
    <BaseNode title="Video" icon="🎥" loading={data.loading} glowColor="rgba(16,185,129,0.5)">
      <label className="block cursor-pointer">
        {data.videoUrl ? (
          <div className="relative">
            <video
              key={data.videoUrl}
              src={data.videoUrl}
              className="w-full h-[110px] object-cover rounded-lg"
              controls
              crossOrigin="anonymous"
            />
          </div>
        ) : (
          <div className="border border-dashed border-[#2a2a33] rounded-lg h-[80px] flex flex-col items-center justify-center gap-1 hover:border-[#444] transition-colors">
            {data.uploading ? (
              <span className="text-[11px] text-emerald-400 animate-pulse">Uploading...</span>
            ) : (
              <>
                <span className="text-base">🎥</span>
                <span className="text-[10px] text-[#555]">mp4, mov, webm</span>
              </>
            )}
          </div>
        )}
        <input type="file" accept="video/*" onChange={handleUpload} className="hidden" />
      </label>

      {data.videoUrl && (
        <label className="block cursor-pointer mt-1">
          <div className="text-center text-[9px] text-[#555] hover:text-[#888] transition-colors py-0.5">
            Replace video
          </div>
          <input type="file" accept="video/*" onChange={handleUpload} className="hidden" />
        </label>
      )}

      {data.videoUrl && (
        <div className="mt-2">
          <div className="flex justify-between text-[9px] text-[#555] mb-0.5">
            <span>Frame at</span>
            <span className="text-[#666]">{data.timestamp || "10%"}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={parseInt(data.timestamp || "10")}
            onChange={(e) =>
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === id ? { ...n, data: { ...n.data, timestamp: `${e.target.value}%` } } : n
                )
              )
            }
            className="nodrag w-full accent-emerald-500"
          />
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#10b981", width: 8, height: 8, border: "2px solid #064e3b" }}
      />
    </BaseNode>
  );
}