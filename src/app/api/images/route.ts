import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    // 公開画像のみを取得（最新順から50件）
    const { data, error } = await supabase.from("generated_images").select("*").eq("is_public", true).order("created_at", { ascending: false }).limit(50);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
    }

    // qr_detailsがJSON文字列の場合はパースする
    const processedData = (data || []).map((item) => ({
      ...item,
      qr_details: item.qr_details && typeof item.qr_details === "string" ? JSON.parse(item.qr_details) : item.qr_details,
    }));

    return NextResponse.json({ images: processedData });
  } catch (error) {
    console.error("Fetch images error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
