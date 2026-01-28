export const dynamic = "force-dynamic";

interface PageProps {
    params: { id: string };
}

export default async function PastePage({ params }: PageProps) {
    const id = params.id;

    if (!id) {
        return <h1>404 – Paste not found</h1>;
    }

    const res = await fetch(`/api/pastes/${id}`, {
        cache: "no-store",
    });

    if (!res.ok) {
        return <h1>404 – Paste not found</h1>;
    }

    const data = await res.json();

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
                {data.content}
            </pre>
        </main>
    );
}
