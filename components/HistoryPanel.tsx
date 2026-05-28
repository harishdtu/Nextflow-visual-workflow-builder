"use client";

import { useEffect, useState } from "react";

interface NodeDetail {
  nodeId: string;
  nodeType: string;
  status: string;
  duration: number;
  input?: any;
  output?: any;
  error?: string;
  model?: string;
}

interface Run {
  id: string;
  status: string;
  duration: number;
  createdAt: string;
  nodeDetails?: NodeDetail[];
}

// ─── Shared sub-components ───────────────────────────────────────────────────

function IOLabel({ label, color, size = 9 }: { label: string; color: string; size?: number }) {
  return (
    <span className="font-medium uppercase tracking-widest" style={{ color, fontSize: size }}>
      {label}
    </span>
  );
}

function ScrollPre({ children, maxH = 160 }: { children: React.ReactNode; maxH?: number }) {
  return (
    <pre className="mono-pre" style={{ maxHeight: maxH, overflowY: "auto" }}>
      {children}
    </pre>
  );
}

function KV({ k, v, truncate, color }: { k: string; v: any; truncate?: boolean; color?: string }) {
  return (
    <div className="mono-row">
      <span className="mono-key">{k}</span>
      <span className="mono-val" style={{ color: color || undefined, overflow: truncate ? "hidden" : undefined, textOverflow: truncate ? "ellipsis" : undefined, whiteSpace: truncate ? "nowrap" : undefined }}>
        {String(v)}
      </span>
    </div>
  );
}

