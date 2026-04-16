#!/usr/bin/env tsx
/**
 * GardenScene Facebook Portfolio Import Script (Apify-powered)
 *
 * Uses Apify's Facebook Photos Scraper to pull all photos from the Green Scene
 * Facebook page, then imports them into the portfolio database.
 *
 * Usage:
 *   APIFY_TOKEN=your_token npm run import-portfolio
 *
 * Or with token inline:
 *   APIFY_TOKEN=apify_api_xxx npm run import-portfolio
 *
 * Options:
 *   --dir <path>   Import from a local folder of already-downloaded images
 *   --json <path>  Import from a Facebook data export JSON file
 */

import { createClient } from "@supabase/supabase-js";
import { writeFile, readFile, mkdir, readdir } from "fs/promises";
import { join, extname } from "path";

// Load .env.local
try {
  const { config } = await import("dotenv");
  config({ path: ".env.local" });
} catch {
  // dotenv not installed — env vars must be set manually
}

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const FACEBOOK_PAGE_URL = "https://www.facebook.com/OriginalGreenScene/";
const PORTFOLIO_DIR = join(process.cwd(), "public", "portfolio");

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Apify Facebook Scraper ──────────────────────────────────────────────────

async function runApifyActor(actorId: string, input: Record<string, unknown>) {
  if (!APIFY_TOKEN) throw new Error("APIFY_TOKEN env var is not set.");

  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${actorId}/runs?token=${APIFY_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );

  if (!runRes.ok) {
    const text = await runRes.text();
    throw new Error(`Failed to start actor: ${runRes.status} ${text}`);
  }

  const run = (await runRes.json()).data;
  console.log(`🚀 Actor run started: ${run.id} (status: ${run.status})`);

  // Poll for completion
  let status = run.status;
  while (status === "RUNNING" || status === "READY" || status === "CREATED") {
    await new Promise((r) => setTimeout(r, 5000));
    const pollRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${run.id}?token=${APIFY_TOKEN}`
    );
    const pollData = (await pollRes.json()).data;
    status = pollData.status;
    process.stdout.write(`  ⏳ ${status}...  \r`);
  }

  console.log(`\n✅ Actor finished with status: ${status}`);
  if (status !== "SUCCEEDED") throw new Error(`Actor failed with status: ${status}`);

  // Fetch dataset items
  const datasetId = run.defaultDatasetId;
  const dataRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}&clean=true`
  );
  const items = await dataRes.json();
  return items;
}

async function importFromApify() {
  console.log("\n🌿 Green Scene — Apify Facebook Photo Import");
  console.log("=============================================");
  console.log(`📄 Page: ${FACEBOOK_PAGE_URL}\n`);

  // Use Apify's Facebook Pages Scraper actor
  // Actor: apify/facebook-pages-scraper
  console.log("Starting Apify Facebook scraper...");

  let posts: Array<{
    url?: string;
    text?: string;
    photos?: Array<{ imageUrl?: string; url?: string }>;
    timestamp?: string;
  }> = [];

  try {
    posts = await runApifyActor("apify/facebook-pages-scraper", {
      startUrls: [{ url: FACEBOOK_PAGE_URL }],
      maxPosts: 100,
      maxPostComments: 0,
      maxReviews: 0,
      maxReviewsPerPage: 0,
      scrapeAbout: false,
      scrapeReviews: false,
      proxyConfig: { useApifyProxy: true },
    });
  } catch (err) {
    console.log("Facebook Pages Scraper failed, trying Photos Scraper...");
    try {
      posts = await runApifyActor("clockworks/facebook-photos-scraper", {
        startUrls: [{ url: `${FACEBOOK_PAGE_URL}photos` }],
        maxPhotos: 200,
        proxyConfig: { useApifyProxy: true },
      });
    } catch (err2) {
      throw new Error(`Both actors failed.\nFirst: ${err}\nSecond: ${err2}`);
    }
  }

  console.log(`\n📦 Retrieved ${posts.length} posts/photos from Facebook\n`);

  await mkdir(PORTFOLIO_DIR, { recursive: true });

  let imported = 0;
  let skipped = 0;

  for (const post of posts) {
    // Collect image URLs from the post
    const imageUrls: string[] = [];

    if (Array.isArray(post.photos)) {
      for (const p of post.photos) {
        const u = p.imageUrl ?? p.url;
        if (u) imageUrls.push(u);
      }
    }

    if (imageUrls.length < 2) {
      skipped++;
      continue;
    }

    const text = post.text ?? "";
    const title =
      text.split("\n")[0]?.slice(0, 100) ||
      `Green Scene Transformation ${imported + 1}`;

    const category = detectCategory(text);
    const postId = post.url?.split("/").filter(Boolean).pop() ?? `post-${Date.now()}-${imported}`;

    try {
      const beforeUrl = await downloadImage(imageUrls[0], `${postId}-before.jpg`);
      const afterUrl = await downloadImage(imageUrls[imageUrls.length - 1], `${postId}-after.jpg`);

      const { error } = await db.from("portfolio").upsert(
        {
          title,
          description: text.slice(0, 500) || null,
          before_image: beforeUrl,
          after_image: afterUrl,
          category,
          tags: [category],
          facebook_post_id: postId,
          display_order: imported,
        },
        { onConflict: "facebook_post_id" }
      );

      if (error) throw error;
      console.log(`✅ [${imported + 1}] ${title.slice(0, 60)}`);
      imported++;
    } catch (err) {
      console.error(`❌ Failed: ${err}`);
      skipped++;
    }
  }

  console.log(`\n🎉 Done! Imported: ${imported} · Skipped: ${skipped}`);
  console.log("Visit /admin/portfolio to review and categorise entries.");
}

