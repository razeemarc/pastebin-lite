"use client";

import { useState } from "react";

export default function HomePage() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResultUrl("");

    const body: any = { content };
    if (ttl) body.ttl_seconds = Number(ttl);
    if (maxViews) body.max_views = Number(maxViews);

    try {
      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setResultUrl(data.url);
      setContent("");
      setTtl("");
      setMaxViews("");
    } catch {
      setError("Network error");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-sky-400 mb-6">
          Pastebin Lite
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-4"
        >
          <textarea
            className="w-full h-48 bg-slate-900 border border-slate-700 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Paste your text here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <div className="flex gap-3">
            <input
              type="number"
              placeholder="TTL (seconds)"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-md p-2 text-sm"
              value={ttl}
              onChange={(e) => setTtl(e.target.value)}
            />
            <input
              type="number"
              placeholder="Max views"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-md p-2 text-sm"
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="bg-sky-500 hover:bg-sky-400 text-slate-900 font-semibold px-4 py-2 rounded-md"
          >
            Create Paste
          </button>
        </form>

        {error && (
          <p className="text-red-400 mt-3">{error}</p>
        )}

        {resultUrl && (
          <p className="mt-4">
            <span className="text-slate-400">Paste created:</span>{" "}
            <a
              href={resultUrl}
              target="_blank"
              className="text-sky-400 underline"
            >
              {resultUrl}
            </a>
          </p>
        )}
      </div>
    </main>
  );
}
