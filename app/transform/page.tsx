"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { TransformResult } from "@/types";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";

const IMPROVEMENTS = ["lawn", "hedges", "flower beds", "general tidy"];
const FLOWERS = ["roses", "lavender", "hydrangeas", "mixed flowers"];
const GARDEN_TYPES = ["messy", "overgrown", "empty / plain"];

type Step = "upload" | "questions" | "result";

export default function TransformPage() {
  const [step, setStep] = useState<Step>("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TransformResult | null>(null);

  // Form state
  const [improvements, setImprovements] = useState<string[]>([]);
  const [addFlowers, setAddFlowers] = useState(false);
  const [preferredFlowers, setPreferredFlowers] = useState<string[]>([]);
  const [gardenType, setGardenType] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setStep("questions");
  }

  function toggleItem<T extends string>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
  }

  async function handleSubmit() {
    if (!imageFile) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("needs_improving", JSON.stringify(improvements));
      formData.append("add_flowers", String(addFlowers));
      formData.append("preferred_flowers", JSON.stringify(preferredFlowers));
      formData.append("garden_type", gardenType);

      const res = await fetch("/api/transform", { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setResult(data);
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setStep("questions");
  }

  return (
    <div className="min-h-screen bg-garden-50">
      {/* Header */}
      <div className="bg-garden-900 text-white py-16 text-center">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Garden Transformation Tool</h1>
        <p className="mt-4 text-garden-200 text-lg max-w-xl mx-auto">
          Upload a photo of your garden and see what Green Scene could do for you.
        </p>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            {(["upload", "questions", "result"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === s
                      ? "bg-garden-700 text-white"
                      : i < ["upload", "questions", "result"].indexOf(step)
                      ? "bg-garden-200 text-garden-800"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i + 1}
                </div>
                <span className={`text-sm hidden sm:block ${step === s ? "font-semibold text-garden-700" : "text-gray-400"}`}>
                  {s === "upload" ? "Upload Photo" : s === "questions" ? "Your Preferences" : "Your Transformation"}
                </span>
                {i < 2 && <div className="h-px w-6 bg-gray-200" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        {/* Step 1: Upload */}
        {step === "upload" && (
          <div
            className="card p-8 text-center border-2 border-dashed border-garden-300 hover:border-garden-500 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="text-5xl mb-4">📸</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Your Garden Photo</h2>
            <p className="text-gray-500 mb-6">Drag and drop or click to select an image (JPG, PNG, WebP)</p>
            <button className="btn-primary">Choose Photo</button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Step 2: Questions */}
        {step === "questions" && imagePreview && (
          <div className="space-y-8">
            <div className="card overflow-hidden">
              <div className="relative aspect-video">
                <Image src={imagePreview} alt="Your garden" fill className="object-cover" />
              </div>
              <div className="p-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">Your uploaded garden photo</span>
                <button
                  className="text-sm text-garden-600 hover:text-garden-800"
                  onClick={() => { setStep("upload"); setImageFile(null); setImagePreview(null); }}
                >
                  Change photo
                </button>
              </div>
            </div>

            <div className="card p-6 space-y-8">
              {/* What needs improving */}
              <div>
                <label className="label text-base">What needs improving?</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {IMPROVEMENTS.map((item) => (
                    <button
                      key={item}
                      onClick={() => setImprovements(toggleItem(improvements, item))}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        improvements.includes(item)
                          ? "bg-garden-700 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-garden-100"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add flowers */}
              <div>
                <label className="label text-base">Do you want flowers added?</label>
                <div className="mt-2 flex gap-3">
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      onClick={() => setAddFlowers(val)}
                      className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                        addFlowers === val
                          ? "bg-garden-700 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-garden-100"
                      }`}
                    >
                      {val ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred flowers */}
              {addFlowers && (
                <div>
                  <label className="label text-base">Preferred flowers (optional)</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {FLOWERS.map((flower) => (
                      <button
                        key={flower}
                        onClick={() => setPreferredFlowers(toggleItem(preferredFlowers, flower))}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                          preferredFlowers.includes(flower)
                            ? "bg-earth-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-earth-100"
                        }`}
                      >
                        {flower}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Garden type */}
              <div>
                <label className="label text-base">How would you describe your garden?</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {GARDEN_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setGardenType(type)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        gardenType === type
                          ? "bg-garden-700 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-garden-100"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || improvements.length === 0 || !gardenType}
                className="btn-primary w-full text-base py-4"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Analysing your garden...
                  </span>
                ) : "See My Transformation →"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {step === "result" && result && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold text-garden-900">Your Garden Transformation</h2>
              <p className="mt-2 text-gray-600">Here&apos;s what GardenScene could do for your outdoor space.</p>
            </div>

            {result.type === "similar_projects" && result.similar_projects && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Similar gardens we&apos;ve transformed:
                </h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  {result.similar_projects.map((project) => (
                    <div key={project.id} className="card overflow-hidden">
                      <BeforeAfterSlider
                        before={project.before_image}
                        after={project.after_image}
                        alt={project.title}
                      />
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900">{project.title}</h4>
                        {project.description && (
                          <p className="mt-1 text-sm text-gray-600">{project.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.type === "ai_visualization" && result.visualization_url && (
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">AI Transformation Vision</h3>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {result.visualization_url}
                </div>
              </div>
            )}

            {/* Quote CTA */}
            <div className="card p-8 bg-garden-50 border-garden-200 text-center">
              <h3 className="font-display text-2xl font-bold text-garden-900">
                Ready to transform your garden?
              </h3>
              <p className="mt-2 text-gray-600">
                Request a free quote from Green Scene and we&apos;ll be in touch within 24 hours.
              </p>
              <div className="mt-6">
                <Link
                  href={`/quote?from=transform`}
                  className="btn-earth text-base px-10 py-4"
                >
                  Request a Quote for This Garden →
                </Link>
              </div>
            </div>

            <button
              onClick={() => { setStep("upload"); setResult(null); setImageFile(null); setImagePreview(null); setImprovements([]); setAddFlowers(false); setPreferredFlowers([]); setGardenType(""); }}
              className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Start over with a different photo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
