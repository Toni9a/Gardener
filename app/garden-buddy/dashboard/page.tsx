"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import type { ClientDashboardData } from "@/types";
import { getWateringMessage } from "@/lib/weather";

function ScoreDisplay({ score }: { score: number }) {
  const color =
    score >= 90 ? "text-green-600" :
    score >= 75 ? "text-green-500" :
    score >= 60 ? "text-yellow-500" :
    score >= 40 ? "text-orange-500" : "text-red-500";

  const label =
    score >= 90 ? "Excellent" :
    score >= 75 ? "Healthy" :
    score >= 60 ? "Needs Water" :
    score >= 40 ? "Stressed" : "Critical";

  return (
    <div className="text-center">
      <div className={`text-6xl font-bold ${color}`}>{score}</div>
      <div className={`text-sm font-semibold uppercase tracking-wide mt-1 ${color}`}>{label}</div>
    </div>
  );
}

export default function GardenBuddyDashboard() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [data, setData] = useState<ClientDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Watering state
  const [wateringLogged, setWateringLogged] = useState(false);
  const [wateringLoading, setWateringLoading] = useState(false);

  async function fetchDashboard() {
    if (!token) { setError("No access token provided."); setLoading(false); return; }
    try {
      const res = await fetch(`/api/garden-buddy/dashboard?token=${token}`);
      if (!res.ok) throw new Error("Access denied. Please check your login details.");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchDashboard(); }, [token]);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("token", token);

    try {
      const res = await fetch("/api/garden-buddy/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed. Please try again.");
      setUploadSuccess(true);
      await fetchDashboard();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function logWatering(watered: boolean) {
    if (!token) return;
    setWateringLoading(true);
    try {
      await fetch("/api/garden-buddy/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, watered }),
      });
      setWateringLogged(true);
      await fetchDashboard();
    } finally {
      setWateringLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-garden-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-pulse mb-4">🌿</div>
          <p className="text-gray-500">Loading your garden dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-garden-50 flex items-center justify-center px-4">
        <div className="card p-8 text-center max-w-sm">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <a href="/garden-buddy" className="btn-primary">Try Again</a>
        </div>
      </div>
    );
  }

  const { client, latest_score, recent_scores, recent_watering, rainfall_mm } = data;
  const rainfallData = { rainfall_mm, period_hours: 48, needs_watering: rainfall_mm < 5 };

  const todayWatered = recent_watering.find((w) => {
    const today = new Date().toDateString();
    return new Date(w.logged_at).toDateString() === today;
  });

  return (
    <div className="min-h-screen bg-garden-50">
      {/* Header */}
      <div className="bg-garden-900 text-white py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-garden-300 text-sm">Garden Buddy Dashboard</p>
          <h1 className="font-display text-3xl font-bold mt-1">Hello, {client.name.split(" ")[0]}! 👋</h1>
          <p className="text-garden-200 text-sm mt-1">{client.address}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-6">
        {/* Health score */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900 text-lg">Garden Health Score</h2>
            {client.last_visit && (
              <span className="text-xs text-gray-400">
                Last visit: {new Date(client.last_visit).toLocaleDateString("en-GB")}
              </span>
            )}
          </div>

          {latest_score ? (
            <div className="flex flex-col items-center gap-4">
              <ScoreDisplay score={latest_score.score} />
              {latest_score.analysis_notes && (
                <p className="text-sm text-gray-600 text-center max-w-md leading-relaxed">
                  {latest_score.analysis_notes}
                </p>
              )}
              <p className="text-xs text-gray-400">
                Analysed {new Date(latest_score.analyzed_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">📷</p>
              <p>No score yet — upload a photo to get started.</p>
            </div>
          )}
        </div>

        {/* Watering */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 text-lg mb-2">Watering</h2>
          <p className="text-sm text-gray-600 mb-4">{getWateringMessage(rainfallData)}</p>

          {todayWatered !== undefined || wateringLogged ? (
            <div className="rounded-lg bg-garden-50 border border-garden-200 px-4 py-3 text-sm text-garden-700">
              {todayWatered?.watered || wateringLogged
                ? "✅ Great — you&apos;ve logged watering today."
                : "📝 You logged that you haven&apos;t watered yet today."}
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Did you water your garden today?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => logWatering(true)}
                  disabled={wateringLoading}
                  className="btn-primary flex-1 py-3"
                >
                  ✅ Yes
                </button>
                <button
                  onClick={() => logWatering(false)}
                  disabled={wateringLoading}
                  className="btn-secondary flex-1 py-3"
                >
                  Not yet
                </button>
              </div>
            </div>
          )}

          {/* Watering history */}
          {recent_watering.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Recent Logs</p>
              <div className="space-y-2">
                {recent_watering.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {new Date(log.logged_at).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                    </span>
                    <span className={log.watered ? "text-green-600 font-medium" : "text-gray-400"}>
                      {log.watered ? "✅ Watered" : "⏭ Skipped"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upload photo */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 text-lg mb-2">Upload Garden Photo</h2>
          <p className="text-sm text-gray-600 mb-4">
            Upload a photo once or twice a week for an updated health score.
          </p>

          {uploadSuccess && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 mb-4">
              ✅ Photo uploaded and analysed! Your health score has been updated.
            </div>
          )}
          {uploadError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
              {uploadError}
            </div>
          )}

          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-primary w-full py-3"
          >
            {uploading ? "Uploading & Analysing..." : "📷 Upload Garden Photo"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </div>

        {/* Score history */}
        {recent_scores.length > 1 && (
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 text-lg mb-4">Health Score History</h2>
            <div className="space-y-3">
              {recent_scores.map((score, i) => (
                <div key={score.id} className="flex items-center gap-4">
                  <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden">
                    <Image src={score.image_url} alt="Garden" fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {new Date(score.analyzed_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                      <span className={`font-bold text-lg ${
                        score.score >= 75 ? "text-green-600" : score.score >= 60 ? "text-yellow-500" : score.score >= 40 ? "text-orange-500" : "text-red-500"
                      }`}>
                        {score.score}
                      </span>
                    </div>
                    {i < recent_scores.length - 1 && (
                      <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full transition-all ${score.score >= 75 ? "bg-green-500" : score.score >= 60 ? "bg-yellow-400" : score.score >= 40 ? "bg-orange-400" : "bg-red-500"}`}
                          style={{ width: `${score.score}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
