const RAG_URL = process.env.RAG_SERVICE_URL ?? 'http://localhost:8001';

export async function queryRag(question: string): Promise<string> {
    const res = await fetch(`${RAG_URL}/rag`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ question }),
    });

    if (!res.ok) {
        throw new Error(`RAG service error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json() as { answer?: string };
    return data.answer ?? 'No response from AI';
}