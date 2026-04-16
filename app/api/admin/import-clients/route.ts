import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { parse } from "csv-parse/sync";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const csvFile = formData.get("csv") as File;

    if (!csvFile || csvFile.size === 0) {
      return NextResponse.json({ error: "No CSV file provided." }, { status: 400 });
    }

    const text = await csvFile.text();
    const rows: Record<string, string>[] = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const db = supabaseAdmin();
    let imported = 0;
    const errors: string[] = [];

    for (const [i, row] of rows.entries()) {
      const rowNum = i + 2;
      if (!row.name || !row.address || !row.phone) {
        errors.push(`Row ${rowNum}: missing name, address, or phone.`);
        continue;
      }

      const normalised = row.phone.replace(/\s+/g, "").replace(/^0044/, "0").replace(/^\+44/, "0");

      const { error } = await db.from("clients").upsert(
        {
          name: row.name,
          address: row.address,
          phone: normalised,
          last_visit: row.last_visit || null,
          paid: row.paid?.toLowerCase() === "true",
        },
        { onConflict: "phone" }
      );

      if (error) {
        errors.push(`Row ${rowNum} (${row.name}): ${error.message}`);
      } else {
        imported++;
      }
    }

    return NextResponse.json({ imported, errors });
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json({ error: "Failed to process CSV." }, { status: 500 });
  }
}
