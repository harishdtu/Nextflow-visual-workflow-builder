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
import CustomEdge from "./CustomEdge";

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
};

const getId = () => crypto.randomUUID();

const nodeTypes = {
  textNode:  TextNode,
  llmNode:   LLMNode,
  imageNode: ImageNode,
  videoNode: VideoNode,
  cropNode:  CropNode,
  frameNode: FrameNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

// Color each node type distinctly in the MiniMap
const MINIMAP_NODE_COLOR: Record<string, string> = {
  textNode:  "#3b82f6", // blue
  llmNode:   "#a855f7", // purple
  imageNode: "#eab308", // yellow
  videoNode: "#10b981", // green
  cropNode:  "#ef4444", // red
  frameNode: "#06b6d4", // cyan
};

const minimapNodeColor = (node: Node) =>
  MINIMAP_NODE_COLOR[node.type ?? ""] ?? "#6b7280";

const CONNECTION_RULES: Record<string, Record<string, string[]>> = {
  llmNode:   {
    system:  ["textNode"],
    user:    ["textNode", "llmNode"],
    image:   ["imageNode", "cropNode", "frameNode"],
    default: ["textNode", "llmNode", "imageNode", "cropNode", "frameNode"],
  },
  cropNode:  { default: ["imageNode", "cropNode"] },
  frameNode: { default: ["videoNode"] },
  textNode:  { default: ["textNode"] },
};

type HistoryEntry = { nodes: Node<NodeData>[]; edges: Edge[] };

// ─── Converts ANY image URL (blob:, http:, data:) → base64 JPEG via canvas ───
const anyUrlToBase64 = (url: string): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!url) { reject(new Error("Empty URL")); return; }
    if (url.startsWith("data:")) { resolve(url); return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width  = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext("2d")?.drawImage(img, 0, 0);
      resolve(c.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => reject(new Error(`Image load failed: ${url.slice(0, 60)}`));
    img.src = url;
  });

// ─── Extracts a video frame client-side (works for blob: URLs) ───────────────
const videoFrameToBase64 = (url: string, timestamp: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.preload  = "metadata";
    video.muted    = true;
    video.playsInline = true;
    video.addEventListener("loadedmetadata", () => {
      let secs = String(timestamp).endsWith("%")
        ? (parseFloat(timestamp) / 100) * video.duration
        : parseFloat(timestamp) || 1;
      secs = Math.min(secs, video.duration - 0.01);
      video.addEventListener("seeked", () => {
        const c = document.createElement("canvas");
        c.width  = video.videoWidth;
        c.height = video.videoHeight;
        c.getContext("2d")?.drawImage(video, 0, 0);
        resolve(c.toDataURL("image/jpeg", 0.92));
      }, { once: true });
      video.currentTime = secs;
    });
    video.onerror = () => reject(new Error(`Video load failed: ${url.slice(0, 60)}`));
    video.src = url;
  });

// ─────────────────────────────────────────────────────────────────────────────

function FlowCanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { screenToFlowPosition, getNodes, getEdges } = useReactFlow();
  const wrapper = useRef<HTMLDivElement>(null);

  const past       = useRef<HistoryEntry[]>([]);
  const future     = useRef<HistoryEntry[]>([]);
  const isUndoRedo = useRef(false);

  const saveSnapshot = useCallback(() => {
    if (isUndoRedo.current) return;
    past.current.push({ nodes: getNodes(), edges: getEdges() });
    if (past.current.length > 50) past.current.shift();
    future.current = [];
  }, [getNodes, getEdges]);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    isUndoRedo.current = true;
    future.current.push({ nodes: getNodes(), edges: getEdges() });
    setNodes(prev.nodes); setEdges(prev.edges);
    setTimeout(() => { isUndoRedo.current = false; }, 0);
  }, [getNodes, getEdges, setNodes, setEdges]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    isUndoRedo.current = true;
    past.current.push({ nodes: getNodes(), edges: getEdges() });
    setNodes(next.nodes); setEdges(next.edges);
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

  const isValidConnection = useCallback((connection: Connection) => {
    const all  = getNodes();
    const src  = all.find((n) => n.id === connection.source);
    const tgt  = all.find((n) => n.id === connection.target);
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
      addEdge({ ...params, type: "custom", animated: true, style: { stroke: "#a855f7" } }, eds)
    );
  }, [setEdges, saveSnapshot]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("nodeType");
    if (!type) return;
    saveSnapshot();
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    setNodes((nds) => [
      ...nds,
      { id: getId(), type, position, data: { text: "", output: "", loading: false } as NodeData },
    ]);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const exportWorkflow = () => {
    const data = { nodes: getNodes(), edges: getEdges() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `workflow-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const importWorkflow = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.nodes && data.edges) { saveSnapshot(); setNodes(data.nodes); setEdges(data.edges); }
      } catch { alert("Invalid workflow JSON file"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const setNodeLoading = (nodeId: string, loading: boolean) =>
    setNodes((nds) =>
      nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, loading } } : n)
    );

  const executeWorkflow = async () => {
    const start     = Date.now();
    const allEdges  = getEdges();
    const nodeList  = getNodes() as Node<NodeData>[];
    const completed = new Map<string, any>();
    const nodeDetails: any[] = [];

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
        // ── LLM ────────────────────────────────────────────────────────────
        if (node.type === "llmNode") {
          let userMessage = "";
          let images: string[] = [];
          const model = node.data?.model || "gemini-2.0-flash";

          for (const edge of incoming) {
            const src    = nodeList.find((n) => n.id === edge.source);
            if (!src) continue;
            const srcOut = completed.get(src.id);
            if (["cropNode", "imageNode", "frameNode"].includes(src.type!)) {
              const raw = srcOut?.output || src.data?.imageUrl || src.data?.output;
              if (raw) images.push(await anyUrlToBase64(raw).catch(() => raw));
            }
            if (src.type === "textNode" && src.data?.text) userMessage += src.data.text + "\n";
            if (src.type === "llmNode") {
              const txt = srcOut?.output || src.data?.output;
              if (txt) userMessage += txt + "\n";
            }
          }

          const res  = await fetch("/api/llm", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userMessage, images, model }),
          });
          const data   = await res.json();
          const result = { output: data.output };
          setNodes((nds) =>
            nds.map((n) =>
              n.id === node.id ? { ...n, data: { ...n.data, output: data.output, loading: false } } : n
            )
          );
          nodeDetails.push({ nodeId: node.id, nodeType: "LLM Node", status: "success", duration: Date.now() - t0, output: data.output?.slice(0, 100) });
          completed.set(node.id, result);
          return result;
        }

        // ── CROP ───────────────────────────────────────────────────────────
        if (node.type === "cropNode") {
          const src = nodeList.find((n) => n.id === incoming[0]?.source);
          if (!src) { setNodeLoading(node.id, false); completed.set(node.id, {}); return {}; }
          const raw = completed.get(src.id)?.output || src.data?.imageUrl || src.data?.output;
          if (!raw) { setNodeLoading(node.id, false); completed.set(node.id, {}); return {}; }

          const image = await anyUrlToBase64(raw).catch(() => raw);
          const res   = await fetch("/api/crop", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: image, cropX: node.data?.cropX ?? 0, cropY: node.data?.cropY ?? 0, cropW: node.data?.cropW ?? 100, cropH: node.data?.cropH ?? 100 }),
          });
          const data   = await res.json();
          const result = { output: data.output };
          setNodes((nds) =>
            nds.map((n) =>
              n.id === node.id ? { ...n, data: { ...n.data, imageUrl: data.output, output: data.output, loading: false } } : n
            )
          );
          nodeDetails.push({ nodeId: node.id, nodeType: "Crop Node", status: "success", duration: Date.now() - t0 });
          completed.set(node.id, result);
          return result;
        }

        // ── FRAME ──────────────────────────────────────────────────────────
        if (node.type === "frameNode") {
          const src = nodeList.find((n) => n.id === incoming[0]?.source);
          if (!src) { setNodeLoading(node.id, false); completed.set(node.id, {}); return {}; }
          const rawVideo =
            completed.get(src.id)?.output  || completed.get(src.id)?.videoUrl ||
            src.data?.output               || src.data?.videoUrl;
          if (!rawVideo) { setNodeLoading(node.id, false); completed.set(node.id, {}); return {}; }

          const timestamp = node.data?.timestamp || "1";
          let frameBase64 = "";

          if (rawVideo.startsWith("blob:") || rawVideo.startsWith("data:")) {
            frameBase64 = await videoFrameToBase64(rawVideo, timestamp).catch(() => "");
          } else {
            const res   = await fetch("/api/frame", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ video: rawVideo, timestamp }),
            });
            frameBase64 = (await res.json()).output;
          }

          const result = { output: frameBase64 };
          setNodes((nds) =>
            nds.map((n) =>
              n.id === node.id ? { ...n, data: { ...n.data, output: frameBase64, loading: false } } : n
            )
          );
          nodeDetails.push({ nodeId: node.id, nodeType: "Frame Node", status: "success", duration: Date.now() - t0 });
          completed.set(node.id, result);
          return result;
        }

        // ── Passthrough ────────────────────────────────────────────────────
        setNodeLoading(node.id, false);
        nodeDetails.push({ nodeId: node.id, nodeType: node.type || "Node", status: "success", duration: Date.now() - t0 });
        completed.set(node.id, node.data);
        return node.data;

      } catch (err) {
        console.error(`Error in node ${node.id}:`, err);
        setNodeLoading(node.id, false);
        nodeDetails.push({ nodeId: node.id, nodeType: node.type || "Node", status: "failed", duration: Date.now() - t0 });
        completed.set(node.id, {});
        return {};
      }
    };

    try {
      await Promise.all(nodeList.map((node) => process(node)));
      await fetch("/api/history", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "success", duration: Date.now() - start, nodeDetails }),
      });
      window.dispatchEvent(new Event("historyUpdated"));
    } catch (err) {
      console.error("WORKFLOW ERROR:", err);
    }
  };

  return (
    <div
      className="w-full h-screen bg-[#0b0d12]"
      style={{ backgroundImage: "radial-gradient(#1f2937 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      ref={wrapper}
    >
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 items-center flex-wrap justify-center">
        <button onClick={executeWorkflow} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:scale-[1.03] transition-all text-white rounded-lg text-sm font-medium">
          ▶ Run Workflow
        </button>
        <button onClick={undo}  title="Undo (Ctrl+Z)" className="px-3 py-2 bg-[#1a1a1a] border border-[#333] text-white   rounded-lg hover:bg-[#252525] transition text-sm">↩</button>
        <button onClick={redo}  title="Redo (Ctrl+Y)" className="px-3 py-2 bg-[#1a1a1a] border border-[#333] text-white   rounded-lg hover:bg-[#252525] transition text-sm">↪</button>
        <button onClick={() => { saveSnapshot(); setNodes((n) => n.filter((x) => !x.selected)); setEdges((e) => e.filter((x) => !x.selected)); }}
          className="px-3 py-2 bg-[#1a1a1a] border border-[#333] text-gray-400 rounded-lg hover:bg-red-900/30 hover:text-red-400 hover:border-red-800 transition text-sm">🗑</button>
        <button onClick={exportWorkflow} className="px-3 py-2 bg-[#1a1a1a] border border-[#333] text-gray-400 rounded-lg hover:bg-[#252525] hover:text-white transition text-sm">⬇ Export</button>
        <label className="px-3 py-2 bg-[#1a1a1a] border border-[#333] text-gray-400 rounded-lg hover:bg-[#252525] hover:text-white transition text-sm cursor-pointer">
          ⬆ Import
          <input type="file" accept=".json" onChange={importWorkflow} className="hidden" />
        </label>
        <button
          onClick={() => { if (confirm("Clear entire workflow?")) { saveSnapshot(); setNodes([]); setEdges([]); } }}
          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
        >
          Clear
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        isValidConnection={isValidConnection}
        fitView
        deleteKeyCode={null}
        defaultEdgeOptions={{ type: "custom" }}
        snapToGrid
        snapGrid={[20, 20]}
        panOnDrag
        selectionOnDrag
        connectionLineStyle={{ stroke: "#8b5cf6", strokeWidth: 2 }}
      >
        <Background color="#1f2937" gap={20} />
        <Controls />
        {/* ✅ nodeColor function gives each type a distinct colour in the minimap */}
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