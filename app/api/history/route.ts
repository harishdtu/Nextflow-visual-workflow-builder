import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Strip base64 image data before saving to DB — keeps history lean
function sanitizeNodeDetails(nodeDetails: any[]): any[] {
  return nodeDetails.map((nd) => ({
    ...nd,
    input: nd.input
      ? {
          ...nd.input,
          // Replace full base64 thumbnail with a placeholder
          frameThumbnail: nd.input.frameThumbnail
            ? nd.input.frameThumbnail.startsWith("data:")
              ? "[base64-image]"
              : nd.input.frameThumbnail
            : undefined,
        }
      : undefined,
    output: nd.output
      ? {
          ...nd.output,
          // Replace full base64 frame with a placeholder
          frameUrl: nd.output.frameUrl
            ? nd.output.frameUrl.startsWith("data:")
              ? "[base64-image]"
              : nd.output.frameUrl
            : undefined,
          // Replace base64 imageUrl with placeholder
          imageUrl: nd.output.imageUrl
            ? nd.output.imageUrl.startsWith("data:")
              ? "[base64-image]"
              : nd.output.imageUrl
            : undefined,
        }
      : undefined,
  }));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const sanitized = body.nodeDetails
      ? sanitizeNodeDetails(body.nodeDetails)
      : null;

    const run = await prisma.run.create({
      data: {
        status: body.status || "success",
        duration: body.duration || 0,
        nodeDetails: sanitized ? JSON.stringify(sanitized) : null,
      },
    });

    return NextResponse.json(run);
  } catch (err: any) {
    console.error("DB ERROR:", err);
    return NextResponse.json(
      { error: "DB unavailable, run not saved" },
      { status: 503 }
    );
  }
}

export async function GET() {
  try {
    const runs = await prisma.run.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const parsed = runs.map((run: any) => ({
      ...run,
      nodeDetails: run.nodeDetails ? JSON.parse(run.nodeDetails) : [],
    }));

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("GET ERROR:", err);
    return NextResponse.json([]);
  }
}