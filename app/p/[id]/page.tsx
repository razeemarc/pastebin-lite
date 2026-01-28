import { headers } from "next/headers";
import CopyButton from "@/app/components/CopyButton";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}


export default async function PastePage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    return <NotFound />;
  }

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(
    `${protocol}://${host}/api/pastes/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return <NotFound />;
  }

  const data = await res.json();

  return (
    <main className="min-h-screen bg-slate-900 text-slate-200 px-4 py-10 font-mono">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-sky-400">
            Paste
          </h1>

          {/* ✅ Client Component */}
          <CopyButton text={data.content} />
        </div>

        <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap">
          {data.content}
        </pre>
      </div>
    </main>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400 font-mono">
      404 – Paste not found
    </div>
  );
}
