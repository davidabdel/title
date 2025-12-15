
export const config = {
  runtime: 'edge',
};

// Fallback is provided but environment variable is preferred
const API_KEY = process.env.INFOTRACK_API_KEY || "XcDVk/K/ZugnYoiLsI3wIiQ+zS9lIB0LCbJgsRhrCEolRNs7bPvThTb5/611opvnIG6Eyorh1BjSaWQszFFek9RzCVJcMfOvSXAZ3TVgojQ=";
const BASE_URL = process.env.INFOTRACK_API_URL || "https://stagesearch.infotrack.com.au/services/customer-propertyenquiry/v1";

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q) {
    return new Response(JSON.stringify({ error: 'Query parameter required' }), { status: 400 });
  }

  console.log(`[API] Searching InfoTrack for: ${q}`);

  try {
    const response = await fetch(`${BASE_URL}/properties?q=${encodeURIComponent(q)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
        console.error(`[API] InfoTrack Error: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error(`[API] Response body: ${text}`);
        return new Response(JSON.stringify({ error: `Provider Error: ${response.statusText}` }), { status: response.status });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[API] Server Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to connect to Property Provider' }), { status: 500 });
  }
}
