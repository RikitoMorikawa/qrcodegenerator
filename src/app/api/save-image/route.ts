import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { prompt, originalPrompt, styleType, imageDataUrl, isPublic = true } = await req.json();

    if (!prompt || !imageDataUrl || !originalPrompt) {
      return NextResponse.json({ error: "prompt, originalPrompt and imageDataUrl are required" }, { status: 400 });
    }

    // Base64データからファイルデータを抽出
    const base64Data = imageDataUrl.replace(/^data:image\/[a-z]+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // ファイル名を生成
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    const filePath = `generated-images/${fileName}`;

    // Supabase Storageにアップロード（PNG形式で透明背景を保持）
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage.from("images").upload(filePath, buffer, {
      contentType: "image/png",
      upsert: false,
      cacheControl: "3600",
    });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }

    // 公開URLを取得
    const { data: urlData } = supabaseAdmin.storage.from("images").getPublicUrl(filePath);

    // データベースに保存
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from("generated_images")
      .insert({
        prompt,
        original_prompt: originalPrompt,
        style_type: styleType || "normal",
        image_url: urlData.publicUrl,
        is_public: isPublic,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: "Failed to save to database" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      image: dbData,
      imageUrl: urlData.publicUrl,
    });
  } catch (error) {
    console.error("Save image error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
