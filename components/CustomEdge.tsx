"use client";

import { BaseEdge, getBezierPath } from "reactflow";

export default function CustomEdge(props: any) {
  const [path] = getBezierPath(props);

  return (
    <>
      {/* Glow */}
      <path
        d={path}
        stroke="#8b5cf6"
        strokeWidth={6}
        fill="none"
        opacity={0.15}
      />

      {/* Animated line */}
      <path
        d={path}
        stroke="#8b5cf6"
        strokeWidth={2}
        fill="none"
        strokeDasharray="6 6"
        className="animate-flow"
      />
    </>
  );
}