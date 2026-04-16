import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { title, description, before_image, after_image, category } = await req.json();

    if (!before_image || !after_image) {
      return NextResponse.json({ error: "before_image and after_image are required." }, { status: 400 });
    }

    const db = supabaseAdmin();

    // Get current max display_order
    const { data: last } = await db
      .from("portfolio")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    const display_order = (last?.display_order ?? -1) + 1;

    const { error } = await db.from("portfolio").insert({
      title: title || `Green Scene Transformation ${display_order + 1}`,
      description: description || null,
      before_image,
      after_image,
      category: category || "garden-clean-up",
      tags: [category || "garden-clean-up"],
      display_order,
    });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Portfolio insert error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
