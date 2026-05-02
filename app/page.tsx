"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative h-screen flex items-center justify-center bg-black text-white">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />

      <div className="relative text-center">
        <h1 className="text-2xl font-semibold mb-2">
          Build AI workflows visually 🚀
        </h1>
        <p className="text-gray-400 text-sm">
          Connect media, AI, and logic in one canvas
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          Go to Dashboard →
        </button>
        <div className="mt-8 flex gap-6 justify-center text-xs text-gray-400">
          <span>🧠 AI Nodes</span>
          <span>🎥 Video Processing</span>
          <span>✂️ Image Editing</span>
        </div>
      </div>
    </div>
  );
}