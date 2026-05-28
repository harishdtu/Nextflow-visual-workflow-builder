"use client";

import React, { useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  useReactFlow,
  Edge,
  Node,
  Connection,
} from "reactflow";
import "reactflow/dist/style.css";

import TextNode  from "@/nodes/TextNode";
import LLMNode   from "@/nodes/LLMNode";
import ImageNode from "@/nodes/ImageNode";
import VideoNode from "@/nodes/VideoNode";
import CropNode  from "@/nodes/CropNode";
import FrameNode from "@/nodes/FrameNode";


// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & CONSTANTS  (all outside the component — never recreated)
// ═══════════════════════════════════════════════════════════════════════════════

type NodeData = {
  text?: string;
  output?: any;
  imageUrl?: string;
  videoUrl?: string;
  model?: string;
  loading?: boolean;
  cropX?: number;
  cropY?: number;
  cropW?: number;
  cropH?: number;
  timestamp?: string;
width?: number;
height?: number;
};

type HistoryEntry = { nodes: Node<NodeData>[]; edges: Edge[] };

const getId = () => crypto.randomUUID();

// ✅ Defined outside — never recreated, React Flow warning eliminated
const nodeTypes = {
  textNode:  TextNode,
  llmNode:   LLMNode,
  imageNode: ImageNode,
  videoNode: VideoNode,
  cropNode:  CropNode,
  frameNode: FrameNode,
};



const MINIMAP_NODE_COLOR: Record<string, string> = {
  textNode:  "#3b82f6",
  llmNode:   "#a855f7",
  imageNode: "#eab308",
  videoNode: "#10b981",
  cropNode:  "#ef4444",
  frameNode: "#06b6d4",
};

// ✅ Stable function reference outside component — fixes MiniMap re-render
const minimapNodeColor = (node: Node) =>
  MINIMAP_NODE_COLOR[node.type ?? ""] ?? "#6b7280";

const CONNECTION_RULES: Record<string, Record<string, string[]>> = {
  llmNode: {
    system:  ["textNode"],
    user:    ["textNode", "llmNode", "imageNode", "cropNode", "frameNode"],
    image: ["imageNode", "cropNode", "frameNode", "videoNode"],
    default: ["textNode", "llmNode", "imageNode", "cropNode", "frameNode", "videoNode"],
  },
  cropNode:  { default: ["imageNode", "cropNode"] },
  frameNode: { default: ["videoNode"] },
  textNode:  { default: ["textNode"] },
};

const DEFAULT_MODEL      = "gemini-2.0-flash";
const HISTORY_LIMIT      = 50;
const JPEG_QUALITY       = 0.92;
const MAX_URL_LOG_LENGTH = 60;

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS  (outside component — stable references)
// ═══════════════════════════════════════════════════════════════════════════════

const anyUrlToBase64 = (url: string): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!url) { reject(new Error("Empty URL")); return; }
    if (url.startsWith("data:")) { resolve(url); return; }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width  = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Failed to get canvas context");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Canvas conversion failed"));
      }
    };
    img.onerror = () =>
      reject(new Error(`Image load failed: ${url.slice(0, MAX_URL_LOG_LENGTH)}`));
    img.src = url;
  });

