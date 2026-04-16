"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const CATEGORIES = [
  { value: "lawn-restoration", label: "Lawn Restoration" },
  { value: "hedge-trimming", label: "Hedge Trimming" },
  { value: "garden-clean-up", label: "Garden Clean-Up" },
  { value: "planting-flowers", label: "Planting & Flowers" },
];

export default function NewPortfolioEntryPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [beforeUrl, setBeforeUrl] = useState("");
  const [afterUrl, setAfterUrl] = useState("");
  const [category, setCategory] = useState("garden-clean-up");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const beforePreview = beforeUrl.trim();
  const afterPreview = afterUrl.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!beforeUrl || !afterUrl) { setError("Both image URLs are required."); return; }
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, before_image: beforeUrl.trim(), after_image: afterUrl.trim(), category }),
    });

    setLoading(false);
    if (!res.ok) { setError(await res.text()); return; }
    setSuccess(true);
    setTitle(""); setDescription(""); setBeforeUrl(""); setAfterUrl(""); setCategory("garden-clean-up");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-garden-900 text-white py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Link href="/admin/portfolio" className="text-garden-300 text-sm hover:text-white">← Portfolio</Link>
          <h1 className="font-display text-3xl font-bold mt-2">Add Portfolio Entry</h1>
          <p className="text-garden-300 text-sm mt-1">Paste before & after photo URLs from Facebook</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        {/* How to get the URL */}
        <div className="card p-4 mb-6 bg-blue-50 border-blue-200">
          <p className="text-sm font-semibold text-blue-800 mb-1">How to get Facebook photo URLs:</p>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://www.facebook.com/OriginalGreenScene/photos" target="_blank" rel="noopener noreferrer" className="underline">Green Scene Facebook photos</a></li>
            <li>Click on a photo to open it full size</li>
            <li>Right-click the photo → <strong>Open image in new tab</strong></li>
            <li>Copy the URL from the address bar and paste it below</li>
          </ol>
        </div>

        {success && (
          <div className="card p-4 mb-6 bg-green-50 border-green-200 text-green-800 text-sm font-medium">
            ✅ Entry saved! <Link href="/admin/portfolio/new" className="underline ml-2">Add another</Link> · <Link href="/admin/portfolio" className="underline ml-2">View all</Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image URLs */}
          <div className="card p-6 space-y-5">
            <h2 className="font-semibold text-gray-900">Photos</h2>

            <div>
              <label className="label">Before Photo URL *</label>
              <input
                className="input font-mono text-xs"
                type="url"
                required
                value={beforeUrl}
                onChange={e => setBeforeUrl(e.target.value)}
                placeholder="https://scontent.fbcdn.net/v/..."
              />
              {beforePreview && (
                <div className="mt-2 relative h-40 rounded-lg overflow-hidden bg-gray-100">
                  <Image src={beforePreview} alt="Before preview" fill className="object-cover" unoptimized />
                </div>
              )}
            </div>

            <div>
              <label className="label">After Photo URL *</label>
              <input
                className="input font-mono text-xs"
                type="url"
                required
                value={afterUrl}
                onChange={e => setAfterUrl(e.target.value)}
                placeholder="https://scontent.fbcdn.net/v/..."
              />
              {afterPreview && (
                <div className="mt-2 relative h-40 rounded-lg overflow-hidden bg-gray-100">
                  <Image src={afterPreview} alt="After preview" fill className="object-cover" unoptimized />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Details</h2>

            <div>
              <label className="label">Title</label>
              <input className="input" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Lawn restoration in Northampton" />
            </div>

            <div>
              <label className="label">Description (paste Facebook caption)</label>
              <textarea className="input h-24 resize-none" value={description} onChange={e => setDescription(e.target.value)} placeholder="Paste the Facebook post caption here..." />
            </div>

            <div>
              <label className="label">Category</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
            {loading ? "Saving..." : "Save to Portfolio →"}
          </button>
        </form>
      </div>
    </div>
  );
}
