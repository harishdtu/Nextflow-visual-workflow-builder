import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("Missing GEMINI_API_KEY in .env.local");

const genAI = new GoogleGenerativeAI(apiKey);

const ALLOWED_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite-preview",
];

const schema = z.object({
  userMessage: z.string().optional().default(""),
  systemPrompt: z.string().optional().default(""),
  model: z.string().optional().default("gemini-2.5-flash"),
  images: z.array(z.string()).optional().default([]),
});

async function urlToBase64(url: string): Promise<string | null> {
  try {
    const optimized = url.includes("/upload/")
      ? url.replace("/upload/", "/upload/w_400,q_auto,f_jpg/")
      : url;
    const res = await fetch(optimized);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    return Buffer.from(buffer).toString("base64");
  } catch (err) {
    console.error("IMAGE FETCH ERROR:", err);
    return null;
  }
}

async function generateWithFallback(
  safeModel: string,
  systemPrompt: string,
  parts: any[]
) {
  const tryModel = async (modelName: string) => {
    const geminiModel = genAI.getGenerativeModel({
      model: modelName,
      ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
    });
    return geminiModel.generateContent({
      contents: [{ role: "user", parts }],
    });
  };

  try {
    return await tryModel(safeModel);
  } catch (err: any) {
    // 503 overload → auto-fallback to stable model
    if (
      err?.message?.includes("503") ||
      err?.message?.includes("unavailable") ||
      err?.message?.includes("high demand")
    ) {
      console.warn(`⚠️ ${safeModel} overloaded, falling back to gemini-2.0-flash`);
      return await tryModel("gemini-2.0-flash");
    }
    throw err;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { userMessage, systemPrompt, model, images } = parsed.data;
    const safeModel = ALLOWED_MODELS.includes(model) ? model : "gemini-2.0-flash";

    console.log("LLM BODY:", { userMessage, model: safeModel, imageCount: images.length });

    const parts: any[] = [];

    if (userMessage) {
      parts.push({ text: userMessage });
    }

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

      if (!base64) {
        console.warn("Skipping image, could not get base64 for:", img);
        continue;
      }

      parts.push({ inlineData: { mimeType: "image/jpeg", data: base64 } });
    }

    // ✅ Fixed: if truly nothing to send, require at least a placeholder
    if (parts.length === 0) {
      parts.push({ text: "(no input provided)" });
    }

    const result = await generateWithFallback(safeModel, systemPrompt, parts);

    if (!result?.response) throw new Error("No response from Gemini");

    const text = result.response.text();

    return NextResponse.json({ output: text, text });
  } catch (err: any) {
    console.error("LLM ERROR:", { message: err?.message, stack: err?.stack });
    return NextResponse.json(
      { error: err.message || "LLM failed" },
      { status: 500 }
    );
  }
}