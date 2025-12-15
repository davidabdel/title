
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
    const cleanQ = q.trim();

    // 1. Try "State Postcode" pattern (e.g. NSW 2000)
    const locationRegex = /\s+(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\s+(\d{4})$/i;
    const match = cleanQ.match(locationRegex);

    if (match) {
      state = match[1].toUpperCase();
      postcode = match[2];
      const remainder = cleanQ.substring(0, match.index).trim();
      // Split remainder logic...
      if (remainder.includes(',')) {
        const parts = remainder.split(',');
        street = parts[0].trim();
        suburb = parts[1].trim();
      } else {
        street = remainder; // Fallback
        // Try to find suburb by looking at last words? hard without delimiters
        // basic fallback:
        const separateIdx = remainder.lastIndexOf(' ');
        if (separateIdx > -1) {
          suburb = remainder.substring(separateIdx + 1);
          street = remainder.substring(0, separateIdx);
        }
      }
    } else {
      // 2. Try just "Postcode" pattern (e.g. Westmead 2145)
      const postcodeRegex = /\s+(\d{4})$/;
      const pcMatch = cleanQ.match(postcodeRegex);
      if (pcMatch) {
        postcode = pcMatch[1];
        const remainder = cleanQ.substring(0, pcMatch.index).trim();

        // Remainder is "Street, Suburb" or "Street Suburb"
        if (remainder.includes(',')) {
          const splits = remainder.split(',');
          street = splits[0].trim();
          suburb = splits[1].trim();
        } else {
          // "49-51 Good Street Westmead"
          // Assume last word is Suburb
          const separateIdx = remainder.lastIndexOf(' ');
          if (separateIdx > -1) {
            suburb = remainder.substring(separateIdx + 1);
            street = remainder.substring(0, separateIdx);
          } else {
            street = remainder;
          }
        }
      } else {
        // 3. Fallback csv
        const parts = cleanQ.split(',');
        if (parts.length > 1) {
          street = parts[0].trim();
          suburb = parts[1].trim();
        }
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
  /* 
     DEBUG AUTH:
     Swagger definition says: 
     "Include the provided key in the Authorization header as follows: Authorization: ApiKey <key>"
  */
  console.log(`[API] Auth Header Preview: ApiKey ${API_KEY.substring(0, 10)}...`);

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Authorization': `ApiKey ${API_KEY}`,
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
