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

    // 1. 余白を最小限にしたQRコードを生成（全面表示）
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width: 1024,
      margin: 2, // 最小限のマージンで全面表示
      color: {
        dark: "#000000", // 純粋な黒
        light: "#FFFFFF", // 純粋な白
      },
      errorCorrectionLevel: "H", // 最高レベルのエラー訂正（30%まで復元可能）
      type: "image/png",
      scale: 8, // 高解像度でシャープなエッジ
    });

    // 2. QRコード構造を保持したアート画像を生成
    const styleModifier = getStyleModifier(styleType);

    // 特化されたアートプロンプトを生成
    const { generateCatArtPrompt } = await import("@/utils/artPrompts");
    const artPrompt = generateCatArtPrompt(prompt, styleType);

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

    // 4. 生成されたアート画像をダウンロードして処理
    const artImageResponse = await fetch(artImageUrl);
    const artImageBuffer = await artImageResponse.arrayBuffer();
    const artImageBase64 = Buffer.from(artImageBuffer).toString("base64");
    const artImageDataUrl = `data:image/png;base64,${artImageBase64}`;

    console.log("[artistic-qr] Art image processed successfully");

    console.log("[artistic-qr] Returning data for client-side composition");

    return NextResponse.json({
      qrDataUrl: qrCodeDataUrl, // 通常のQRコード
      artDataUrl: artImageDataUrl, // 生成されたアート画像
      fallbackQR: qrCodeDataUrl, // フォールバック用の通常QRコード
      originalPrompt: prompt,
      qrText: text,
      styleType,
      actualQrCode: qrCodeDataUrl,
      fromCache: false,
      processingMethod: "client-side-composition",
      // 読み取り性向上のためのメタデータ
      qrMetadata: {
        errorCorrectionLevel: "H",
        version: "auto",
        targetUrl: text,
        generationApproach: "protected-client-composition",
        note: "クライアントサイドでQRコード構造を保護しながらアートを適用します",
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
