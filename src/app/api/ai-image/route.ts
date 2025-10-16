import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = (await req.json()) as { prompt?: string };
    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    // Use Images API to generate small square logo-like image
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `${prompt}. Detective-style black cat mascot, wearing fedora hat and trench coat, holding a magnifying glass, winking, simple flat logo, centered, high contrast, no text, vector-like.`,
      size: "1024x1024",
      // Some SDK versions don't accept background. Keep defaults.
      // response_format defaults to b64_json
    } as any);

    const b64 = result.data[0]?.b64_json;
    if (!b64) {
      return NextResponse.json({ error: "no image" }, { status: 500 });
    }

    const dataUrl = "data:image/png;base64," + b64;
    return NextResponse.json({ dataUrl });
  } catch (e: any) {
    console.error("/api/ai-image error", e?.message || e);
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}
