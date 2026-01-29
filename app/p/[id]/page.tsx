import { headers } from "next/headers";
import CopyButton from "@/app/components/CopyButton";

/**
 * Forces dynamic rendering.
 * Required because this page depends on:
 * - Request headers (host, protocol)
 * - A non-cacheable API request
 */
export const dynamic = "force-dynamic";

interface PageProps {
  /**
   * Route parameters provided by the App Router.
   * Declared as a Promise to support async resolution.
   */
  params: Promise<{ id: string }>;
}

/**
 * Server Component responsible for rendering a single paste.
 * Fetches paste content from internal API and renders it securely.
 */
export default async function PastePage({ params }: PageProps) {
  /**
   * Resolve route parameters.
   */
  const { id } = await params;

  /**
   * Guard against missing or malformed IDs.
   * Renders a not-found state instead of throwing to keep UX consistent.
   */
  if (!id) {
    return <NotFound />;
  }

  /**
   * Access request headers on the server.
   * Used to reconstruct the absolute URL for internal API calls.
   */
  const headersList = await headers();
  const host = headersList.get("host");

  /**
   * Resolve protocol based on environment.
   * Avoids mixed-content issues in production.
   */
  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https";

  /**
   * Fetch paste content from internal API.
   * `no-store` ensures:
   * - TTL and view limits are respected
   * - Each request reflects the latest state
   */
  const res = await fetch(
    `${protocol}://${host}/api/pastes/${id}`,
    { cache: "no-store" }
  );

  /**
   * Treat all non-200 responses as not found.
   * Prevents leaking information about paste state.
   */
  if (!res.ok) {
    return <NotFound />;
  }

  /**
   * Parse API response.
   * Expected shape: { content, remaining_views, expires_at }
   */
  const data = await res.json();

  /**
   * Render paste content.
   * - Server-rendered for performance and SEO
   * - Copy button delegated to a client component
   */
  return (
    <main className="min-h-screen bg-slate-900 text-slate-200 px-4 py-10 font-mono">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-sky-400">
            Paste
          </h1>

          {/* Client Component used for clipboard interaction */}
          <CopyButton text={data.content} />
        </div>

        <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap">
          {data.content}
        </pre>
      </div>
    </main>
  );
}

/**
 * Shared not-found UI.
 * Intentionally minimal and neutral to avoid information leakage.
 */
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400 font-mono">
      404 – Paste not found
    </div>
  );
}
