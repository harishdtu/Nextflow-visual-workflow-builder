import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const ALLOWED_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite-preview",
  "gemini-2.5-flash-preview-tts",
];

const schema = z.object({
  userMessage: z.string().optional().default(""),
  systemPrompt: z.string().optional().default(""),
  model: z.string().optional().default("gemini-2.0-flash"),
  images: z.array(z.string()).optional().default([]),
});

// 🔥 URL → BASE64 helper
async function urlToBase64(url: string) {
  try {
    const optimized = url.includes("/upload/")
      ? url.replace("/upload/", "/upload/w_400,q_auto,f_jpg/")
      : url;

    const res = await fetch(optimized);
    const buffer = await res.arrayBuffer();

    return Buffer.from(buffer).toString("base64");
  } catch (err) {
    console.error("IMAGE FETCH ERROR:", err);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { userMessage, systemPrompt, model, images } = parsed.data;

    const safeModel = ALLOWED_MODELS.includes(model)
      ? model
      : "gemini-2.0-flash";

    console.log("LLM BODY:", {
      userMessage,
      model: safeModel,
      images: images.length,
    });

    const parts: any[] = [];

    if (userMessage) {
      parts.push({ text: userMessage });
    }

    // 🔥 Image handling (URL + base64)
    for (const img of images) {
      if (!img) continue;

      let base64: string | null = null;

      if (img.startsWith("data:image")) {
        base64 = img.split(",")[1];
      } else if (img.startsWith("http")) {
        base64 = await urlToBase64(img);
      } else {
        base64 = img;
      }

      if (!base64) continue;

      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64,
        },
      });
    }

    const geminiModel = genAI.getGenerativeModel({
      model: safeModel,
      ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
    });

    const result = await geminiModel.generateContent({
      contents: [
        {
          role: "user",
          parts,
        },
      ],
    });

    const text = result.response.text();

    return NextResponse.json({ output: text });
  } catch (err: any) {
    console.error("LLM ERROR:", err);
    return NextResponse.json(
      { error: err.message || "LLM failed" },
      { status: 500 }
    );
  }
}