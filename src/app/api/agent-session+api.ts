// Proxy endpoints so the mobile app never holds the agent server URL as a secret.

const AGENT_SERVER_URL = process.env.AGENT_SERVER_URL ?? 'http://localhost:8000';

export async function POST(request: Request): Promise<Response> {
  const body = await request.json() as { callId: string; callType?: string };
  const { callId, callType = 'default' } = body;

  if (!callId) {
    return Response.json({ error: 'Missing callId' }, { status: 400 });
  }

  try {
    const res = await fetch(`${AGENT_SERVER_URL}/calls/${callId}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ call_type: callType }),
    });

    if (!res.ok) {
      const text = await res.text();
      return Response.json({ error: text || 'Agent server error' }, { status: res.status });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not reach agent server';
    return Response.json({ error: msg }, { status: 503 });
  }
}

export async function DELETE(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const callId = url.searchParams.get('callId');
  const sessionId = url.searchParams.get('sessionId');

  if (!callId || !sessionId) {
    return Response.json({ error: 'Missing callId or sessionId' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${AGENT_SERVER_URL}/calls/${callId}/sessions/${sessionId}`,
      { method: 'DELETE' },
    );

    if (!res.ok) {
      const text = await res.text();
      return Response.json({ error: text || 'Agent server error' }, { status: res.status });
    }

    return Response.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not reach agent server';
    return Response.json({ error: msg }, { status: 503 });
  }
}
