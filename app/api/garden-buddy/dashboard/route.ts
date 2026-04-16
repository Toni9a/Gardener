import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getRainfallData } from "@/lib/weather";
import type { ClientDashboardData } from "@/types";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token required." }, { status: 401 });

  const db = supabaseAdmin();

  const { data: client, error } = await db
    .from("clients")
    .select("*")
    .eq("access_token", token)
    .eq("active", true)
    .single();

  if (error || !client) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  const [
    { data: scores },
    { data: watering },
    rainfall,
  ] = await Promise.all([
    db
      .from("garden_health_scores")
      .select("*")
      .eq("client_id", client.id)
      .order("analyzed_at", { ascending: false })
      .limit(10),
    db
      .from("watering_logs")
      .select("*")
      .eq("client_id", client.id)
      .order("logged_at", { ascending: false })
      .limit(14),
    getRainfallData(client.latitude ?? undefined, client.longitude ?? undefined),
  ]);

  const dashboardData: ClientDashboardData = {
    client,
    latest_score: scores?.[0] ?? null,
    recent_scores: scores ?? [],
    recent_watering: watering ?? [],
    rainfall_mm: rainfall.rainfall_mm,
  };

  return NextResponse.json(dashboardData);
}
