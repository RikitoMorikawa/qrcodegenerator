import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

// アートQRコード生成API
export async function POST(request: NextRequest) {
  try {
    const { text, prompt, styleType = "normal" } = await request.json();

    if (!text || !prompt) {
      return NextResponse.json({ error: "Text and prompt are required" }, { status: 400 });
    }

    // 1. まず確実に読み取れるQRコードを生成
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width: 1024,
      margin: 4,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H", // 最高レベルのエラー訂正
    });

    // 2. QRコード構造を保持したアート生成
    const styleModifier = getStyleModifier(styleType);

    // 読み取り性を最優先にしたバランス型プロンプト
    const artPrompt = `Create a QR code with subtle artistic elements inspired by: "${prompt}"

PRIORITY 1 - QR CODE FUNCTIONALITY (MUST PRESERVE):
- Standard black and white QR code structure
- Three corner detection squares: exact 7x7 black borders, white interior, black 3x3 center
- Perfect grid alignment of data modules
- High contrast black (#000000) and white (#FFFFFF) areas
- Clear timing patterns and alignment markers
- Proper quiet zone (white border)

PRIORITY 2 - SUBTLE ARTISTIC ENHANCEMENT:
Theme: ${prompt}
Style: ${styleModifier || "elegant and subtle"}

ALLOWED ARTISTIC MODIFICATIONS (MINIMAL):
✓ Corner squares: Add subtle decorative elements INSIDE the white areas only
✓ Data modules: Replace solid black squares with themed shapes (stars, dots, small icons) but maintain same size and contrast
✓ Background: Add very light artistic texture in white areas only (10-20% opacity)
✓ Colors: Use dark colors for "black" areas and light colors for "white" areas, maintaining high contrast

FORBIDDEN MODIFICATIONS:
✗ Do not change corner square positioning or size
✗ Do not merge or connect separate modules
✗ Do not add elements that cross module boundaries
✗ Do not reduce contrast below 70%
✗ Do not add text or complex graphics over QR structure

TECHNICAL SPECIFICATIONS:
- Maintain exact QR code proportions and grid
- Ensure all corner detection patterns are clearly defined
- Keep timing patterns visible and unobstructed
- Preserve module spacing and alignment
- Test-scannable appearance is essential

RESULT: A QR code that is 90% functional standard QR code + 10% subtle artistic enhancement with "${prompt}" theme.`;

    // 3. アートQRコードを生成
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

    // 4. 生成されたアート画像をダウンロード
    const artImageResponse = await fetch(artImageUrl);
    const artImageBuffer = await artImageResponse.arrayBuffer();
    const artImageBase64 = Buffer.from(artImageBuffer).toString("base64");
    const artDataUrl = `data:image/png;base64,${artImageBase64}`;

    // 読み取りテスト用の情報も含めて返す
    return NextResponse.json({
      dataUrl: artDataUrl, // メインはアートQRコード
      fallbackQR: qrCodeDataUrl, // フォールバック用の通常QRコード
      originalPrompt: prompt,
      qrText: text,
      styleType,
      actualQrCode: qrCodeDataUrl,
      fromCache: false,
      // 読み取り性向上のためのメタデータ
      qrMetadata: {
        errorCorrectionLevel: "H",
        version: "auto",
        targetUrl: text,
        generationApproach: "artistic-subtle",
      },
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
