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

import TextNode from "@/nodes/TextNode";
import LLMNode from "@/nodes/LLMNode";
import ImageNode from "@/nodes/ImageNode";
import VideoNode from "@/nodes/VideoNode";
import CropNode from "@/nodes/CropNode";
import FrameNode from "@/nodes/FrameNode";
import CustomEdge from "./CustomEdge";

type NodeData = {
  text?: string;
  output?: any;
  imageUrl?: string;
  videoUrl?: string;
  model?: string;
  loading?: boolean;
};

const getId = () => crypto.randomUUID();

const nodeTypes = {
  textNode: TextNode,
  llmNode: LLMNode,
  imageNode: ImageNode,
  videoNode: VideoNode,
  cropNode: CropNode,
  frameNode: FrameNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const CONNECTION_RULES: Record<string, Record<string, string[]>> = {
  llmNode: {
    system: ["textNode"],
    user: ["textNode", "llmNode"],
    image: ["imageNode", "cropNode", "frameNode"],
    default: ["textNode", "llmNode", "imageNode", "cropNode", "frameNode"],
  },
  cropNode: {
    default: ["imageNode", "cropNode"],
  },
  frameNode: {
    default: ["videoNode"],
  },
  textNode: {
    default: ["textNode"],
  },
};

type HistoryEntry = { nodes: Node<NodeData>[]; edges: Edge[] };

function FlowCanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { screenToFlowPosition, getNodes, getEdges } = useReactFlow();
  const wrapper = useRef<HTMLDivElement>(null);

  const past = useRef<HistoryEntry[]>([]);
  const future = useRef<HistoryEntry[]>([]);
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
    setNodes(prev.nodes);
    setEdges(prev.edges);
    setTimeout(() => (isUndoRedo.current = false), 0);
  }, [getNodes, getEdges, setNodes, setEdges]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    isUndoRedo.current = true;
    past.current.push({ nodes: getNodes(), edges: getEdges() });
    setNodes(next.nodes);
    setEdges(next.edges);
    setTimeout(() => (isUndoRedo.current = false), 0);
  }, [getNodes, getEdges, setNodes, setEdges]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        const active = document.activeElement;
        if (active?.tagName === "TEXTAREA" || active?.tagName === "INPUT") return;
        saveSnapshot();
        setNodes((nds) => nds.filter((n) => !n.selected));
        setEdges((eds) => eds.filter((e) => !e.selected));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, saveSnapshot, setNodes, setEdges]);

  const isValidConnection = useCallback(
    (connection: Connection) => {
      const allNodes = getNodes();
      const sourceNode = allNodes.find((n) => n.id === connection.source);
      const targetNode = allNodes.find((n) => n.id === connection.target);
      if (!sourceNode || !targetNode) return false;

      const rules = CONNECTION_RULES[targetNode.type!];
      if (!rules) return true;

      const handleRules =
        rules[connection.targetHandle || "default"] || rules["default"];

      return handleRules.includes(sourceNode.type!);
    },
    [getNodes]
  );

  const onConnect = useCallback(
    (params: any) => {
      saveSnapshot();
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "custom",
            animated: true,
            style: { stroke: "#a855f7" },
          },
          eds
        )
      );
    },
    [setEdges, saveSnapshot]
  );

  return (
    <div className="w-full h-full bg-[#0b0d12] relative overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        fitView
        defaultEdgeOptions={{ type: "custom" }}
        snapToGrid
        snapGrid={[20, 20]}
        panOnDrag
        selectionOnDrag
        connectionLineStyle={{ stroke: "#8b5cf6", strokeWidth: 2 }}
      >
        <Background />
        <Controls />
        <MiniMap />
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