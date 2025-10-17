import { NextRequest, NextResponse } from "next/server";

// アートQRコード生成API
export async function POST(request: NextRequest) {
  try {
    const { text, prompt, styleType = "normal" } = await request.json();

    if (!text || !prompt) {
      return NextResponse.json({ error: "Text and prompt are required" }, { status: 400 });
    }

    // スタイル修飾子を追加
    const styleModifier = getStyleModifier(styleType);

    // アートQRコード生成用の詳細なプロンプト
    const enhancedPrompt = `Create a highly artistic and visually stunning QR code that seamlessly integrates: ${prompt}. 

REQUIREMENTS:
- Must maintain functional QR code structure with three corner detection squares
- Incorporate the theme "${prompt}" creatively into the QR pattern
- Use vibrant, rich colors and artistic elements
- The design should be beautiful enough to be art, but still scannable
- High contrast between light and dark areas for readability
- Creative interpretation of QR modules as artistic elements
${styleModifier ? `- Style: ${styleModifier}` : ""}

ARTISTIC ELEMENTS:
- Transform QR modules into thematic shapes, textures, or patterns
- Use gradients, shadows, and artistic effects
- Blend the subject matter naturally with QR structure
- Make it look like a masterpiece that happens to be a QR code

OUTPUT: High-resolution, colorful, artistic QR code that maintains scannability while being visually captivating.`;

    // OpenAI DALL-E 3を使用してアートQRコードを生成
    const artResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "hd", // 高品質で生成
        response_format: "url",
      }),
    });

    if (!artResponse.ok) {
      const errorData = await artResponse.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${artResponse.statusText} - ${errorData.error?.message || "Unknown error"}`);
    }

    const artData = await artResponse.json();
    const imageUrl = artData.data[0]?.url;

    if (!imageUrl) {
      throw new Error("No image generated from OpenAI");
    }

    // 画像をダウンロードしてBase64に変換
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to download generated image");
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const dataUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({
      dataUrl,
      originalPrompt: prompt,
      qrText: text,
      styleType,
      fromCache: false, // 新規生成
    });
  } catch (error) {
    console.error("Artistic QR generation error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to generate artistic QR code" }, { status: 500 });
  }
}

// スタイル修飾子を取得
function getStyleModifier(styleType: string): string {
  const styleModifiers: Record<string, string> = {
    normal: "",
    cute: "kawaii, cute style, adorable, soft features, pastel colors, charming",
    cool: "cool design, sleek, confident, bold colors, modern style, edgy",
    elegant: "elegant design, sophisticated, refined, graceful, classy, luxurious",
    playful: "playful style, fun, energetic, vibrant colors, cheerful, whimsical",
    retro: "retro style, vintage design, nostalgic, classic colors, old-school aesthetic",
  };

  return styleModifiers[styleType] || "";
}
