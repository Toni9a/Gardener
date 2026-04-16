import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import type { PortfolioEntry } from "@/types";
import Image from "next/image";

async function getPortfolio(): Promise<PortfolioEntry[]> {
  const db = supabaseAdmin();
  const { data } = await db.from("portfolio").select("*").order("display_order");
  return data ?? [];
}

export default async function AdminPortfolioPage() {
  const entries = await getPortfolio();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-garden-900 text-white py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <a href="/admin" className="text-garden-300 text-sm hover:text-white">← Admin Dashboard</a>
          <div className="flex items-center justify-between mt-2">
            <h1 className="font-display text-3xl font-bold">Portfolio</h1>
            <Link
              href="/admin/portfolio/new"
              className="btn-primary text-sm py-2"
            >
              + Add Entry
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {entries.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-4xl mb-4">📷</p>
            <p className="text-gray-600 mb-4">No portfolio entries yet.</p>
            <a href="/admin/portfolio/import" className="btn-primary">
              Import from Facebook →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <div key={entry.id} className="card overflow-hidden">
                <div className="grid grid-cols-2 gap-1 h-40">
                  <div className="relative">
                    <Image src={entry.before_image} alt="Before" fill className="object-cover" />
                    <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-2 py-0.5 rounded">Before</span>
                  </div>
                  <div className="relative">
                    <Image src={entry.after_image} alt="After" fill className="object-cover" />
                    <span className="absolute bottom-1 right-1 text-xs bg-garden-700/80 text-white px-2 py-0.5 rounded">After</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block rounded-full bg-garden-100 px-2 py-0.5 text-xs font-medium text-garden-700 capitalize mb-1">
                        {entry.category.replace(/-/g, " ")}
                      </span>
                      <h3 className="font-semibold text-gray-900">{entry.title}</h3>
                    </div>
                    <span className="text-xs text-gray-400">#{entry.display_order}</span>
                  </div>
                  {entry.description && (
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">{entry.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