const videoFrameToBase64 = (url: string, timestamp: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.preload     = "metadata";
    video.muted       = true;
    video.playsInline = true;

    video.addEventListener("loadedmetadata", () => {
      try {
        let secs = String(timestamp).endsWith("%")
          ? (parseFloat(timestamp) / 100) * video.duration
          : parseFloat(timestamp) || 1;
        secs = Math.min(secs, video.duration - 0.01);

        video.addEventListener("seeked", () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width  = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Failed to get canvas context");
            ctx.drawImage(video, 0, 0);
            resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
          } catch (err) {
            reject(err instanceof Error ? err : new Error("Canvas conversion failed"));
          }
        }, { once: true });

        video.currentTime = secs;
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Video processing failed"));
      }
    }, { once: true });

    video.onerror = () =>
      reject(new Error(`Video load failed: ${url.slice(0, MAX_URL_LOG_LENGTH)}`));
    video.src = url;
  });

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function FlowCanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(
  []
);

  const { screenToFlowPosition, getNodes, getEdges } = useReactFlow();
  const wrapper = useRef<HTMLDivElement>(null);

  const past       = useRef<HistoryEntry[]>([]);
  const future     = useRef<HistoryEntry[]>([]);
  const isUndoRedo = useRef(false);
  useEffect(() => {
  setEdges((eds) =>
    eds.map((e) => ({
      ...e,
      type: "step",
      animated: false,

      style: {
        stroke: "#8b5cf6",
        strokeWidth: 2,
      },
    }))
  );
}, [setEdges]);

  // ── Undo / Redo ─────────────────────────────────────────────────────────────

  const saveSnapshot = useCallback(() => {
    if (isUndoRedo.current) return;
    past.current.push({ nodes: getNodes(), edges: getEdges() });
    if (past.current.length > HISTORY_LIMIT) past.current.shift();
    future.current = [];
  }, [getNodes, getEdges]);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    isUndoRedo.current = true;
    future.current.push({ nodes: getNodes(), edges: getEdges() });
    setNodes(prev.nodes);
    setEdges(prev.edges);
    setTimeout(() => { isUndoRedo.current = false; }, 0);
  }, [getNodes, getEdges, setNodes, setEdges]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    isUndoRedo.current = true;
    past.current.push({ nodes: getNodes(), edges: getEdges() });
    setNodes(next.nodes);
    setEdges(next.edges);
    setTimeout(() => { isUndoRedo.current = false; }, 0);
  }, [getNodes, getEdges, setNodes, setEdges]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
      if (e.key === "Delete" || e.key === "Backspace") {
        const active = document.activeElement;
        if (active?.tagName === "TEXTAREA" || active?.tagName === "INPUT") return;
        saveSnapshot();
        setNodes((nds) => nds.filter((n) => !n.selected));
        setEdges((eds) => eds.filter((e) => !e.selected));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, saveSnapshot, setNodes, setEdges]);

  // ── Connection ───────────────────────────────────────────────────────────────

  const isValidConnection = useCallback((connection: Connection) => {
    const all = getNodes();
    const src = all.find((n) => n.id === connection.source);
    const tgt = all.find((n) => n.id === connection.target);
    if (!src || !tgt) return false;
    const rules = CONNECTION_RULES[tgt.type!];
    if (!rules) return true;
    const hr = rules[connection.targetHandle || "default"] || rules["default"];
    if (!hr) return true;
    const ok = hr.includes(src.type!);
    if (!ok) console.warn(`❌ ${src.type} → ${tgt.type} (${connection.targetHandle}) not allowed`);
    return ok;
  }, [getNodes]);

