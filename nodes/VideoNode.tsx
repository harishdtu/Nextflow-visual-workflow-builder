"use client";

import { Handle, Position, useReactFlow } from "reactflow";
import BaseNode from "@/components/BaseNode";
import { useRef, useState, useEffect, useCallback } from "react";

export default function VideoNode({ id, data }: any) {
  const { setNodes, getEdges } = useReactFlow();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [extracting, setExtracting] = useState(false);

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, videoUrl: null, uploading: true } }
          : n
      )
    );

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-video", { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");

      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? {
                ...n,
                data: {
                  ...n.data,
                  videoUrl: result.url,
                  output: result.url,
                  uploading: false,
                  timestamp: "10",
                },
              }
            : n
        )
      );
    } catch {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, uploading: false } } : n
        )
      );
    }
    e.target.value = "";
  };

  const extractAndBroadcast = useCallback(
    async (timestamp: string) => {
      const video = videoRef.current;
      if (!video || !data.videoUrl) return;

      setExtracting(true);
      try {
        // Wait for metadata if not ready
        if (!video.duration || isNaN(video.duration)) {
          await new Promise<void>((resolve) => {
            const handler = () => {
              video.removeEventListener("loadedmetadata", handler);
              resolve();
            };
            video.addEventListener("loadedmetadata", handler);
            // If already loaded, fire immediately
            if (video.readyState >= 1) resolve();
          });
        }

        const percent = parseFloat(timestamp) / 100;
        const seconds = Math.min(
          (video.duration || 0) * percent,
          (video.duration || 0) - 0.05
        );

        video.currentTime = seconds;

        await new Promise<void>((resolve) => {
          const handler = () => {
            video.removeEventListener("seeked", handler);
            resolve();
          };
          video.addEventListener("seeked", handler);
        });

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(video, 0, 0);
        const frameUrl = canvas.toDataURL("image/jpeg", 0.85);
const connectedFrameIds = getEdges()
  .filter(
    (e) =>
      e.source === id
  )
  .map((e) => e.target);

setNodes((nds) =>
  nds.map((n) => {
    // update video node
    if (n.id === id) {
      return {
        ...n,
        data: {
          ...n.data,
          extractedFrame: frameUrl,
          extractedTimestamp: `${timestamp}%`,
        },
      };
    }

    // update ONLY connected frame nodes
    if (
      connectedFrameIds.includes(n.id) &&
      n.type === "frameNode"
    ) {
      return {
        ...n,
        data: {
          ...n.data,
          extractedFrame: frameUrl,
          extractedTimestamp: `${timestamp}%`,
          output: frameUrl,
        },
      };
    }

    return n;
  })
);
      } catch (err) {
        console.error("Frame extraction failed:", err);
      } finally {
        setExtracting(false);
      }
    },
   [data.videoUrl, id, setNodes, getEdges] 
  );

  // Debounced extraction on timestamp change
  useEffect(() => {
    if (!data.videoUrl || !data.timestamp) return;
    const timer = setTimeout(() => {
      extractAndBroadcast(data.timestamp);
    }, 250);
    return () => clearTimeout(timer);
  }, [data.timestamp, data.videoUrl]);

  const timestampNum = parseInt(data.timestamp || "10", 10);

  return (
    <BaseNode
      title="Video"
      icon="🎥"
      loading={data.uploading || extracting}
      glowColor="rgba(34,197,94,0.4)"
    >
      {/* Hidden video for frame extraction */}
      <video
        ref={videoRef}
        src={data.videoUrl}
        crossOrigin="anonymous"
        preload="metadata"
        style={{ display: "none" }}
      />

      {/* Upload / Preview */}
      <label className="block cursor-pointer">
        {data.videoUrl ? (
          <video
            key={data.videoUrl}
            src={data.videoUrl}
            className="w-full h-[140px] object-contain rounded-lg border border-[#1e1e26] bg-black"
            controls
            crossOrigin="anonymous"
          />
        ) : (
          <div className="border border-dashed border-[#1e1e2a] rounded-lg h-[80px] flex flex-col items-center justify-center gap-1.5 hover:border-[#2e2e3a] transition-colors bg-[#0a0a0d]">
            {data.uploading ? (
              <span className="text-[11px] text-emerald-400 animate-pulse tracking-wide">
                Uploading…
              </span>
            ) : (
              <>
                <span className="text-base opacity-50">🎥</span>
                <span className="text-[9px] text-[#3a3a50] tracking-widest lowercase">
                  mp4 · mov · webm
                </span>
              </>
            )}
          </div>
        )}
        <input type="file" accept="video/*" onChange={handleUpload} className="hidden" />
      </label>

      {data.videoUrl && (
        <label className="block cursor-pointer mt-1">
          <div className="text-center text-[9px] text-[#383848] hover:text-[#565668] transition-colors py-0.5 tracking-wide">
            Replace video
          </div>
          <input type="file" accept="video/*" onChange={handleUpload} className="hidden" />
        </label>
      )}

      {/* Scrubber */}
      {data.videoUrl && (
        <div className="mt-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] text-[#484858] lowercase tracking-widest">
              Frame at
            </span>
            <span className="text-[9px] text-emerald-400 font-medium">
              {timestampNum}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={timestampNum}
            onChange={(e) =>
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === id
                    ? { ...n, data: { ...n.data, timestamp: e.target.value } }
                    : n
                )
              )
            }
            className="nodrag w-full cursor-pointer accent-emerald-500"
          />
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
    top: "50%",
    transform: "translateY(-50%)",
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
    top: "50%",
    transform: "translateY(-50%)",
  }}
/>
    </BaseNode>
  );
}