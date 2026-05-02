import { NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.imageUrl) {
      return NextResponse.json(
        { error: "Missing imageUrl" },
        { status: 400 }
      );
    }

    const base64 = body.imageUrl.split(",")[1];
    const buffer = Buffer.from(base64, "base64");

    // Get image dimensions
    const metadata = await sharp(buffer).metadata();
    const imgW = metadata.width || 100;
    const imgH = metadata.height || 100;

    // Convert percentage → pixels
    const xPct = parseFloat(body.x ?? body.cropX ?? 0) / 100;
    const yPct = parseFloat(body.y ?? body.cropY ?? 0) / 100;
    const wPct = parseFloat(body.width ?? body.cropW ?? 100) / 100;
    const hPct = parseFloat(body.height ?? body.cropH ?? 100) / 100;

    const left = Math.max(0, Math.round(imgW * xPct));
    const top = Math.max(0, Math.round(imgH * yPct));
    const width = Math.min(Math.round(imgW * wPct), imgW - left);
    const height = Math.min(Math.round(imgH * hPct), imgH - top);

    if (width <= 0 || height <= 0) {
      return NextResponse.json(
        { error: "Invalid crop dimensions" },
        { status: 400 }
      );
    }

    console.log("CROP:", { left, top, width, height });

    const cropped = await sharp(buffer)
      .extract({ left, top, width, height })
      .jpeg()
      .toBuffer();

    return NextResponse.json({
      output: `data:image/jpeg;base64,${cropped.toString("base64")}`,
    });
  } catch (err: any) {
    console.error("CROP ERROR:", err.message);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}