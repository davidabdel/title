
export const config = {
  runtime: 'edge',
};

// Fallback is provided but environment variable is preferred
const API_KEY = process.env.INFOTRACK_API_KEY || "XcDVk/K/ZugnYoiLsI3wIiQ+zS9lIB0LCbJgsRhrCEolRNs7bPvThTb5/611opvnIG6Eyorh1BjSaWQszFFek9RzCVJcMfOvSXAZ3TVgojQ=";
// Update base URL to match the documentation path root if needed, or keep stagesearch logic
// PROD HOST: https://search.infotrack.com.au
// STAGE HOST: https://stagesearch.infotrack.com.au
const HOST = process.env.INFOTRACK_HOST || "https://stagesearch.infotrack.com.au";
// Prepend /service/au-api based on Swagger URL pattern observed in docs
const ENDPOINT = "/service/au-api/v3/api/national/titles/address";

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q) {
    return new Response(JSON.stringify({ error: 'Query parameter required' }), { status: 400 });
  }

  console.log(`[API] Processing Search: ${q}`);

  // Simple Address Parser
  // Parsing logic to handle both "Street, Suburb" and "Street Suburb State Postcode" formats
  let street = q;
  let suburb = "";
  let state = "NSW"; // Default
  let postcode = "";

  try {
    // Clean up string
    const cleanQ = q.trim();

    // Regex to find State and Postcode at the end
    // Matches: ... (NSW|VIC...) (DDDD)
    const locationRegex = /\s+(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\s+(\d{4})$/i;
    const match = cleanQ.match(locationRegex);

    if (match) {
      state = match[1].toUpperCase();
      postcode = match[2];

      // Remove State and Postcode from remainder
      let remainder = cleanQ.substring(0, match.index).trim();

      // Now try to separate Street from Suburb. 
      // This is hard without a comma. We'll check if there is a comma.
      if (remainder.includes(',')) {
        const parts = remainder.split(',');
        street = parts[0].trim();
        suburb = parts[1].trim();
      } else {
        // Heuristic: Assume last word is Suburb (bad assumption but better than nothing for "Westmead")
        // Or better, just put it all in street if unsure, but API likely wants suburb.
        // Let's assume the user entered "Unit 1 49-51 Good Street Westmead"
        // Street: Unit 1 49-51 Good Street
        // Suburb: Westmead

        const lastSpaceIndex = remainder.lastIndexOf(' ');
        if (lastSpaceIndex > -1) {
          suburb = remainder.substring(lastSpaceIndex + 1);
          street = remainder.substring(0, lastSpaceIndex);
        } else {
          street = remainder;
        }
      }
    } else {
      // If no state/postcode found at end, fall back to simple comma split or default
      const parts = cleanQ.split(',');
      if (parts.length > 1) {
        street = parts[0].trim();
        suburb = parts[1].trim();
      }
    }
  } catch (e) {
    console.warn("[API] Address parsing failed, using simple fallback");
  }

  const targetUrl = `${HOST}${ENDPOINT}?state=${state}`;
  console.log(`[API] Target URL: ${targetUrl}`);

  const body = {
    streetAddress: street,
    suburb: suburb,
    postcode: postcode
  };
  console.log(`[API] Request Body: ${JSON.stringify(body)}`);

  /* 
     DEBUG AUTH:
     Key is binary when decoded, so it is likely an Opaque Token (Bearer).
     Switching from Basic to Bearer.
  */
  console.log(`[API] Auth Header Preview: Bearer ${API_KEY.substring(0, 10)}...`);

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
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
