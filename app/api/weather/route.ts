import { NextResponse } from "next/server";
import { getRainfallData } from "@/lib/weather";

export async function GET() {
  const data = await getRainfallData();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
  });
}
