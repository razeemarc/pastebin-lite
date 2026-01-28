"use client";

import { useState, useMemo } from "react";

export default function HomePage() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");

  /* ---------------- Validation ---------------- */

  const validationError = useMemo(() => {
    if (!content.trim()) return "Content is required";
    if (content.length < 5) return "Content must be at least 5 characters";
    if (content.length > 10000) return "Content is too long";

    if (ttl) {
      const ttlNum = Number(ttl);
      if (Number.isNaN(ttlNum)) return "TTL must be a number";
      if (ttlNum < 10) return "TTL must be at least 10 seconds";
      if (ttlNum > 604800) return "TTL cannot exceed 7 days";
    }

    if (maxViews) {
      const viewsNum = Number(maxViews);
      if (!Number.isInteger(viewsNum)) return "Max views must be an integer";
      if (viewsNum < 1) return "Max views must be at least 1";
      if (viewsNum > 1000) return "Max views cannot exceed 1000";
    }

    return "";
  }, [content, ttl, maxViews]);

  const isDisabled = Boolean(validationError);

  /* ---------------- Submit ---------------- */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResultUrl("");

    if (validationError) {
      setError(validationError);
      return;
    }

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

  /* ---------------- UI ---------------- */

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-sky-400 mb-6 text-center sm:text-left">
          Pastebin Lite
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 space-y-4"
        >
          {/* Textarea */}
          <div>
            <textarea
              className="w-full h-48 sm:h-56 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200
                         focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              placeholder="Paste your text here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-between text-xs mt-1 text-slate-400">
              <span>{content.length} / 10000</span>
              <span>Minimum 5 characters</span>
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="TTL (seconds)"
              className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-200
                         focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={ttl}
              onChange={(e) => setTtl(e.target.value)}
              min={10}
              max={604800}
            />

            <input
              type="number"
              placeholder="Max views"
              className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-200
                         focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              min={1}
              max={1000}
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isDisabled}
            className={`w-full sm:w-auto px-6 py-2 rounded-lg font-semibold transition
              ${
                isDisabled
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-sky-500 hover:bg-sky-400 text-slate-900"
              }`}
          >
            Create Paste
          </button>
        </form>

        {/* Errors */}
        {(error || validationError) && (
          <p className="text-red-400 mt-3 text-sm">
            {error || validationError}
          </p>
        )}

        {/* Result */}
        {resultUrl && (
          <p className="mt-4 text-sm">
            <span className="text-slate-400">Paste created:</span>{" "}
            <a
              href={resultUrl}
              target="_blank"
              className="text-sky-400 underline break-all"
            >
              {resultUrl}
            </a>
          </p>
        )}
      </div>
    </main>
  );
}
