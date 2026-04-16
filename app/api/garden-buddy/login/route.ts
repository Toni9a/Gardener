import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { phone, token } = await req.json();
    const db = supabaseAdmin();

    let query = db.from("clients").select("access_token, active");

    if (phone) {
      const normalised = phone.replace(/\s+/g, "").replace(/^0044/, "0").replace(/^\+44/, "0");
      query = query.eq("phone", normalised);
    } else if (token) {
      query = query.eq("access_token", token);
    } else {
      return NextResponse.json({ error: "Phone or token required." }, { status: 400 });
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    if (!data.active) {
      return NextResponse.json({ error: "This account is not active." }, { status: 403 });
    }

    return NextResponse.json({ access_token: data.access_token });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
