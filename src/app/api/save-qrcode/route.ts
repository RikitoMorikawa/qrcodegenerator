import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { qrDataUrl, qrInfo, isPublic = true } = await req.json();

    if (!qrDataUrl || !qrInfo) {
      return NextResponse.json({ error: "qrDataUrl and qrInfo are required" }, { status: 400 });
    }

    // Base64データからファイルデータを抽出
    const base64Data = qrDataUrl.replace(/^data:image\/[a-z]+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // ファイル名を生成
    const fileName = `qr-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    const filePath = `qr-codes/${fileName}`;

    // Supabase Storageにアップロード
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage.from("images").upload(filePath, buffer, {
      contentType: "image/png",
      upsert: false,
    });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload QR code" }, { status: 500 });
    }

    // 公開URLを取得
    const { data: urlData } = supabaseAdmin.storage.from("images").getPublicUrl(filePath);

    // データベースに保存
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from("generated_images")
      .insert({
        prompt: `QRコード: ${qrInfo.url}`,
        original_prompt: qrInfo.url,
        style_type: "qrcode",
        image_url: urlData.publicUrl,
        is_public: isPublic,
        // QRコードの詳細情報をJSONとして保存（将来的に使用）
        qr_details: JSON.stringify(qrInfo),
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: "Failed to save to database" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      qrcode: dbData,
      imageUrl: urlData.publicUrl,
    });
  } catch (error) {
    console.error("Save QR code error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
