"use client";

export default function CopyButton({ text }: { text: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text)}
      className="bg-sky-500 hover:bg-sky-400 text-slate-900 text-sm px-3 py-1 rounded-md"
    >
      Copy
    </button>
  );
}
