import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    console.log("Fetching artistic QR samples...");

    // 環境変数の確認
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json({ error: "サーバー設定エラー" }, { status: 500 });
    }

    // アートQRコードをランダムで5つ取得
    const { data, error } = await supabase
      .from("generated_images")
      .select("id, image_url, prompt, original_prompt, style_type, qr_text, created_at")
      .eq("is_public", true)
      .eq("is_artistic_qr", true)
      .order("created_at", { ascending: false })
      .limit(50); // まず50件取得してからランダムに5つ選ぶ

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          error: "データベースエラー",
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    console.log(`Found ${data?.length || 0} artistic QR records`);

    if (!data || data.length === 0) {
      return NextResponse.json({ samples: [] });
    }

    // ランダムに5つ選択
    const shuffled = data.sort(() => 0.5 - Math.random());
    const samples = shuffled.slice(0, Math.min(5, shuffled.length));

    console.log(`Returning ${samples.length} samples`);
    return NextResponse.json({ samples });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: "サーバーエラー",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