const onConnect = useCallback((params: any) => {
  saveSnapshot();

  setEdges((eds) =>
    addEdge(
      {
        ...params,

        type: "step",

        animated: true,

        style: {
          stroke: "#8b5cf6",
          strokeWidth: 2,
          strokeDasharray: "6 6",
        },
      },
      eds
    )
  );
}, [setEdges, saveSnapshot]);

  // ── Drag & Drop ──────────────────────────────────────────────────────────────

  // ✅ Wrapped in useCallback — stable reference, no unnecessary re-renders
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("nodeType");
    if (!type) return;
    saveSnapshot();
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    setNodes((nds) => [
      ...nds,
      { id: getId(), type, position, data: { text: "", output: "", loading: false } as NodeData },
    ]);
  }, [saveSnapshot, screenToFlowPosition, setNodes]);

  // ✅ Wrapped in useCallback — stable reference
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  // ✅ Wrapped in useCallback — stable reference, avoids re-render on every state change
  const setNodeLoading = useCallback((nodeId: string, loading: boolean) =>
    setNodes((nds) =>
      nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, loading } } : n)
    ),
  [setNodes]);

  // ── Import / Export ──────────────────────────────────────────────────────────

  const exportWorkflow = useCallback(() => {
    const data = { nodes: getNodes(), edges: getEdges() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `workflow-${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [getNodes, getEdges]);

  const importWorkflow = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.nodes && data.edges) {
          saveSnapshot();
          setNodes(data.nodes);
          setEdges(
  data.edges.map((e: any) => ({
    ...e,
    type: "step",
  }))
);
        }
      } catch { alert("Invalid workflow JSON file"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [saveSnapshot, setNodes, setEdges]);

  // ── Workflow Execution ───────────────────────────────────────────────────────

  // ✅ Wrapped in useCallback — Run button won't cause all nodes to re-render
  const executeWorkflow = useCallback(async () => {
    const start     = Date.now();
    const allEdges  = getEdges();
    const nodeList  = getNodes() as Node<NodeData>[];
    const completed = new Map<string, any>();
    const nodeDetails: any[] = [];
    let   anyFailed = false;

    const process = async (node: Node<NodeData>): Promise<any> => {
  if (completed.has(node.id)) return completed.get(node.id);

  const incoming = allEdges.filter((e) => e.target === node.id);
  for (const edge of incoming) {
    const src = nodeList.find((n) => n.id === edge.source);
    if (src && !completed.has(src.id)) await process(src);
  }

  setNodeLoading(node.id, true);
  const t0 = Date.now();

  try {
    // ── TEXT NODE ──────────────────────────────────────────────────────────
    if (node.type === "textNode") {
      const textContent = node.data?.text || "";
      const result = { output: textContent, text: textContent };

      setNodeLoading(node.id, false);

      nodeDetails.push({
        nodeId: node.id,
        nodeType: "text",
        status: "success",
        duration: Date.now() - t0,
        input: { text: textContent },
        output: { text: textContent },
      });

      completed.set(node.id, result);
      return result;
    }

    // ── VIDEO NODE ─────────────────────────────────────────────────────────
    if (node.type === "videoNode") {
      const videoUrl = node.data?.videoUrl || node.data?.output || "";
      const result = { output: videoUrl, videoUrl };

      setNodeLoading(node.id, false);

      nodeDetails.push({
        nodeId: node.id,
        nodeType: "video",
        status: "success",
        duration: Date.now() - t0,
        input: { url: videoUrl },
        output: { url: videoUrl },
      });

      completed.set(node.id, result);
      return result;
    }

    // ── IMAGE NODE ─────────────────────────────────────────────────────────
    if (node.type === "imageNode") {
      const imageUrl = node.data?.imageUrl || "";
      const result = { output: imageUrl, imageUrl };

      setNodeLoading(node.id, false);

      nodeDetails.push({
        nodeId: node.id,
        nodeType: "image",
        status: "success",
        duration: Date.now() - t0,
        input: {
          url: imageUrl,
          width: node.data?.width,
          height: node.data?.height,
        },
        output: {
          imageUrl,
          width: node.data?.width,
          height: node.data?.height,
        },
      });

      completed.set(node.id, result);
      return result;
    }

    // ── LLM NODE ───────────────────────────────────────────────────────────
    if (node.type === "llmNode") {
      let userMessage = "";
      let images: string[] = [];
      const model = node.data?.model || DEFAULT_MODEL;

      for (const edge of incoming) {
        const src = nodeList.find((n) => n.id === edge.source);
        if (!src) continue;
        const srcOut = completed.get(src.id);

        if (["cropNode", "imageNode", "frameNode"].includes(src.type!)) {
          const raw = srcOut?.output || src.data?.imageUrl || src.data?.output;
          if (raw) images.push(await anyUrlToBase64(raw).catch(() => raw));
        }
        if (src.type === "textNode" && src.data?.text)
          userMessage += src.data.text + "\n";
        if (src.type === "llmNode") {
          const txt = srcOut?.output || src.data?.output;
          if (txt) userMessage += txt + "\n";
        }
      }

      const res = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage, images, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "LLM API failed");

      // ✅ API returns { output, text } — use whichever is present
      const llmText = data.output ?? data.text ?? "";

      const result = { output: llmText };
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, data: { ...n.data, output: llmText, loading: false } }
            : n
        )
      );

      nodeDetails.push({
        nodeId: node.id,
        nodeType: "llm",
        status: "success",
        duration: Date.now() - t0,
        model,
        input: {
          prompt: userMessage.trim(),
          frameIncluded: images.length > 0,
          // ✅ only save small thumbnail, not full base64
          frameThumbnail: images[0] || undefined,
        },
        output: {
          // ✅ save under BOTH keys so renderer always finds it
          text: llmText,
          output: llmText,
        },
      });

      completed.set(node.id, result);
      return result;
    }

    // ── CROP NODE ──────────────────────────────────────────────────────────
    if (node.type === "cropNode") {
      const src = nodeList.find((n) => n.id === incoming[0]?.source);
      if (!src) throw new Error("Crop node has no source connected");
      const raw =
        completed.get(src.id)?.output ||
        src.data?.imageUrl ||
        src.data?.output;
      if (!raw) throw new Error("Crop node source has no image output");

      const image = await anyUrlToBase64(raw).catch(() => raw);
      const cropInput = {
        x: node.data?.cropX ?? 0,
        y: node.data?.cropY ?? 0,
        width: node.data?.cropW ?? 100,
        height: node.data?.cropH ?? 100,
      };

      const res = await fetch("/api/crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: image,
          cropX: cropInput.x,
          cropY: cropInput.y,
          cropW: cropInput.width,
          cropH: cropInput.height,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Crop API failed");

      const result = { output: data.output };
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? {
                ...n,
                data: {
                  ...n.data,
                  imageUrl: data.output,
                  output: data.output,
                  loading: false,
                },
              }
            : n
        )
      );

      nodeDetails.push({
        nodeId: node.id,
        nodeType: "crop",
        status: "success",
        duration: Date.now() - t0,
        // ✅ input now included
        input: cropInput,
        output: { imageUrl: data.output },
      });

      completed.set(node.id, result);
      return result;
    }

    // ── FRAME NODE ─────────────────────────────────────────────────────────
    if (node.type === "frameNode") {
      const src = nodeList.find((n) => n.id === incoming[0]?.source);
      if (!src) throw new Error("Frame node has no source connected");
      const rawVideo =
        completed.get(src.id)?.output ||
        completed.get(src.id)?.videoUrl ||
        src.data?.output ||
        src.data?.videoUrl;
      if (!rawVideo) throw new Error("Frame node source has no video output");

      const timestamp = node.data?.timestamp || "1";
      let frameBase64 = "";

      if (rawVideo.startsWith("blob:") || rawVideo.startsWith("data:")) {
        frameBase64 = await videoFrameToBase64(rawVideo, timestamp);
      } else {
        const res = await fetch("/api/frame", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ video: rawVideo, timestamp }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Frame API failed");
        frameBase64 = data.output;
      }

      const result = { output: frameBase64, imageUrl: frameBase64 };
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? {
                ...n,
                data: {
                  ...n.data,
                  output: frameBase64,
                  imageUrl: frameBase64,
                  loading: false,
                },
              }
            : n
        )
      );

      nodeDetails.push({
        nodeId: node.id,
        nodeType: "extract frame",
        status: "success",
        duration: Date.now() - t0,
        // ✅ input now included
        input: {
          videoUrl: rawVideo.startsWith("data:")
            ? "[blob]"
            : rawVideo,
          timestamp,
        },
        output: {
          frameUrl: frameBase64,
          extractedTimestamp: timestamp,
        },
      });

      completed.set(node.id, result);
      return result;
    }

    // ── PASSTHROUGH (should not happen now) ────────────────────────────────
    setNodeLoading(node.id, false);
    completed.set(node.id, node.data);
    return node.data;

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`❌ Error in node ${node.id} (${node.type}):`, errorMessage);

    anyFailed = true;
    setNodeLoading(node.id, false);

    nodeDetails.push({
      nodeId: node.id,
      nodeType: node.type || "Node",
      status: "failed",
      duration: Date.now() - t0,
      error: errorMessage,
    });

    completed.set(node.id, { error: errorMessage });
    return { error: errorMessage };
  }
};

    try {
      await Promise.all(nodeList.map((node) => process(node)));
    } catch (err) {
      console.error("❌ WORKFLOW ERROR:", err);
      anyFailed = true;
    } finally {
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: anyFailed ? "failed" : "success",
          duration: Date.now() - start,
          nodeDetails,
        }),
      }).catch((err) => console.error("Failed to log history:", err));

      window.dispatchEvent(new Event("historyUpdated"));
    }
  }, [getNodes, getEdges, setNodes, setNodeLoading]);

  // ── Toolbar actions ──────────────────────────────────────────────────────────

  const deleteSelected = useCallback(() => {
    saveSnapshot();
    setNodes((n) => n.filter((x) => !x.selected));
    setEdges((e) => e.filter((x) => !x.selected));
  }, [saveSnapshot, setNodes, setEdges]);

  const clearAll = useCallback(() => {
    if (confirm("Clear entire workflow?")) {
      saveSnapshot();
      setNodes([]);
      setEdges([]);
    }
  }, [saveSnapshot, setNodes, setEdges]);

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════════

  return (
    <div
      className="w-full h-screen bg-[#0b0d12]"
      style={{ backgroundImage: "radial-gradient(#1f2937 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      ref={wrapper}
    >
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 flex-nowrap">
        <button
          onClick={executeWorkflow}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:scale-[1.03] transition-all text-white rounded-xl text-sm font-semibold shadow-lg whitespace-nowrap"
        >
          ▶ Run Workflow
        </button>
        <button onClick={undo} title="Undo (Ctrl+Z)" className="w-11 h-11 flex items-center justify-center bg-[#151515] border border-[#2d2d2d] text-white rounded-xl hover:bg-[#252525] transition">↩</button>
        <button onClick={redo} title="Redo (Ctrl+Y)" className="w-11 h-11 flex items-center justify-center bg-[#151515] border border-[#2d2d2d] text-white rounded-xl hover:bg-[#252525] transition">↪</button>
        <button onClick={deleteSelected} className="w-11 h-11 flex items-center justify-center bg-[#151515] border border-[#2d2d2d] text-gray-400 rounded-xl hover:bg-red-900/30 hover:text-red-400 hover:border-red-800 transition">🗑</button>
        <label className="px-4 py-2.5 bg-[#151515] border border-[#2d2d2d] text-gray-300 rounded-xl hover:bg-[#252525] hover:text-white transition text-sm cursor-pointer whitespace-nowrap">
          ⬆ Import
          <input type="file" accept=".json" onChange={importWorkflow} className="hidden" />
        </label>
        <button onClick={exportWorkflow} className="px-4 py-2.5 bg-[#151515] border border-[#2d2d2d] text-gray-300 rounded-xl hover:bg-[#252525] hover:text-white transition text-sm whitespace-nowrap">⬇ Export</button>
        <button onClick={clearAll} className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition text-sm whitespace-nowrap">Clear</button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
     
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        isValidConnection={isValidConnection}
        fitView
        deleteKeyCode={null}
      defaultEdgeOptions={{
  type: "step",
  animated: true,

  style: {
    stroke: "#8b5cf6",
    strokeWidth: 2,
    strokeDasharray: "6 6",
  },
}}

        snapToGrid
        snapGrid={[20, 20]}
        panOnDrag
        selectionOnDrag
        connectionLineStyle={{ stroke: "#8b5cf6", strokeWidth: 2 }}
      >
        <Background color="#1f2937" gap={20} />
        <Controls />
        {/* ✅ minimapNodeColor is a stable function reference defined outside the component */}
        <MiniMap
          nodeColor={minimapNodeColor}
          style={{ background: "#0e0e10", border: "1px solid #2a2a33" }}
          maskColor="rgba(0,0,0,0.7)"
          nodeStrokeWidth={0}
        />
      </ReactFlow>
    </div>
  );
}

export default function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
}