// Collapsible section — INPUT collapsed by default, OUTPUT expanded by default
function CollapsibleSection({
  label,
  color,
  children,
  defaultOpen = false,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 text-left w-full group"
      >
        <span className="font-medium uppercase tracking-widest" style={{ color, fontSize: 9 }}>
          {label}
        </span>
        <span className="text-[8px] ml-auto" style={{ color: color + "99" }}>
          {open ? "▲ hide" : "▼ show"}
        </span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

// ─── Input renderer ──────────────────────────────────────────────────────────

function renderNodeInput(nd: NodeDetail) {
  const type = nd.nodeType?.toLowerCase().replace("node", "").trim();
  const inp = nd.input;
  if (!inp) return null;

  let content: React.ReactNode = null;

  if (type === "text") {
    const textContent = inp.text || inp.prompt || inp.content || inp.value || "";
    if (!textContent) return null;
    content = <ScrollPre maxH={100}>{textContent}</ScrollPre>;
  } else if (type === "video") {
    const hasVideoData = inp.file || inp.size || inp.url || inp.videoUrl || inp.path;
    if (!hasVideoData) return null;
    content = (
      <div className="mono-block">
        {(inp.file || inp.path) && <KV k="file" v={inp.file || inp.path} />}
        {inp.size && <KV k="size" v={inp.size} />}
        {(inp.url || inp.videoUrl) && <KV k="url" v={(inp.url || inp.videoUrl).split("/").pop()} truncate />}
      </div>
    );
  } else if (type === "extract frame") {
    content = (
      <div className="mono-block">
        {(inp.videoUrl || inp.url) && <KV k="video" v={(inp.videoUrl || inp.url).split("/").pop()} truncate />}
        {inp.timestamp && <KV k="timestamp" v={inp.timestamp} />}
      </div>
    );
  } else if (type === "llm") {
    const promptText = inp.prompt || inp.message || inp.text || "";
    content = (
      <div className="flex flex-col gap-1">
        {promptText && <ScrollPre maxH={100}>{promptText}</ScrollPre>}
        {inp.frameThumbnail && inp.frameThumbnail !== "[base64-image]" ? (
          <div className="flex flex-col gap-1">
            <IOLabel label="Frame" color="#378add" size={8} />
            <img src={inp.frameThumbnail} alt="Frame" className="w-full rounded border border-[#16161e] object-cover" style={{ maxHeight: 60 }} />
          </div>
        ) : (inp.frameThumbnail === "[base64-image]" || inp.frameIncluded) ? (
          <div className="text-[9px] text-[#484858] bg-[#0a0a0e] border border-[#16161e] rounded px-2 py-1">
            🖼 Frame attached
          </div>
        ) : null}
      </div>
    );
  } else if (type === "crop") {
    content = (
      <div className="mono-block">
        {inp.x !== undefined && <KV k="x" v={inp.x} />}
        {inp.y !== undefined && <KV k="y" v={inp.y} />}
        {inp.width !== undefined && <KV k="width" v={inp.width} />}
        {inp.height !== undefined && <KV k="height" v={inp.height} />}
      </div>
    );
  } else if (type === "image") {
    content = (
      <div className="mono-block">
        {inp.url && <KV k="url" v={inp.url.split("/").pop()} truncate />}
        {inp.imageUrl && <KV k="imageUrl" v={inp.imageUrl.split("/").pop()} truncate />}
        {inp.width && <KV k="width" v={inp.width} />}
        {inp.height && <KV k="height" v={inp.height} />}
      </div>
    );
  } else {
    content = <ScrollPre maxH={80}>{typeof inp === "string" ? inp : JSON.stringify(inp, null, 2)}</ScrollPre>;
  }

  // INPUT is collapsed by default — saves space so OUTPUT is visible
  return (
    <CollapsibleSection label="Input" color="#378add" defaultOpen={false}>
      {content}
    </CollapsibleSection>
  );
}

// ─── Output renderer ─────────────────────────────────────────────────────────

function renderNodeOutput(nd: NodeDetail) {
  const type = nd.nodeType?.toLowerCase().replace("node", "").trim();
  const out = nd.output;
  if (!out) return null;

  let content: React.ReactNode = null;

  if (type === "text") {
    const textContent = out.text || out.output || out.content || out.value || "";
    if (!textContent) return null;
    content = <ScrollPre maxH={160}>{textContent}</ScrollPre>;
  } else if (type === "crop") {
    const imgSrc = out.imageUrl || out.url || out.image;
    content = imgSrc && imgSrc !== "[base64-image]"
      ? <img src={imgSrc} alt="Cropped" className="w-full rounded border border-[#16161e] object-cover" style={{ maxHeight: 90 }} />
      : <div className="text-[9px] text-[#484858] bg-[#0a0a0e] border border-[#16161e] rounded px-2 py-1">✂️ Crop result (image not stored)</div>;
  } else if (type === "image") {
    const imgSrc = out.imageUrl || out.url || out.image;
    content = (
      <div className="flex flex-col gap-1">
        {imgSrc && imgSrc !== "[base64-image]" && (
          <img src={imgSrc} alt="Image" className="w-full rounded border border-[#16161e] object-cover" style={{ maxHeight: 90 }} />
        )}
        <div className="mono-block">
          {out.width && <KV k="width" v={out.width} />}
          {out.height && <KV k="height" v={out.height} />}
        </div>
      </div>
    );
  } else if (type === "video") {
    const videoUrl = out.url || out.videoUrl || out.video;
    if (!videoUrl) return null;
    content = <div className="mono-block"><KV k="url" v={videoUrl.split("/").pop()} truncate /></div>;
  } else if (type === "extract frame") {
    const frameUrl = out.frameUrl || out.url || out.image;
    content = (
      <div className="flex flex-col gap-1">
        {frameUrl && frameUrl !== "[base64-image]"
          ? <img src={frameUrl} alt="Frame" className="w-full rounded border border-[#14301e] object-cover" style={{ maxHeight: 80 }} />
          : <div className="text-[9px] text-[#484858] bg-[#0a0a0e] border border-[#16161e] rounded px-2 py-1">🎬 Frame extracted (not stored)</div>
        }
        {(out.extractedTimestamp || out.timestamp) && (
          <div className="mono-block"><KV k="timestamp" v={out.extractedTimestamp || out.timestamp} color="#34d399" /></div>
        )}
      </div>
    );
  } else if (type === "llm") {
    let text = "";
    if (typeof out === "string") {
      text = out;
    } else {
      text = out.text || out.output || out.response || out.message || out.content || out.result
        || (out.data ? (typeof out.data === "string" ? out.data : JSON.stringify(out.data, null, 2)) : "")
        || JSON.stringify(out, null, 2);
    }
    if (!text) return null;
    // LLM output gets tall scroll area — most important content
    content = <ScrollPre maxH={240}>{text}</ScrollPre>;
  } else {
    content = <ScrollPre maxH={160}>{typeof out === "string" ? out : JSON.stringify(out, null, 2)}</ScrollPre>;
  }

  // OUTPUT is expanded by default — the main thing you want to see
  return (
    <CollapsibleSection label="Output" color="#22c55e" defaultOpen={true}>
      {content}
    </CollapsibleSection>
  );
}

// ─── NodeRow ─────────────────────────────────────────────────────────────────

function NodeRow({ nd }: { nd: NodeDetail }) {
  const [open, setOpen] = useState(false);

  const statusColor = nd.status === "success" ? "#22c55e" : nd.status === "failed" ? "#ef4444" : "#f59e0b";

  const nodeIcon: Record<string, string> = {
    text: "📝", image: "🖼️", crop: "✂️", video: "🎥", "extract frame": "🎬", llm: "🤖",
  };

  const normalizedType = nd.nodeType?.toLowerCase().replace("node", "").trim();
  const icon = nodeIcon[normalizedType] ?? "⬡";

  return (
    <div className="rounded-md border border-[#18181e] bg-[#0c0c10] overflow-hidden">
      <button
        className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-[#111116] transition-colors text-left"
        onClick={() => setOpen((p) => !p)}
      >
        <span className="text-[11px] flex-shrink-0">{icon}</span>
        <span className="text-[9px] text-[#6a6a82] bg-[#141420] border border-[#1e1e2a] rounded px-1.5 py-0.5 font-medium tracking-widest uppercase flex-shrink-0">
          {nd.nodeType}
        </span>
        <span className="text-[9px] font-medium capitalize ml-auto flex-shrink-0" style={{ color: statusColor }}>
          {nd.status}
        </span>
        <span className="text-[9px] text-[#2e2e3e] ml-1.5 flex-shrink-0">{nd.duration}ms</span>
        <span className="text-[10px] text-[#3e3e52] ml-1 flex-shrink-0">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-[#161620] px-2.5 py-2.5 flex flex-col gap-3">
          {nd.model && (
            <div className="flex flex-col gap-1">
              <IOLabel label="Model" color="#a78bfa" />
              <div className="text-[10px] bg-[#130f1e] border border-[#201a30] rounded px-2 py-1.5 text-purple-300 font-medium">
                {nd.model}
              </div>
            </div>
          )}

          {/* OUTPUT first — most important, expanded by default */}
          {renderNodeInput(nd)}

          {/* INPUT second — collapsed by default to save space */}
          {renderNodeOutput(nd)}

          {nd.error && (
            <div className="flex flex-col gap-1">
              <IOLabel label="Error" color="#ef4444" />
              <ScrollPre maxH={80}><span style={{ color: "#f87171" }}>{nd.error}</span></ScrollPre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── RunCard ─────────────────────────────────────────────────────────────────

function RunCard({ run, onDelete }: { run: Run; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);

  const dotColor = run.status === "success" ? "bg-emerald-500" : run.status === "failed" ? "bg-red-500" : "bg-amber-400";
  const borderColor = run.status === "success" ? "border-[#14301e]" : run.status === "failed" ? "border-[#301414]" : "border-[#2a2010]";
  const statusTextColor = run.status === "success" ? "text-emerald-400" : run.status === "failed" ? "text-red-400" : "text-amber-400";
  const nodeCount = run.nodeDetails?.length ?? 0;

  return (
    <div className={`rounded-lg border ${borderColor} bg-[#0f0f12] overflow-hidden`}>
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-[#111116] transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
        <div className="flex flex-col flex-1 min-w-0">
          <span className={`text-[10px] font-medium capitalize ${statusTextColor}`}>{run.status}</span>
          <span className="text-[9px] text-[#3e3e52]">
            {new Date(run.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            {" · "}
            <span className="text-[#2e2e3e]">{nodeCount} nodes</span>
          </span>
        </div>
        <span className="text-[9px] text-[#3a3a50] bg-[#161620] border border-[#1e1e2a] rounded px-1.5 py-0.5 flex-shrink-0">
          {run.duration}ms
        </span>
        <span className="text-[10px] text-[#3e3e52]">{open ? "▲" : "▼"}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(run.id); }}
          className="text-[#2e2e3e] hover:text-red-400 transition-colors ml-1 text-[12px] leading-none flex-shrink-0"
          aria-label="Delete run"
        >✕</button>
      </div>

      {open && (
        <div className="border-t border-[#161620] p-2 flex flex-col gap-1.5">
          {nodeCount > 0 ? (
            Array.from(
              new Map(run.nodeDetails!.map((nd) => [`${nd.nodeId}-${nd.nodeType}`, nd])).values()
            ).map((nd, i) => <NodeRow key={i} nd={nd} />)
          ) : (
            <div className="text-center text-[10px] text-[#2e2e3e] py-3">No node details available</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── CSS ─────────────────────────────────────────────────────────────────────

const STYLES = `
  .mono-block { background:#0a0a0e; border:1px solid #16161e; border-radius:5px; padding:6px 8px; display:flex; flex-direction:column; gap:3px; }
  .mono-row   { display:flex; gap:6px; align-items:baseline; }
  .mono-key   { font-size:9px; color:#484858; font-family:monospace; flex-shrink:0; min-width:56px; }
  .mono-val   { font-size:10px; color:#7a7a92; font-family:monospace; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .mono-pre   { font-size:10px; color:#7a7a92; background:#0a0a0e; border:1px solid #16161e; border-radius:5px; padding:7px 9px; font-family:monospace; white-space:pre-wrap; word-break:break-all; line-height:1.5; margin:0; }
  .mono-pre::-webkit-scrollbar { width:3px; }
  .mono-pre::-webkit-scrollbar-thumb { background:#2a2a3a; border-radius:2px; }
`;

// ─── Main panel ──────────────────────────────────────────────────────────────

export default function HistoryPanel({ onClose }: { onClose: () => void }) {
  const [runs, setRuns] = useState<Run[]>([]);

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
    const handler = () => fetchRuns();
    window.addEventListener("historyUpdated", handler);
    return () => window.removeEventListener("historyUpdated", handler);
  }, []);

  const deleteRun = async (id: string) => {
    try {
      await fetch(`/api/history/${id}`, { method: "DELETE" });
      setRuns((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="w-[300px] flex flex-col bg-[#0f0f12] border-l border-[#1c1c22] text-white h-full">
        <div className="flex items-center justify-between px-3.5 py-3 border-b border-[#1c1c22] flex-shrink-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-medium text-[#c8c8d8] uppercase tracking-widest">History</span>
            <span className="text-[9px] text-[#3e3e52]">{runs.length} runs</span>
          </div>
          <button
            onClick={onClose}
            className="w-[22px] h-[22px] flex items-center justify-center rounded border border-[#1e1e26] text-[#484858] hover:text-[#9a9aaa] hover:border-[#2e2e3a] transition-colors text-[13px]"
            aria-label="Close history panel"
          >✕</button>
        </div>

        <div
          className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#1e1e2a transparent" }}
        >
          {runs.length === 0 ? (
            <div className="text-center text-[#2e2e3e] text-[11px] mt-10 tracking-wide">No runs yet</div>
          ) : (
            runs.map((run) => <RunCard key={run.id} run={run} onDelete={deleteRun} />)
          )}
        </div>
      </div>
    </>
  );
}