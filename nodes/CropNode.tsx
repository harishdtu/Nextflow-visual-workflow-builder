"use client";

import { Handle, Position, useReactFlow } from "reactflow";
import { useEffect, useRef } from "react";
import BaseNode from "@/components/BaseNode";

export default function CropNode({ id, data }: any) {
  const { setNodes, getNodes, getEdges } = useReactFlow();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Live crop preview
  useEffect(() => {
    const nodes = getNodes();
    const edges = getEdges();

    const edge = edges.find((e) => e.target === id);
    if (!edge) return;

    const source = nodes.find((n) => n.id === edge.source);
    if (!source) return;

    const imageUrl = source.data?.imageUrl || source.data?.output;

    if (!imageUrl) return;

    let cancelled = false;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (cancelled || !mountedRef.current) return;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      const x = ((data.cropX ?? 0) / 100) * img.width;
      const y = ((data.cropY ?? 0) / 100) * img.height;

      const w = Math.max(
        1,
        ((data.cropW ?? 100) / 100) * img.width
      );

      const h = Math.max(
        1,
        ((data.cropH ?? 100) / 100) * img.height
      );

      canvas.width = w;
      canvas.height = h;

      ctx.drawImage(
        img,
        x,
        y,
        w,
        h,
        0,
        0,
        w,
        h
      );

      const cropped = canvas.toDataURL("image/jpeg");

      if (!cancelled && mountedRef.current) {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === id
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    output: cropped,
                    imageUrl: cropped,
                  },
                }
              : n
          )
        );
      }
    };

    img.onerror = () => {
      console.warn("CropNode: failed to load source image");
    };

    img.src = imageUrl;

    return () => {
      cancelled = true;
    };
  }, [
    id,
    data.cropX,
    data.cropY,
    data.cropW,
    data.cropH,
    getNodes,
    getEdges,
    setNodes,
  ]);

  const sliders = [
    {
      key: "cropX",
      label: "X",
      default: 0,
    },
    {
      key: "cropY",
      label: "Y",
      default: 0,
    },
    {
      key: "cropW",
      label: "W",
      default: 100,
    },
    {
      key: "cropH",
      label: "H",
      default: 100,
    },
  ];

  return (
    <BaseNode
      title="Crop Image"
      icon="✂️"
      glowColor="rgba(239,68,68,0.4)"
    >
      {/* Preview */}
      <div className="relative rounded-[18px] overflow-hidden border border-[#1a1b22] bg-[#09090c]">
        {data.output ? (
          <>
            <img
              src={data.output}
              alt="cropped"
              className="w-full h-[190px] object-cover block"
            />

            {/* overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* label */}
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur text-[10px] text-white/80 border border-white/5">
              Cropped Output
            </div>
          </>
        ) : (
          <div className="h-[190px] flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#0d0d12] to-[#09090c]">
            <div className="w-14 h-14 rounded-2xl border border-[#23242d] bg-[#111218] flex items-center justify-center shadow-inner">
              <span className="text-xl opacity-60">✂️</span>
            </div>

            <div className="text-center">
              <p className="text-[11px] text-[#6d7080]">
                Connect an image
              </p>

              <p className="text-[9px] uppercase tracking-[0.22em] text-[#3d404d] mt-1">
                Crop Preview
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sliders */}
      <div className="mt-4 space-y-4">
        {sliders.map((s) => (
          <div key={s.key}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#6d7080]">
                {s.label}
              </span>

              <span className="text-[10px] text-white/70 font-mono">
                {data[s.key] ?? s.default}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={data[s.key] ?? s.default}
              onChange={(e) =>
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === id
                      ? {
                          ...n,
                          data: {
                            ...n.data,
                            [s.key]: Number(e.target.value),
                          },
                        }
                      : n
                  )
                )
              }
              className="
                nodrag
                w-full
                h-[2px]
                appearance-none
                rounded-full
                bg-[#1a1b22]
                accent-white
                cursor-pointer
              "
            />
          </div>
        ))}
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: "#ef4444",
          width: 10,
          height: 10,
          border: "2px solid #450a0a",
          boxShadow: "0 0 14px rgba(239,68,68,0.9)",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "#ef4444",
          width: 10,
          height: 10,
          border: "2px solid #450a0a",
          boxShadow: "0 0 14px rgba(239,68,68,0.9)",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      />
    </BaseNode>
  );
}