// ─── Local directory import ──────────────────────────────────────────────────

async function importFromDirectory(dir: string) {
  console.log(`\n📂 Importing from: ${dir}`);
  const files = await readdir(dir);
  const images = files
    .filter((f) => [".jpg", ".jpeg", ".png", ".webp"].includes(extname(f).toLowerCase()))
    .sort();

  await mkdir(PORTFOLIO_DIR, { recursive: true });
  let imported = 0;

  for (let i = 0; i < images.length - 1; i += 2) {
    const beforeSrc = join(dir, images[i]);
    const afterSrc = join(dir, images[i + 1]);
    await writeFile(join(PORTFOLIO_DIR, images[i]), await readFile(beforeSrc));
    await writeFile(join(PORTFOLIO_DIR, images[i + 1]), await readFile(afterSrc));

    await db.from("portfolio").insert({
      title: `Green Scene Transformation ${imported + 1}`,
      before_image: `/portfolio/${images[i]}`,
      after_image: `/portfolio/${images[i + 1]}`,
      category: "garden-clean-up",
      tags: ["garden-clean-up"],
      display_order: imported,
    });

    console.log(`✅ ${images[i]} → ${images[i + 1]}`);
    imported++;
  }

  console.log(`\n✨ Imported ${imported} pairs. Update categories at /admin/portfolio`);
}

// ─── Facebook JSON export import ─────────────────────────────────────────────

async function importFromFacebookExport(jsonPath: string) {
  const raw = await readFile(jsonPath, "utf-8");
  const posts = JSON.parse(raw);
  await mkdir(PORTFOLIO_DIR, { recursive: true });
  let imported = 0;

  for (const post of posts) {
    const images: string[] = [];
    if (post.full_picture) images.push(post.full_picture);
    for (const att of post.attachments?.data ?? []) {
      if (att.media?.image.src) images.push(att.media.image.src);
      for (const sub of att.subattachments?.data ?? []) {
        if (sub.media?.image.src) images.push(sub.media.image.src);
      }
    }
    if (images.length < 2) continue;

    const text = post.message ?? "";
    const title = text.split("\n")[0]?.slice(0, 100) || `Transformation ${imported + 1}`;

    try {
      const before = await downloadImage(images[0], `${post.id}-before.jpg`);
      const after = await downloadImage(images[images.length - 1], `${post.id}-after.jpg`);
      await db.from("portfolio").upsert(
        { title, description: text.slice(0, 500), before_image: before, after_image: after, category: detectCategory(text), tags: [detectCategory(text)], facebook_post_id: post.id, display_order: imported },
        { onConflict: "facebook_post_id" }
      );
      console.log(`✅ ${title.slice(0, 60)}`);
      imported++;
    } catch (err) {
      console.error(`❌ ${err}`);
    }
  }

  console.log(`\n✨ Imported ${imported} entries.`);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function detectCategory(text: string): "lawn-restoration" | "hedge-trimming" | "garden-clean-up" | "planting-flowers" {
  const l = text.toLowerCase();
  if (l.includes("lawn") || l.includes("grass") || l.includes("turf")) return "lawn-restoration";
  if (l.includes("hedge") || l.includes("trim") || l.includes("cut back") || l.includes("topiar")) return "hedge-trimming";
  if (l.includes("plant") || l.includes("flower") || l.includes("rose") || l.includes("bed") || l.includes("bloom")) return "planting-flowers";
  return "garden-clean-up";
}

async function downloadImage(url: string, filename: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${url} (${res.status})`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(join(PORTFOLIO_DIR, filename), buffer);
  return `/portfolio/${filename}`;
}

// ─── Entry point ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const jsonFlag = args.indexOf("--json");
const dirFlag = args.indexOf("--dir");

if (jsonFlag !== -1 && args[jsonFlag + 1]) {
  await importFromFacebookExport(args[jsonFlag + 1]);
} else if (dirFlag !== -1 && args[dirFlag + 1]) {
  await importFromDirectory(args[dirFlag + 1]);
} else {
  await importFromApify();
}
