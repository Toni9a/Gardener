import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import type { Client, GardenHealthScore, QuoteRequest } from "@/types";

async function getStats() {
  const db = supabaseAdmin();
  const [
    { count: clientCount },
    { count: quoteCount },
    { data: latestScores },
  ] = await Promise.all([
    db.from("clients").select("*", { count: "exact", head: true }).eq("active", true),
    db.from("quote_requests").select("*", { count: "exact", head: true }).eq("status", "new"),
    db.from("garden_health_scores").select("client_id, score").order("analyzed_at", { ascending: false }).limit(50),
  ]);

  return { clientCount: clientCount ?? 0, quoteCount: quoteCount ?? 0, latestScores: latestScores ?? [] };
}

async function getClients(): Promise<(Client & { latest_score?: number })[]> {
  const db = supabaseAdmin();
  const { data: clients } = await db
    .from("clients")
    .select("*")
    .eq("active", true)
    .order("name");

  const { data: scores } = await db
    .from("garden_health_scores")
    .select("client_id, score, analyzed_at")
    .order("analyzed_at", { ascending: false });

  const latestScoreMap: Record<string, number> = {};
  for (const s of scores ?? []) {
    if (!latestScoreMap[s.client_id]) latestScoreMap[s.client_id] = s.score;
  }

  return (clients ?? []).map((c) => ({
    ...c,
    latest_score: latestScoreMap[c.id],
  }));
}

async function getNewQuotes(): Promise<QuoteRequest[]> {
  const db = supabaseAdmin();
  const { data } = await db
    .from("quote_requests")
    .select("*")
    .eq("status", "new")
    .order("created_at", { ascending: false })
    .limit(5);
  return data ?? [];
}

function scoreColor(score?: number) {
  if (!score) return "text-gray-400";
  if (score >= 90) return "text-green-600";
  if (score >= 75) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

export default async function AdminPage() {
  const [{ clientCount, quoteCount }, clients, newQuotes] = await Promise.all([
    getStats(),
    getClients(),
    getNewQuotes(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-garden-900 text-white py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-garden-300 text-sm">GardenScene</p>
          <h1 className="font-display text-3xl font-bold mt-1">Admin Dashboard</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="card p-5 text-center">
            <div className="text-3xl font-bold text-garden-700">{clientCount}</div>
            <div className="text-sm text-gray-500 mt-1">Active Clients</div>
          </div>
          <div className="card p-5 text-center">
            <div className="text-3xl font-bold text-earth-600">{quoteCount}</div>
            <div className="text-sm text-gray-500 mt-1">New Quotes</div>
          </div>
          <div className="card p-5 text-center col-span-2 sm:col-span-1">
            <Link href="/admin/clients/import" className="btn-primary w-full text-xs py-2">
              Import Clients (CSV)
            </Link>
            <Link href="/admin/portfolio" className="mt-2 btn-secondary w-full text-xs py-2">
              Manage Portfolio
            </Link>
          </div>
        </div>

        {/* New quote requests */}
        {newQuotes.length > 0 && (
          <div>
            <h2 className="font-semibold text-gray-900 text-lg mb-4">New Quote Requests</h2>
            <div className="space-y-3">
              {newQuotes.map((q) => (
                <div key={q.id} className="card p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{q.name}</p>
                    <p className="text-sm text-gray-500">{q.address}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      📞 {q.phone} · ✉️ {q.email} ·{" "}
                      {new Date(q.created_at).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <a href={`tel:${q.phone}`} className="btn-primary py-2 text-xs">Call</a>
                    <a href={`mailto:${q.email}`} className="btn-secondary py-2 text-xs">Email</a>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/admin/quotes" className="mt-3 text-sm text-garden-600 hover:text-garden-800 block">
              View all quotes →
            </Link>
          </div>
        )}

        {/* Client table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-lg">Clients</h2>
            <Link href="/admin/clients/new" className="btn-primary py-2 text-xs">
              + Add Client
            </Link>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600">Client</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Address</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Last Visit</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Paid</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Health</th>
                  <th className="px-4 py-3 font-semibold text-gray-600"></th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      No clients yet.{" "}
                      <Link href="/admin/clients/import" className="text-garden-600 hover:underline">
                        Import from CSV
                      </Link>
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{client.name}</div>
                        <div className="text-gray-400 text-xs">{client.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{client.address}</td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                        {client.last_visit
                          ? new Date(client.last_visit).toLocaleDateString("en-GB")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {client.paid ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 font-medium">Paid</span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600 font-medium">Unpaid</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 font-bold text-lg ${scoreColor(client.latest_score)}`}>
                        {client.latest_score ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/clients/${client.id}`}
                          className="text-xs text-garden-600 hover:text-garden-800"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
