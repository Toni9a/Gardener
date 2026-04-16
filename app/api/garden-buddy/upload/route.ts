import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { analyzeGardenHealth } from "@/lib/gemini";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const token = formData.get("token") as string;
    const imageFile = formData.get("image") as File;

    if (!token || !imageFile || imageFile.size === 0) {
      return NextResponse.json({ error: "Token and image required." }, { status: 400 });
    }

    const db = supabaseAdmin();

    const { data: client, error: clientError } = await db
      .from("clients")
      .select("id")
      .eq("access_token", token)
      .eq("active", true)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: "Invalid token." }, { status: 403 });
    }

    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save image
    const filename = `${randomUUID()}.${imageFile.name.split(".").pop() ?? "jpg"}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "gardens");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);
    const imageUrl = `/uploads/gardens/${filename}`;

    // Analyse with Gemini
    const base64 = buffer.toString("base64");
    const mimeType = imageFile.type || "image/jpeg";
    const { score, notes } = await analyzeGardenHealth(base64, mimeType);

    // Store result
    await db.from("garden_health_scores").insert({
      client_id: client.id,
      score,
      image_url: imageUrl,
      analysis_notes: notes,
    });

    return NextResponse.json({ score, notes, image_url: imageUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload and analysis failed." }, { status: 500 });
  }
}
