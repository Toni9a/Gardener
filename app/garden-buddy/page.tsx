"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GardenBuddyLoginPage() {
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [mode, setMode] = useState<"phone" | "link">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const body = mode === "phone" ? { phone } : { token };
      const res = await fetch("/api/garden-buddy/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Login failed. Please check your details.");
      }

      const data = await res.json();
      router.push(`/garden-buddy/dashboard?token=${data.access_token}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-garden-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🌱</div>
          <h1 className="font-display text-3xl font-bold text-garden-900">Garden Buddy</h1>
          <p className="mt-2 text-gray-600">
            Track your garden health, watering logs, and care reminders.
          </p>
        </div>

        <div className="card p-8">
          {/* Mode toggle */}
          <div className="flex rounded-lg border border-gray-200 mb-6 overflow-hidden">
            <button
              type="button"
              onClick={() => setMode("phone")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "phone" ? "bg-garden-700 text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Phone Number
            </button>
            <button
              type="button"
              onClick={() => setMode("link")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "link" ? "bg-garden-700 text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Private Link
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {mode === "phone" ? (
              <div>
                <label className="label" htmlFor="phone">Your Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  className="input"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07700 900000"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Use the phone number you gave to GardenScene.
                </p>
              </div>
            ) : (
              <div>
                <label className="label" htmlFor="token">Access Code</label>
                <input
                  id="token"
                  type="text"
                  className="input font-mono"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your private access code"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Found in the private link GardenScene sent you.
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Logging in..." : "Access My Garden →"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Not a client yet?{" "}
            <a href="/quote" className="text-garden-600 hover:text-garden-800">Get a quote here</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
