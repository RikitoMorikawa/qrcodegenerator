import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// 簡単なメモリキャッシュ（本番環境ではRedisなどを使用）
const imageCache = new Map<string, string>();

export async function POST(req: NextRequest) {
  try {
    const { prompt } = (await req.json()) as { prompt?: string };
    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    // キャッシュチェック
    const cacheKey = `img_${Buffer.from(prompt).toString("base64")}`;
    if (imageCache.has(cacheKey)) {
      return NextResponse.json({ dataUrl: imageCache.get(cacheKey) });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    // Use Images API to generate small square logo-like image
    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${prompt}. Cute round kawaii black cat character, big round eyes, soft rounded features, chubby cheeks, wearing detective hat, holding magnifying glass, adorable smile, chibi style, transparent background, simple flat design, pastel colors, no text, icon style.`,
      size: "1024x1024",
      quality: "standard", // 高速化のためstandardを使用
      response_format: "b64_json",
    });

    if (!result.data || result.data.length === 0) {
      return NextResponse.json({ error: "no image data" }, { status: 500 });
    }

    const b64 = result.data[0]?.b64_json;
    if (!b64) {
      return NextResponse.json({ error: "no image" }, { status: 500 });
    }

    const dataUrl = "data:image/png;base64," + b64;

    // キャッシュに保存（メモリ使用量制限）
    if (imageCache.size < 50) {
      imageCache.set(cacheKey, dataUrl);
    }

    return NextResponse.json({ dataUrl });
  } catch (e: unknown) {
    const error = e as Error;
    console.error("/api/ai-image error", error?.message || e);
    return NextResponse.json({ error: error?.message || "failed" }, { status: 500 });
  }
}
