"use client";

import { Handle, Position, useReactFlow } from "reactflow";
import BaseNode from "@/components/BaseNode";
import { useState } from "react";

export default function ImageNode({ id, data }: any) {
  const { setNodes } = useReactFlow();

  const [error, setError] = useState(false);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError(false);

    // loading state
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? {
              ...n,
              data: {
                ...n.data,
                loading: true,
              },
            }
          : n
      )
    );

    try {
      const formData = new FormData();

      formData.append("file", file);

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      let result;

      try {
        result = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!res.ok) {
        throw new Error(result?.error || "Upload failed");
      }

      // preload image to get dimensions
      const img = new Image();

      img.onload = () => {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === id
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    imageUrl: result.url,
                    output: result.url,
                    width: img.width,
                    height: img.height,
                    loading: false,
                  },
                }
              : n
          )
        );
      };

      img.onerror = () => {
        throw new Error("Failed to load image");
      };

      img.src = result.url;
    } catch (err) {
      console.error(err);

      setError(true);

      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? {
                ...n,
                data: {
                  ...n.data,
                  loading: false,
                },
              }
            : n
        )
      );
    }

    e.target.value = "";
  };

  const hasImage = !!data.imageUrl && !error;

  return (
    <BaseNode
      title="Image"
      icon="🖼️"
      loading={data.loading}
      glowColor="rgba(234,179,8,0.35)"
    >
      <label className="block cursor-pointer">
        {hasImage ? (
          <div className="relative rounded-[18px] overflow-hidden border border-[#1a1b22] bg-[#09090c] group">
            {/* image */}
            <img
              key={data.imageUrl?.slice(-20)}
              src={data.imageUrl}
              alt="uploaded"
              className="w-full h-[190px] object-cover block"
            />

            {/* overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* replace */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="px-3 py-1 rounded-md bg-black/70 backdrop-blur border border-white/10 text-[10px] text-white">
                Replace image
              </div>
            </div>

            {/* dimensions */}
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur border border-white/5 text-[10px] text-white/80">
              {data.width || 1024} × {data.height || 768}
            </div>
          </div>
        ) : (
          <div className="h-[190px] rounded-[18px] border border-dashed border-[#252532] bg-gradient-to-br from-[#0d0d12] to-[#09090c] flex flex-col items-center justify-center gap-3 hover:border-[#3a3a4a] transition-colors">
            {/* icon */}
            <div className="w-14 h-14 rounded-2xl border border-[#23242d] bg-[#111218] flex items-center justify-center shadow-inner">
              <span className="text-xl opacity-60">
                🖼️
              </span>
            </div>

            {/* text */}
            <div className="text-center">
              <p className="text-[11px] text-[#6d7080]">
                {error
                  ? "Failed to load image"
                  : "Click or drag an image"}
              </p>

              <p className="text-[9px] uppercase tracking-[0.22em] text-[#3d404d] mt-1">
                PNG · JPG · WEBP · GIF
              </p>
            </div>
          </div>
        )}

        <input
          type="file"
          accept="
            image/png,
            image/jpeg,
            image/jpg,
            image/webp,
            image/gif
          "
          onChange={handleUpload}
          className="hidden"
        />
      </label>

      {/* output handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "#eab308",
          width: 10,
          height: 10,
          border: "2px solid #3b2f07",
          boxShadow: "0 0 14px rgba(234,179,8,0.9)",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      />
    </BaseNode>
  );
}