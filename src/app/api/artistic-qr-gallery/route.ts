import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  try {
    // アートQRコードのみを取得（is_artistic_qr = true）
    const { data, error } = await supabase
      .from("generated_images")
      .select("id, image_url, original_prompt, qr_text, created_at")
      .eq("is_public", true)
      .eq("is_artistic_qr", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json({ error: "Failed to fetch artistic QR gallery" }, { status: 500 });
    }

    const items = data.map((item) => ({
      id: item.id,
      image_url: item.image_url,
      prompt: item.original_prompt,
      qr_text: item.qr_text || "",
      created_at: item.created_at,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Gallery fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
