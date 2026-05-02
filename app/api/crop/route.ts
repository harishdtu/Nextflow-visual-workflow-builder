import { NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const base64 = body.imageUrl.split(",")[1];
    const buffer = Buffer.from(base64, "base64");

    // Get image dimensions
    const metadata = await sharp(buffer).metadata();
    const imgW = metadata.width || 100;
    const imgH = metadata.height || 100;

    // Convert percentage (0–100) → pixels
    const xPct = parseFloat(body.x ?? body.cropX ?? 0) / 100;
    const yPct = parseFloat(body.y ?? body.cropY ?? 0) / 100;
    const wPct = parseFloat(body.width ?? body.cropW ?? 100) / 100;
    const hPct = parseFloat(body.height ?? body.cropH ?? 100) / 100;

    const left = Math.round(imgW * xPct);
    const top = Math.round(imgH * yPct);
    const width = Math.min(Math.round(imgW * wPct), imgW - left);
    const height = Math.min(Math.round(imgH * hPct), imgH - top);

    const cropped = await sharp(buffer)
      .extract({ left, top, width, height })
      .jpeg()
      .toBuffer();

    return NextResponse.json({
      output: `data:image/jpeg;base64,${cropped.toString("base64")}`,
    });

  } catch (err: any) {
    console.error("CROP ERROR:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}