
export const config = {
  runtime: 'edge',
};

const API_KEY = "XcDVk/K/ZugnYoiLsI3wIiQ+zS9lIB0LCbJgsRhrCEolRNs7bPvThTb5/611opvnIG6Eyorh1BjSaWQszFFek9RzCVJcMfOvSXAZ3TVgojQ=";
const BASE_URL = "https://stagesearch.infotrack.com.au/services/customer-propertyenquiry/v1";

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q) {
    return new Response(JSON.stringify({ error: 'Query parameter required' }), { status: 400 });
  }

  try {
    const response = await fetch(`${BASE_URL}/properties?q=${encodeURIComponent(q)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to connect to InfoTrack' }), { status: 500 });
  }
}
