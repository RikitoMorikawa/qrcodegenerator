import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import sharp from "sharp";

// アートQRコード生成API
export async function POST(request: NextRequest) {
  try {
    const { text, prompt, styleType = "normal" } = await request.json();

    if (!text || !prompt) {
      return NextResponse.json({ error: "Text and prompt are required" }, { status: 400 });
    }

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

    // 4. 生成されたアート画像をダウンロード
    const artImageResponse = await fetch(artImageUrl);
    const artImageBuffer = await artImageResponse.arrayBuffer();

    // 5. QRコードとアート画像を合成（読み取り性重視、シンプルな方法）
    // QRコードをBase64からBufferに変換
    const qrBase64 = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
    const qrBuffer = Buffer.from(qrBase64, "base64");

    // アート画像を処理（明るく鮮やかに、より強く）
    const processedArt = await sharp(Buffer.from(artImageBuffer))
      .resize(1024, 1024, { fit: "cover" })
      .modulate({
        brightness: 1.6, // さらに明るく
        saturation: 1.8, // 彩度をさらに高く
      })
      .blur(3) // もう少しぼかしてQRパターンを際立たせる
      .toBuffer();

    // QRコードを強調（二値化して明確に、コントラストを強く）
    const qrEnhanced = await sharp(qrBuffer)
      .resize(1024, 1024)
      .threshold(128) // 二値化
      .linear(1.5, 0) // コントラストを強化
      .toBuffer();

    // シンプルにmultiplyブレンドで合成
    // アート画像にQRパターンを焼き込む形
    const composited = await sharp(processedArt)
      .composite([
        {
          input: qrEnhanced,
          blend: "multiply", // 乗算モード：QRの黒がアートを暗く、白は変化なし
        },
      ])
      .modulate({
        brightness: 1.4, // 最終的に明るさをさらに調整
        saturation: 1.3, // 彩度も補正
      })
      .sharpen({ sigma: 3 }) // さらに強くシャープ化して読み取り性向上
      .png()
      .toBuffer();

    const artDataUrl = `data:image/png;base64,${composited.toString("base64")}`;

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
