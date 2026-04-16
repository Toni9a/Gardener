#!/usr/bin/env tsx
/**
 * GardenScene Facebook Portfolio Import Script
 *
 * Usage:
 *   npm run import-portfolio
 *
 * This script guides you through importing garden before/after photos.
 * Since Facebook restricts automated scraping, this uses a manual-assist mode:
 * 1. You provide the Facebook page URL
 * 2. The script provides instructions to manually download post data
 * 3. You provide a JSON file exported from Facebook (or manually collected)
 * 4. The script downloads images and imports entries to the database
 *
 * For fully automated import, you can also provide a directory of already-downloaded
 * images and a metadata CSV/JSON file.
 */

import { createClient } from "@supabase/supabase-js";
import { writeFile, readFile, mkdir, readdir } from "fs/promises";
import { join, extname, basename } from "path";
import { existsSync } from "fs";

// Load env manually for script context
// Install dotenv if needed: npm i -D dotenv
try {
  const { config } = await import("dotenv");
  config({ path: ".env.local" });
} catch {
  // dotenv not installed — ensure env vars are set manually
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PORTFOLIO_DIR = join(process.cwd(), "public", "portfolio");

interface FacebookPost {
  id: string;
  message?: string;
  full_picture?: string;
  attachments?: {
    data: Array<{
      media?: { image: { src: string } };
      subattachments?: { data: Array<{ media: { image: { src: string } } }> };
    }>;
  };
  created_time: string;
}

interface ManualEntry {
  title: string;
  description?: string;
  before_image_path: string;
  after_image_path: string;
  category: "lawn-restoration" | "hedge-trimming" | "garden-clean-up" | "planting-flowers";
  tags?: string[];
}

function detectCategory(text: string): ManualEntry["category"] {
  const lower = text.toLowerCase();
  if (lower.includes("lawn") || lower.includes("grass")) return "lawn-restoration";
  if (lower.includes("hedge") || lower.includes("trim") || lower.includes("cut back")) return "hedge-trimming";
  if (lower.includes("plant") || lower.includes("flower") || lower.includes("rose") || lower.includes("bed")) return "planting-flowers";
  return "garden-clean-up";
}

async function downloadImage(url: string, filename: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download: ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const filepath = join(PORTFOLIO_DIR, filename);
  await writeFile(filepath, buffer);
  return `/portfolio/${filename}`;
}

async function importFromFacebookExport(jsonPath: string) {
  console.log(`\n📂 Reading Facebook export from: ${jsonPath}`);
  const raw = await readFile(jsonPath, "utf-8");
  const posts: FacebookPost[] = JSON.parse(raw);

  console.log(`Found ${posts.length} posts.`);

  await mkdir(PORTFOLIO_DIR, { recursive: true });

  let imported = 0;
  let skipped = 0;

  for (const post of posts) {
    const images: string[] = [];

    // Collect all image URLs from post
    if (post.full_picture) images.push(post.full_picture);
    for (const att of post.attachments?.data ?? []) {
      if (att.media?.image.src) images.push(att.media.image.src);
      for (const sub of att.subattachments?.data ?? []) {
        if (sub.media?.image.src) images.push(sub.media.image.src);
      }
    }

    if (images.length < 2) {
      console.log(`⏭  Post ${post.id}: only ${images.length} image(s), skipping.`);
      skipped++;
      continue;
    }

    const description = post.message?.split("\n")[0]?.slice(0, 200) ?? "";
    const title = description || `Garden Transformation ${new Date(post.created_time).toLocaleDateString("en-GB")}`;
    const category = detectCategory(post.message ?? "");

    try {
      const beforeFile = `${post.id}-before.jpg`;
      const afterFile = `${post.id}-after.jpg`;
      const beforeUrl = await downloadImage(images[0], beforeFile);
      const afterUrl = await downloadImage(images[images.length - 1], afterFile);

      const { error } = await supabase.from("portfolio").upsert(
        {
          title,
          description: post.message?.slice(0, 500) ?? null,
          before_image: beforeUrl,
          after_image: afterUrl,
          category,
          tags: [category],
          facebook_post_id: post.id,
          display_order: imported,
        },
        { onConflict: "facebook_post_id" }
      );

      if (error) throw error;
      console.log(`✅ Imported: ${title}`);
      imported++;
    } catch (err) {
      console.error(`❌ Failed post ${post.id}:`, err);
      skipped++;
    }
  }

  console.log(`\n✨ Done. Imported: ${imported}, Skipped: ${skipped}`);
}

async function importFromDirectory(dir: string) {
  console.log(`\n📂 Reading images from directory: ${dir}`);

  const files = await readdir(dir);
  const images = files.filter((f) => [".jpg", ".jpeg", ".png", ".webp"].includes(extname(f).toLowerCase()));

  console.log(`Found ${images.length} images.`);
  console.log("Pairing images (expects before/after pairs sorted alphabetically)...");

  await mkdir(PORTFOLIO_DIR, { recursive: true });

  const pairs: Array<[string, string]> = [];
  for (let i = 0; i < images.length - 1; i += 2) {
    pairs.push([images[i], images[i + 1]]);
  }

  let imported = 0;
  for (const [beforeFile, afterFile] of pairs) {
    const beforeSrc = join(dir, beforeFile);
    const afterSrc = join(dir, afterFile);
    const beforeDest = join(PORTFOLIO_DIR, beforeFile);
    const afterDest = join(PORTFOLIO_DIR, afterFile);

    await writeFile(beforeDest, await readFile(beforeSrc));
    await writeFile(afterDest, await readFile(afterSrc));

    const title = `Garden Transformation ${imported + 1}`;
    await supabase.from("portfolio").insert({
      title,
      before_image: `/portfolio/${beforeFile}`,
      after_image: `/portfolio/${afterFile}`,
      category: "garden-clean-up",
      tags: ["garden-clean-up"],
      display_order: imported,
    });

    console.log(`✅ Imported pair: ${beforeFile} → ${afterFile}`);
    imported++;
  }

  console.log(`\n✨ Done. Imported ${imported} entries.`);
  console.log("Update categories and tags in the admin portfolio page.");
}

async function printManualInstructions() {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║          GardenScene — Facebook Portfolio Import Guide           ║
╚══════════════════════════════════════════════════════════════════╝

Facebook does not allow automated scraping. Here are your options:

────────────────────────────────────────────────────────────────────
OPTION A: Manual Image Directory Import
────────────────────────────────────────────────────────────────────
1. Go to your Facebook page and download your before/after images.
2. Name them in pairs (they'll be paired alphabetically):
   - 01-before.jpg, 01-after.jpg
   - 02-before.jpg, 02-after.jpg  etc.
3. Put them all in a folder (e.g. ~/Downloads/gardenscene-photos/)
4. Run:
   npm run import-portfolio -- --dir ~/Downloads/gardenscene-photos/

────────────────────────────────────────────────────────────────────
OPTION B: Facebook Data Export (most photos)
────────────────────────────────────────────────────────────────────
1. Go to: Facebook → Settings → Your Facebook Information → Download Your Information
2. Select: Posts (date range: all time, format: JSON)
3. Download and extract the zip
4. Find: posts/your_posts_1.json
5. Run:
   npm run import-portfolio -- --json ~/Downloads/facebook-export/posts/your_posts_1.json

────────────────────────────────────────────────────────────────────
OPTION C: Admin Dashboard Upload
────────────────────────────────────────────────────────────────────
Go to: /admin/portfolio → and upload entries manually via the UI.

────────────────────────────────────────────────────────────────────

After import, visit /admin/portfolio to:
- Review and correct categories
- Reorder entries
- Update descriptions
`);
}

// Entry point
const args = process.argv.slice(2);
const jsonFlag = args.indexOf("--json");
const dirFlag = args.indexOf("--dir");

if (jsonFlag !== -1 && args[jsonFlag + 1]) {
  importFromFacebookExport(args[jsonFlag + 1]);
} else if (dirFlag !== -1 && args[dirFlag + 1]) {
  importFromDirectory(args[dirFlag + 1]);
} else {
  printManualInstructions();
}
