"use client";

import { useState, useRef } from "react";

export default function ImportClientsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("csv", file);
    formData.append("admin_secret", process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "");

    try {
      const res = await fetch("/api/admin/import-clients", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-garden-900 text-white py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <a href="/admin" className="text-garden-300 text-sm hover:text-white">← Admin Dashboard</a>
          <h1 className="font-display text-3xl font-bold mt-2">Import Clients</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 space-y-8">
        {/* CSV format */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-3">CSV Format</h2>
          <p className="text-sm text-gray-600 mb-4">
            Your CSV file should have the following columns (header row required):
          </p>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs text-gray-700 overflow-x-auto">
            name,address,phone,last_visit,paid<br />
            Jane Smith,&quot;1 High St, Northampton, NN1 1AA&quot;,07700900000,2024-01-15,true<br />
            John Brown,&quot;2 Mill Lane, Kettering, NN16 0QQ&quot;,07711000000,,false
          </div>
          <p className="text-xs text-gray-400 mt-3">
            • <strong>name</strong>, <strong>address</strong>, <strong>phone</strong> are required<br />
            • <strong>last_visit</strong>: YYYY-MM-DD format or leave blank<br />
            • <strong>paid</strong>: true or false
          </p>
        </div>

        {/* Upload */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Upload CSV</h2>

          <div
            className="border-2 border-dashed border-garden-300 rounded-lg p-8 text-center cursor-pointer hover:border-garden-500 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <div className="text-3xl mb-2">📂</div>
            <p className="text-sm text-gray-500">Click to select your CSV file</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleUpload}
              disabled={loading}
            />
          </div>

          {loading && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Importing clients...
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                ✅ Successfully imported {result.imported} client{result.imported !== 1 ? "s" : ""}.
              </div>
              {result.errors.length > 0 && (
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-700">
                  <p className="font-medium mb-1">Some rows had issues:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
              <a href="/admin" className="btn-primary inline-block">
                Back to Dashboard →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
