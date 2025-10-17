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

    // 1. まず確実に読み取れるQRコードを生成（高解像度、最大エラー訂正）
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width: 1024,
      margin: 4, // マージンを増やして読み取り性向上
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H", // 最高レベルのエラー訂正（30%まで復元可能）
    });

    // 2. QRコード構造を保持したアート画像を生成
    const styleModifier = getStyleModifier(styleType);

    // QRコードパターンを含むアート画像を直接生成
    const artPrompt = `Create a stunning artistic QR code featuring "${prompt}" that maintains perfect scannability.

🎯 ESSENTIAL QR CODE STRUCTURE (MUST BE PRESERVED):
- THREE large black squares in corners: top-left, top-right, bottom-left (finder patterns)
- One small black square in bottom-right corner (timing pattern)
- Grid of black and white squares throughout the image (data modules)
- Pure black (#000000) for all QR code elements
- Pure white (#FFFFFF) for background areas
- Sharp, clean edges on all geometric elements

🎨 ARTISTIC INTEGRATION - "${prompt}":
${styleModifier ? `Style: ${styleModifier}` : "Vibrant, high-contrast digital art"}
- Integrate "${prompt}" elements WITHIN the white spaces of the QR pattern
- Use the QR grid as a creative framework for artistic composition
- Add colors, textures, and details that enhance but never cover black QR modules
- Create visual harmony between geometric QR structure and organic art elements
- The "${prompt}" should appear to emerge from or dance around the QR pattern

🔧 TECHNICAL REQUIREMENTS:
- Maintain maximum contrast: pure black vs pure white
- Keep all QR code geometric patterns perfectly intact
- Artistic elements should fill white areas without bleeding into black modules
- Final result must be scannable by any QR code reader
- 1024x1024 resolution with crisp, clean lines

Think of this as creating a beautiful mosaic where "${prompt}" lives within the QR code's natural structure, like art growing through a geometric garden.`;

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

    // 4. 生成されたアート画像をダウンロードして検証
    const artImageResponse = await fetch(artImageUrl);
    const artImageBuffer = await artImageResponse.arrayBuffer();
    const artImageBase64 = Buffer.from(artImageBuffer).toString("base64");
    const artImageDataUrl = `data:image/png;base64,${artImageBase64}`;

    console.log("[artistic-qr] Art image processed successfully");

    return NextResponse.json({
      dataUrl: artImageDataUrl, // DALL-E生成のアートQRコード
      fallbackQR: qrCodeDataUrl, // フォールバック用の通常QRコード
      originalPrompt: prompt,
      qrText: text,
      styleType,
      actualQrCode: qrCodeDataUrl,
      fromCache: false,
      processingMethod: "dalle-integrated",
      // 読み取り性向上のためのメタデータ
      qrMetadata: {
        errorCorrectionLevel: "H",
        version: "auto",
        targetUrl: text,
        generationApproach: "artistic-integrated",
        note: "QRコードが読み取れない場合は、フォールバック用QRコードをご利用ください",
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
