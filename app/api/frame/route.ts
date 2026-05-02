import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import os from "os";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let videoUrl: string = body.video;
    let timestamp = body.timestamp ?? "1";

    if (!videoUrl) {
      return NextResponse.json({ error: "No video provided" }, { status: 400 });
    }

    timestamp = String(timestamp).trim();

    // Convert % → seconds (basic fallback)
    if (timestamp.includes("%")) {
      const percent = parseInt(timestamp.replace("%", ""));
      const duration = 5; // fallback duration
      const sec = Math.max(1, Math.floor((percent / 100) * duration));
      timestamp = String(sec);
    }

    console.log("🎯 TIMESTAMP:", timestamp);

    // ✅ 1. Cloudinary path (preferred)
    if (videoUrl.includes("cloudinary.com")) {
      const match = videoUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
      const publicId = match?.[1];

      if (!publicId) {
        throw new Error("Invalid Cloudinary URL");
      }

      const frameUrl = cloudinary.url(publicId, {
        resource_type: "video",
        format: "jpg",
        transformation: [
          {
            start_offset: parseFloat(timestamp),
            width: 400,
            crop: "scale",
            quality: "auto",
          },
        ],
      });

      return NextResponse.json({ output: frameUrl });
    }

    // ⚠️ 2. Fallback: base64 video → ffmpeg
    if (videoUrl.startsWith("data:")) {
      const base64 = videoUrl.split(",")[1];
      const buffer = Buffer.from(base64, "base64");

      const tmpDir = os.tmpdir();
      const inputPath = path.join(tmpDir, `input_${Date.now()}.mp4`);
      const outputPath = path.join(tmpDir, `frame_${Date.now()}.jpg`);

      fs.writeFileSync(inputPath, buffer);

      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .seekInput(parseFloat(timestamp))
          .frames(1)
          .output(outputPath)
          .on("end", resolve)
          .on("error", reject)
          .run();
      });

      const file = fs.readFileSync(outputPath);

      // cleanup
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);

      return NextResponse.json({
        output: `data:image/jpeg;base64,${file.toString("base64")}`,
      });
    }

    throw new Error("Unsupported video format");
  } catch (err: any) {
    console.error("FRAME ERROR:", err.message);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}