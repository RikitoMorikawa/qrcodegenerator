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

    // 2. QRコードの詳細情報を取得
    const qrInfo = await QRCode.create(text, { errorCorrectionLevel: "H" });
    const modules = qrInfo.modules;
    const size = modules.size;

    // QRコードのパターンを文字列として表現
    let qrPattern = "";
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        qrPattern += modules.get(row, col) ? "█" : "░";
      }
      qrPattern += "\n";
    }

    // 2. QRコード構造を保持したアート生成
    const styleModifier = getStyleModifier(styleType);

    // 3. 添付画像のような高品質アートQRコード生成プロンプト
    const artPrompt = `Create a masterpiece artistic QR code featuring: "${prompt}"

REFERENCE STYLE: Like a beautiful digital artwork where "${prompt}" is seamlessly integrated into a functional QR code structure, similar to high-end generative art.

QR CODE STRUCTURE (MUST PRESERVE):
- ${size}×${size} precise grid layout
- Three corner detection squares: top-left, top-right, bottom-left (7×7 modules each)
- Each corner square: thick black border, white interior space, black center dot
- Data modules arranged in exact grid pattern for "${text}"
- Clear module separation and high contrast

ARTISTIC INTEGRATION FOR "${prompt}":
🎨 VISUAL STYLE: ${styleModifier || "Vibrant, detailed, professional digital art with rich textures"}
🎨 MAIN SUBJECT: Feature "${prompt}" as the central artistic element flowing through the QR structure
🎨 COLOR HARMONY: Use a rich palette with deep blues, vibrant oranges, purples, and teals
🎨 TEXTURE & DETAIL: Add intricate patterns, gradients, and artistic flourishes
🎨 DIMENSIONAL DEPTH: Create layers and depth that make the artwork pop

FUSION TECHNIQUE:
- Transform QR data modules into colorful geometric patterns and "${prompt}"-themed elements
- Make corner detection squares into ornate, decorative frames with artistic borders
- Let "${prompt}" imagery flow organically through white spaces while respecting QR boundaries
- Use pixelated/mosaic effects that honor the QR grid while being visually stunning
- Create seamless integration where technology and art become indistinguishable

COMPOSITION GOALS:
- The "${prompt}" should be the hero of the composition
- QR functionality preserved through strategic color and contrast choices
- Professional gallery-worthy artistic quality
- Perfect balance of recognition and beauty

TECHNICAL EXCELLENCE:
✓ Museum-quality digital artwork aesthetic
✓ Perfect QR code functionality for "${text}"
✓ High contrast maintained throughout
✓ Professional composition and color theory
✓ Scannable by any QR reader

Create a breathtaking fusion where "${prompt}" and QR code technology become one unified masterpiece!`;

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
