import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

// アートQRコード生成API（Sharpなしバージョン）
export async function POST(request: NextRequest) {
  console.log("[artistic-qr] POST handler called");

  try {
    const body = await request.json();
    console.log("[artistic-qr] Request body:", body);
    const { text, prompt, styleType = "normal" } = body;

    if (!text || !prompt) {
      return NextResponse.json({ error: "Text and prompt are required" }, { status: 400 });
    }

    console.log("[artistic-qr] Generating artistic QR without Sharp (Canvas-based approach)");

    // 1. まず確実に読み取れるQRコードを生成（高解像度）
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width: 1024,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H", // 最高レベルのエラー訂正（30%まで復元可能）
    });

    // 2. アート画像を生成（QRコードとは別に）
    const styleModifier = getStyleModifier(styleType);

    // プロンプトをシンプルに：テーマに沿った美しい背景画像を生成
    const artPrompt = `Create a beautiful, vibrant artistic background featuring: "${prompt}"

Style: ${styleModifier || "Vibrant, colorful, high-contrast digital art"}
Requirements:
- Rich, saturated colors with high contrast
- Detailed textures and patterns
- Professional digital artwork quality
- Abstract or stylized interpretation of "${prompt}"
- Suitable as a background for overlay composition
- High visual impact with depth and dimension

This will be used as an artistic background, so make it visually stunning and colorful!`;

    // 3. アート画像を生成
    const artResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: artPrompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        response_format: "url",
      }),
    });

    if (!artResponse.ok) {
      const errorData = await artResponse.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${artResponse.statusText} - ${errorData.error?.message || "Unknown error"}`);
    }

    const artData = await artResponse.json();
    const artImageUrl = artData.data[0]?.url;

    if (!artImageUrl) {
      throw new Error("No art image generated from OpenAI");
    }

    console.log("[artistic-qr] Art image generated successfully");

    // Sharpを使わずに、アート画像とQRコードを別々に提供
    // フロントエンドでCanvasを使って合成することも可能
    return NextResponse.json({
      dataUrl: artImageUrl, // メインはアート画像
      fallbackQR: qrCodeDataUrl, // フォールバック用の通常QRコード
      originalPrompt: prompt,
      qrText: text,
      styleType,
      actualQrCode: qrCodeDataUrl,
      fromCache: false,
      processingMethod: "canvas-based",
      // 読み取り性向上のためのメタデータ
      qrMetadata: {
        errorCorrectionLevel: "H",
        version: "auto",
        targetUrl: text,
        generationApproach: "artistic-separate",
      },
    });
  } catch (error) {
    console.error("[artistic-qr] Error occurred:", error);
    console.error("[artistic-qr] Error stack:", error instanceof Error ? error.stack : "No stack");
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to generate artistic QR code" }, { status: 500 });
  }
}

// Vercelで405エラーが出る場合のフォールバック
export async function GET() {
  return NextResponse.json({ error: "This endpoint only accepts POST requests" }, { status: 405 });
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
