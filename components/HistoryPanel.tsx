"use client";

import { useEffect, useState } from "react";

interface NodeDetail {
  nodeId: string;
  nodeType: string;
  status: string;
  duration: number;
  output?: string;
}

interface Run {
  id: string;
  status: string;
  duration: number;
  createdAt: string;
  nodeDetails?: NodeDetail[];
}

export default function HistoryPanel({ onClose }: { onClose: () => void }) {
  const [runs, setRuns] = useState<Run[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchRuns = async () => {
    try {
      const res = await fetch("/api/history", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setRuns(data);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    fetchRuns();

    const interval = setInterval(fetchRuns, 3000);

    const handler = () => fetchRuns();
    window.addEventListener("historyUpdated", handler);

    return () => {
      clearInterval(interval);
      window.removeEventListener("historyUpdated", handler);
    };
  }, []);

  const deleteRun = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/history/${id}`, { method: "DELETE" });
      setRuns((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const statusColor = (status: string) => {
    if (status === "success") return "text-green-400";
    if (status === "failed") return "text-red-400";
    return "text-yellow-400";
  };

  const statusBg = (status: string) => {
    if (status === "success") return "bg-green-400/10 border-green-400/20";
    if (status === "failed") return "bg-red-400/10 border-red-400/20";
    return "bg-yellow-400/10 border-yellow-400/20";
  };

  return (
    <div className="w-64 flex flex-col bg-[#0f0f0f] border-l border-[#222] text-white relative">

      {/* CLOSE BUTTON */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-white z-10"
      >
        ✕
      </button>

      {/* HEADER */}
      <div className="p-4 border-b border-[#222]">
        <h2 className="text-sm font-semibold text-white">History</h2>
        <p className="text-xs text-gray-500 mt-0.5">{runs.length} runs</p>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {runs.length === 0 ? (
          <div className="text-center text-gray-600 text-xs mt-8">
            No runs yet
          </div>
        ) : (
          runs.map((run) => (
            <div
              key={run.id}
              className={`rounded-lg border cursor-pointer transition-all ${statusBg(run.status)}`}
              onClick={() => toggleExpand(run.id)}
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold ${statusColor(run.status)}`}>
                    {run.status}
                  </span>

                  <button
                    onClick={(e) => deleteRun(run.id, e)}
                    className="text-gray-600 hover:text-red-400 text-xs px-1"
                    title="Delete run"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-xs text-gray-400">
                  {new Date(run.createdAt).toLocaleTimeString()}
                </div>

                <div className="text-xs text-gray-500">{run.duration} ms</div>

                <div className="text-xs text-gray-600 mt-1">
                  {expandedId === run.id ? "▲ hide details" : "▼ show details"}
                </div>
              </div>

              {/* DETAILS */}
              {expandedId === run.id && (
                <div className="border-t border-[#333] p-2 space-y-1">
                  {run.nodeDetails && run.nodeDetails.length > 0 ? (
                    run.nodeDetails.map((nd, i) => (
                      <div key={i} className="bg-[#1a1a1a] rounded p-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 font-medium">{nd.nodeType}</span>
                          <span className={statusColor(nd.status)}>{nd.status}</span>
                        </div>

                        <div className="text-gray-500">{nd.duration}ms</div>

                        {nd.output && (
                          <div
                            className="text-gray-400 mt-1 truncate"
                            title={nd.output}
                          >
                            → {nd.output.slice(0, 60)}...
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-600 text-center py-2">
                      No node details available
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}