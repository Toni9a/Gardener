import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendQuoteRequestEmail } from "@/lib/email";
import type { QuotePreferences } from "@/types";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const notes = formData.get("notes") as string;
    const imageFile = formData.get("image") as File | null;

    if (!name || !email || !phone || !address) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const preferences: QuotePreferences = {
      needs_improving: JSON.parse((formData.get("needs_improving") as string) || "[]"),
      add_flowers: formData.get("add_flowers") === "true",
      preferred_flowers: JSON.parse((formData.get("preferred_flowers") as string) || "[]"),
      garden_type: formData.get("garden_type") as string,
      additional_notes: notes || undefined,
    };

    let image_url: string | null = null;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${randomUUID()}-${imageFile.name.replace(/[^a-z0-9.]/gi, "_")}`;
      const uploadDir = join(process.cwd(), "public", "uploads", "quotes");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(join(uploadDir, filename), buffer);
      image_url = `/uploads/quotes/${filename}`;
    }

    const db = supabaseAdmin();
    const { error: dbError } = await db.from("quote_requests").insert({
      name,
      email,
      phone,
      address,
      image_url,
      preferences,
      status: "new",
    });

    if (dbError) throw dbError;

    await sendQuoteRequestEmail({ name, email, phone, address, image_url, visualization_url: null, preferences });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Quote API error:", err);
    return NextResponse.json({ error: "Failed to submit quote request." }, { status: 500 });
  }
}
