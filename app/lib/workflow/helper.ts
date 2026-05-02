import type { Node, Edge } from "reactflow";

/**
 * Build dependency map
 */
export function buildDependencyMap(
  nodes: Node[],
  edges: Edge[]
): Record<string, string[]> {
  const map: Record<string, string[]> = {};

  nodes.forEach((node) => {
    map[node.id] = [];
  });

  edges.forEach((edge) => {
    map[edge.target].push(edge.source);
  });

  return map;
}

/**
 * Get nodes ready for execution
 */
export function getReadyNodes(
  nodes: Node[],
  dependencies: Record<string, string[]>,
  completed: Set<string>
): Node[] {
  return nodes.filter((node) => {
    const deps = dependencies[node.id] || [];
    return deps.every((d) => completed.has(d)) && !completed.has(node.id);
  });
}