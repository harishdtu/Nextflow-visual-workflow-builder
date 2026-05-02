import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const run = await prisma.run.create({
      data: {
        status: body.status || "success",
        duration: body.duration || 0,
        nodeDetails: body.nodeDetails ? JSON.stringify(body.nodeDetails) : null,
      },
    });

    return NextResponse.json(run);
  } catch (err) {
    console.error("DB ERROR:", err);
    return NextResponse.json({ error: "DB failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const runs = await prisma.run.findMany({
      orderBy: { createdAt: "desc" },
    });

    const parsed = runs.map((run: any) => ({
      ...run,
      nodeDetails: run.nodeDetails ? JSON.parse(run.nodeDetails) : [],
    }));

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("GET ERROR:", err);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}