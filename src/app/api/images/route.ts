import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    // 公開画像のみを取得
    const { data, error } = await supabase.from("generated_images").select("*").eq("is_public", true).order("created_at", { ascending: false }).limit(20);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
    }

    return NextResponse.json({ images: data || [] });
  } catch (error) {
    console.error("Fetch images error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
