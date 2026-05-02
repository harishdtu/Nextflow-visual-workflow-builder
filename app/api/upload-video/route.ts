import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // ✅ Validate env at runtime (safer)
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
      process.env;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Server misconfigured (Cloudinary env missing)" },
        { status: 500 }
      );
    }

    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Invalid file" }, { status: 400 });
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Only video files allowed" },
        { status: 400 }
      );
    }

    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 50MB)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const upload: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "video",
            folder: "nextflow/videos",
            quality: "auto",
            fetch_format: "mp4", // normalize format
          },
          (err, result) => {
            if (err) return reject(err);
            if (!result) return reject(new Error("Upload failed"));
            resolve(result);
          }
        )
        .end(buffer);
    });

    // ✅ Return only useful fields
    return NextResponse.json({
      url: upload.secure_url,
      public_id: upload.public_id,
      duration: upload.duration,
      format: upload.format,
    });
  } catch (err: any) {
    console.error("UPLOAD ERROR:", err.message);

    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}