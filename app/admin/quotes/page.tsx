import { supabaseAdmin } from "@/lib/supabase";
import type { QuoteRequest } from "@/types";

async function getQuotes(): Promise<QuoteRequest[]> {
  const db = supabaseAdmin();
  const { data } = await db
    .from("quote_requests")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  quoted: "bg-purple-100 text-purple-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-gray-100 text-gray-500",
};

export default async function QuotesPage() {
  const quotes = await getQuotes();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-garden-900 text-white py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <a href="/admin" className="text-garden-300 text-sm hover:text-white">← Admin Dashboard</a>
          <h1 className="font-display text-3xl font-bold mt-2">Quote Requests</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="space-y-4">
          {quotes.length === 0 ? (
            <div className="card p-8 text-center text-gray-400">No quote requests yet.</div>
          ) : (
            quotes.map((q) => (
              <div key={q.id} className="card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{q.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[q.status]}`}>
                        {q.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{q.address}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <a href={`tel:${q.phone}`} className="text-garden-700 hover:underline">📞 {q.phone}</a>
                      <a href={`mailto:${q.email}`} className="text-garden-700 hover:underline">✉️ {q.email}</a>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 shrink-0">
                    {new Date(q.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </div>

                {q.preferences && Object.keys(q.preferences).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
                    <span className="font-medium">Preferences: </span>
                    {q.preferences.needs_improving?.join(", ")} ·{" "}
                    {q.preferences.garden_type} ·{" "}
                    {q.preferences.add_flowers ? "wants flowers" : "no flowers"}
                  </div>
                )}

                <div className="mt-3 flex gap-2 flex-wrap">
                  <a href={`tel:${q.phone}`} className="btn-primary py-1.5 text-xs">Call</a>
                  <a href={`mailto:${q.email}`} className="btn-secondary py-1.5 text-xs">Email</a>
                  {q.image_url && (
                    <a href={q.image_url} target="_blank" rel="noopener noreferrer" className="btn-secondary py-1.5 text-xs">
                      View Photo
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
