export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

export function handleOptions(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  return undefined;
}

export function requireAuth(request: Request) {
  const authorization = request.headers.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return jsonResponse(
      {
        error: 'unauthorized',
        message: 'A Supabase Authorization bearer token is required.',
      },
      401
    );
  }

  return undefined;
}

export async function readJson<TBody>(request: Request): Promise<TBody> {
  try {
    return (await request.json()) as TBody;
  } catch {
    return {} as TBody;
  }
}

export function mockRunId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}
