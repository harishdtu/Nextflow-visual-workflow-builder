"use client";

import FlowCanvas from "@/components/FlowCanvas";

export default function DashboardPage() {
  return (
    <div className="h-full w-full flex">
      <div className="flex-1">
        <FlowCanvas />
      </div>
    </div>
  );
}