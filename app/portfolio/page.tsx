import { Suspense } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { PortfolioCategory, PortfolioEntry } from "@/types";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";

const categories: { value: PortfolioCategory | "all"; label: string }[] = [
  { value: "all", label: "All Work" },
  { value: "lawn-restoration", label: "Lawn Restoration" },
  { value: "hedge-trimming", label: "Hedge Trimming" },
  { value: "garden-clean-up", label: "Garden Clean-Up" },
  { value: "planting-flowers", label: "Planting & Flowers" },
];

async function getPortfolio(category?: string): Promise<PortfolioEntry[]> {
  let query = supabase.from("portfolio").select("*").order("display_order", { ascending: true });
  if (category && category !== "all") {
    query = query.eq("category", category);
  }
  const { data } = await query;
  return data ?? [];
}

export const metadata = { title: "Portfolio" };

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const activeCategory = params.category ?? "all";
  const projects = await getPortfolio(activeCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-garden-900 text-white py-16 text-center">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Our Work</h1>
        <p className="mt-4 text-garden-200 text-lg max-w-xl mx-auto">
          Real gardens transformed by Green Scene. Drag the sliders to see before and after.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="sticky top-16 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-none">
            {categories.map(({ value, label }) => (
              <Link
                key={value}
                href={value === "all" ? "/portfolio" : `/portfolio?category=${value}`}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === value
                    ? "bg-garden-700 text-white"
                    : "text-gray-600 hover:bg-garden-50 hover:text-garden-700"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          {projects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🌱</p>
              <p className="text-gray-500">No projects in this category yet — check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <article key={project.id} className="card overflow-hidden group">
                  <BeforeAfterSlider
                    before={project.before_image}
                    after={project.after_image}
                    alt={project.title}
                  />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-block rounded-full bg-garden-100 px-3 py-1 text-xs font-medium text-garden-700 capitalize">
                        {project.category.replace(/-/g, " ")}
                      </span>
                    </div>
                    <h2 className="mt-3 font-semibold text-gray-900 text-lg">{project.title}</h2>
                    {project.description && (
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{project.description}</p>
                    )}
                    {project.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {project.tags.map((tag) => (
                          <span key={tag} className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </Suspense>

      {/* CTA */}
      <div className="bg-garden-50 border-t border-garden-100 py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-garden-900">Like what you see?</h2>
        <p className="mt-3 text-gray-600">Get in touch for a free, no-obligation quote.</p>
        <div className="mt-6 flex gap-4 justify-center flex-wrap">
          <Link href="/quote" className="btn-primary">Get a Free Quote</Link>
          <Link href="/transform" className="btn-secondary">See Your Garden Transformed</Link>
        </div>
      </div>
    </div>
  );
}
