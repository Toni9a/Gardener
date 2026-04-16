"use client";

import { useState, useRef } from "react";
import Image from "next/image";

const IMPROVEMENTS = ["lawn", "hedges", "flower beds", "general tidy"];
const FLOWERS = ["roses", "lavender", "hydrangeas", "mixed flowers"];
const GARDEN_TYPES = ["messy", "overgrown", "empty / plain", "needs ongoing maintenance"];

export default function QuotePage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contact fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Preferences
  const [improvements, setImprovements] = useState<string[]>([]);
  const [addFlowers, setAddFlowers] = useState(false);
  const [preferredFlowers, setPreferredFlowers] = useState<string[]>([]);
  const [gardenType, setGardenType] = useState("");

  // Image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function toggleItem<T extends string>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("notes", notes);
      formData.append("needs_improving", JSON.stringify(improvements));
      formData.append("add_flowers", String(addFlowers));
      formData.append("preferred_flowers", JSON.stringify(preferredFlowers));
      formData.append("garden_type", gardenType);
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch("/api/quote", { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-garden-50 flex items-center justify-center px-4">
        <div className="card p-10 text-center max-w-md w-full">
          <div className="text-5xl mb-4">🌿</div>
          <h2 className="font-display text-2xl font-bold text-garden-900 mb-2">Quote Request Sent!</h2>
          <p className="text-gray-600 leading-relaxed">
            Thank you, {name}. We&apos;ve received your request and will be in touch within 24 hours
            to discuss your garden transformation.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            📞 <a href="tel:+441604000000" className="text-garden-700 hover:underline">01604 000 000</a>
            {" · "}
            ✉️ <a href="mailto:info@gardenscene.co.uk" className="text-garden-700 hover:underline">info@gardenscene.co.uk</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-garden-50">
      <div className="bg-garden-900 text-white py-16 text-center">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Get a Free Quote</h1>
        <p className="mt-4 text-garden-200 text-lg max-w-xl mx-auto">
          Tell us about your garden and we&apos;ll get back to you within 24 hours.
        </p>
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact details */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">Your Details</h2>

            <div>
              <label className="label" htmlFor="name">Full Name *</label>
              <input id="name" className="input" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="email">Email *</label>
                <input id="email" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
              </div>
              <div>
                <label className="label" htmlFor="phone">Phone *</label>
                <input id="phone" className="input" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07700 900000" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="address">Garden Address *</label>
              <input id="address" className="input" type="text" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="1 High Street, Northampton, NN1 1AA" />
            </div>
          </div>

          {/* Photo upload */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 text-lg mb-4">Garden Photo (Optional)</h2>
            <p className="text-sm text-gray-500 mb-4">Uploading a photo helps us give you a more accurate quote.</p>

            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image src={imagePreview} alt="Your garden" fill className="object-cover" />
                </div>
                <button type="button" className="text-sm text-garden-600 hover:text-garden-800" onClick={() => { setImageFile(null); setImagePreview(null); }}>
                  Remove photo
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-garden-300 rounded-lg p-8 text-center cursor-pointer hover:border-garden-500 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <div className="text-3xl mb-2">📸</div>
                <p className="text-sm text-gray-500">Click to upload a photo of your garden</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
                  }}
                />
              </div>
            )}
          </div>

          {/* Preferences */}
          <div className="card p-6 space-y-6">
            <h2 className="font-semibold text-gray-900 text-lg">Garden Preferences</h2>

            <div>
              <label className="label">What needs improving?</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {IMPROVEMENTS.map((item) => (
                  <button key={item} type="button"
                    onClick={() => setImprovements(toggleItem(improvements, item))}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${improvements.includes(item) ? "bg-garden-700 text-white" : "bg-gray-100 text-gray-700 hover:bg-garden-100"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">How would you describe your garden?</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {GARDEN_TYPES.map((type) => (
                  <button key={type} type="button"
                    onClick={() => setGardenType(type)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${gardenType === type ? "bg-garden-700 text-white" : "bg-gray-100 text-gray-700 hover:bg-garden-100"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Would you like flowers added?</label>
              <div className="mt-2 flex gap-3">
                {[true, false].map((val) => (
                  <button key={String(val)} type="button"
                    onClick={() => setAddFlowers(val)}
                    className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${addFlowers === val ? "bg-garden-700 text-white" : "bg-gray-100 text-gray-700 hover:bg-garden-100"}`}
                  >
                    {val ? "Yes" : "No"}
                  </button>
                ))}
              </div>
            </div>

            {addFlowers && (
              <div>
                <label className="label">Preferred flowers (optional)</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {FLOWERS.map((flower) => (
                    <button key={flower} type="button"
                      onClick={() => setPreferredFlowers(toggleItem(preferredFlowers, flower))}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${preferredFlowers.includes(flower) ? "bg-earth-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-earth-100"}`}
                    >
                      {flower}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="label" htmlFor="notes">Anything else we should know?</label>
              <textarea
                id="notes"
                className="input h-24 resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. access restrictions, specific concerns, timing preferences..."
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full text-base py-4">
            {loading ? "Sending..." : "Send Quote Request →"}
          </button>

          <p className="text-center text-xs text-gray-400">
            We&apos;ll respond within 24 hours. No obligation.
          </p>
        </form>
      </div>
    </div>
  );
}
