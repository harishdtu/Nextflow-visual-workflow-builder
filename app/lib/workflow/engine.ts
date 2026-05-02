import type { Node, Edge } from "reactflow";

function buildDependencyMap(
  nodes: Node[],
  edges: Edge[]
): Record<string, string[]> {
  const map: Record<string, string[]> = {};

  // initialize
  nodes.forEach((n) => {
    map[n.id] = [];
  });

  // fill dependencies
  edges.forEach((e) => {
    map[e.target].push(e.source);
  });

  return map;
}