import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { token, watered } = await req.json();

    if (!token || typeof watered !== "boolean") {
      return NextResponse.json({ error: "Token and watered status required." }, { status: 400 });
    }

    const db = supabaseAdmin();

    const { data: client, error } = await db
      .from("clients")
      .select("id")
      .eq("access_token", token)
      .eq("active", true)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: "Invalid token." }, { status: 403 });
    }

    await db.from("watering_logs").insert({
      client_id: client.id,
      watered,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Watering log error:", err);
    return NextResponse.json({ error: "Failed to log watering." }, { status: 500 });
  }
}
