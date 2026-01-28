"use client";

import { useState, useMemo } from "react";

export default function HomePage() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const isDisabled = Boolean(validationError) || isLoading;

  /* ---------------- Submit ---------------- */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResultUrl("");
    setCopied(false);

    if (validationError) {
      setError(validationError);
      return;
    }

    const body: any = { content };
    if (ttl) body.ttl_seconds = Number(ttl);
    if (maxViews) body.max_views = Number(maxViews);

    try {
      setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  }

  /* ---------------- Copy ---------------- */

  async function handleCopy() {
    if (!resultUrl) return;
    await navigator.clipboard.writeText(resultUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /* ---------------- UI ---------------- */

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-sky-400 mb-6">
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
              disabled={isLoading}
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
              disabled={isLoading}
            />

            <input
              type="number"
              placeholder="Max views"
              className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-200
                         focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isDisabled}
            className={`w-full sm:w-auto px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2
              ${
                isDisabled
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-sky-500 hover:bg-sky-400 text-slate-900"
              }`}
          >
            {isLoading && (
              <span className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            )}
            {isLoading ? "Creating..." : "Create Paste"}
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
          <div className="mt-4 bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row gap-3 sm:items-center">
            <a
              href={resultUrl}
              target="_blank"
              className="text-sky-400 underline break-all flex-1"
            >
              {resultUrl}
            </a>

            <button
              onClick={handleCopy}
              className="px-4 py-1.5 rounded-md text-sm font-medium
                         bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
