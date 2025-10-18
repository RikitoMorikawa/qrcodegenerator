import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    console.log("Testing database connection...");

    // 環境変数の確認
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          error: "Missing environment variables",
          supabaseUrl: !!supabaseUrl,
          supabaseKey: !!supabaseKey,
        },
        { status: 500 }
      );
    }

    // テーブルの存在確認
    const { data: tableData, error: tableError } = await supabase.from("generated_images").select("count", { count: "exact", head: true });

    if (tableError) {
      return NextResponse.json(
        {
          error: "Table access error",
          details: tableError.message,
          code: tableError.code,
        },
        { status: 500 }
      );
    }

    // 全レコード数を確認
    const { data: allData, error: allError } = await supabase.from("generated_images").select("id, is_artistic_qr, is_public").limit(10);

    if (allError) {
      return NextResponse.json(
        {
          error: "Data fetch error",
          details: allError.message,
        },
        { status: 500 }
      );
    }

    // アートQRレコード数を確認
    const { data: artData, error: artError } = await supabase.from("generated_images").select("id").eq("is_artistic_qr", true).eq("is_public", true);

    if (artError) {
      return NextResponse.json(
        {
          error: "Artistic QR fetch error",
          details: artError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      totalRecords: allData?.length || 0,
      artisticQRRecords: artData?.length || 0,
      sampleRecords:
        allData?.map((record) => ({
          id: record.id,
          is_artistic_qr: record.is_artistic_qr,
          is_public: record.is_public,
        })) || [],
    });
  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
