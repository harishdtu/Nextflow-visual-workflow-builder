import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

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
      return NextResponse.json(
        { error: "No video URL" },
        { status: 400 }
      );
    }

    timestamp = String(timestamp).trim();

    // Convert % → seconds fallback
    if (timestamp.includes("%")) {
      const percent = parseInt(timestamp.replace("%", ""));
      const duration = 5; // fallback duration
      const sec = Math.max(1, Math.floor((percent / 100) * duration));
      timestamp = String(sec);
    }

    // Only support Cloudinary URLs
    if (videoUrl.includes("cloudinary.com")) {
      const match = videoUrl.match(
        /\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/
      );
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

    throw new Error("Only Cloudinary URLs supported");

  } catch (err: any) {
    console.error("FRAME ERROR:", err.message);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}