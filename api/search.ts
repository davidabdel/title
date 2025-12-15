
export const config = {
  runtime: 'edge',
};

// Fallback is provided but environment variable is preferred
const API_KEY = process.env.INFOTRACK_API_KEY || "XcDVk/K/ZugnYoiLsI3wIiQ+zS9lIB0LCbJgsRhrCEolRNs7bPvThTb5/611opvnIG6Eyorh1BjSaWQszFFek9RzCVJcMfOvSXAZ3TVgojQ=";
// Update base URL to match the documentation path root if needed, or keep stagesearch logic
const HOST = "https://stagesearch.infotrack.com.au";
const ENDPOINT = "/v3/api/national/titles/address";

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q) {
    return new Response(JSON.stringify({ error: 'Query parameter required' }), { status: 400 });
  }

  console.log(`[API] Processing Search: ${q}`);

  // Simple Address Parser
  // Expected format: "123 Street Name, Suburb State Postcode"
  // This is a naive implementation; production would use a robust address parser library.
  let street = q;
  let suburb = "";
  let state = "NSW"; // Default
  let postcode = "";

  try {
    // Very basic split logic
    const parts = q.split(',');
    if (parts.length > 1) {
      street = parts[0].trim();
      const remainder = parts[parts.length - 1].trim();

      // Try to extract State and Postcode from end
      const stateMatch = remainder.match(/\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\b/i);
      const postCodeMatch = remainder.match(/\b(\d{4})\b/);

      if (stateMatch) state = stateMatch[0].toUpperCase();
      if (postCodeMatch) postcode = postCodeMatch[0];

      // Suburb is likely what's left in the remainder before state/postcode
      suburb = remainder
        .replace(state, '')
        .replace(postcode, '')
        .trim();
    }
  } catch (e) {
    console.warn("[API] Address parsing failed, using defaults");
  }

  const targetUrl = `${HOST}${ENDPOINT}?state=${state}`;
  console.log(`[API] Target URL: ${targetUrl}`);

  const body = {
    streetAddress: street,
    suburb: suburb,
    postcode: postcode
  };
  console.log(`[API] Request Body: ${JSON.stringify(body)}`);

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      console.error(`[API] InfoTrack Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(`[API] Response body: ${text}`);
      return new Response(JSON.stringify({
        error: `Provider Error: ${response.statusText}`,
        details: text
      }), { status: response.status });
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
