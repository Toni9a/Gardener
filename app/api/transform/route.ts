import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateGardenVisualization, findSimilarGardens } from "@/lib/gemini";
import type { TransformResult, PortfolioEntry } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json({ error: "No image provided." }, { status: 400 });
    }

    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = imageFile.type || "image/jpeg";

    const preferences = {
      needs_improving: JSON.parse((formData.get("needs_improving") as string) || "[]"),
      add_flowers: formData.get("add_flowers") === "true",
      preferred_flowers: JSON.parse((formData.get("preferred_flowers") as string) || "[]"),
      garden_type: (formData.get("garden_type") as string) || "messy",
    };

    // Try to find similar projects first
    const tags = await findSimilarGardens(base64, mimeType);

    if (tags.length > 0) {
      const { data: projects } = await supabase
        .from("portfolio")
        .select("*")
        .overlaps("tags", tags)
        .order("display_order")
        .limit(4);

      if (projects && projects.length >= 2) {
        const result: TransformResult = {
          type: "similar_projects",
          similar_projects: projects as PortfolioEntry[],
        };
        return NextResponse.json(result);
      }
    }

    // Fall back to AI visualization description
    const visualization = await generateGardenVisualization(base64, mimeType, preferences);
    const result: TransformResult = {
      type: "ai_visualization",
      visualization_url: visualization,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("Transform API error:", err);
    return NextResponse.json({ error: "Failed to process garden image." }, { status: 500 });
  }
}
