import type { Node } from "reactflow";

type NodeData = {
  text?: string;
  value?: string;
};

export async function runNode(
  node: Node<NodeData>,
  inputs: any[]
): Promise<any> {
  // 📝 TEXT NODE
  if (node.type === "textNode") {
    return node.data?.text || node.data?.value || "";
  }

  // 🤖 LLM NODE
  if (node.type === "llmNode") {
    const userMessage =
      (inputs && inputs.length > 0 ? inputs.join(" ") : "") ||
      node.data?.text ||
      "";

    const res = await fetch("/api/llm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userMessage,
      }),
    });

    const data = await res.json();

    return data?.output || "No response";
  }

  return null;
}