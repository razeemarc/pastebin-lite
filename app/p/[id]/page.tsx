import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface Props {
  params: { id: string };
}

export default async function PastePage({ params }: Props) {
  const paste = await prisma.paste.findUnique({
    where: { id: params.id },
  });

  if (!paste) {
    notFound();
  }

  // Check expiry
  if (paste.expiresAt && paste.expiresAt < new Date()) {
    notFound();
  }

  // Check view limit
  if (paste.maxViews !== null && paste.viewCount >= paste.maxViews) {
    notFound();
  }

  // Increment view count
  await prisma.paste.update({
    where: { id: params.id },
    data: {
      viewCount: { increment: 1 },
    },
  });

  return (
    <main style={{ padding: 20 }}>
      <h2>Paste</h2>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          background: "#f4f4f4",
          padding: 10,
        }}
      >
        {paste.content}
      </pre>
    </main>
  );
}
