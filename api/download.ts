
export const config = {
  runtime: 'edge',
};

const API_KEY = "XcDVk/K/ZugnYoiLsI3wIiQ+zS9lIB0LCbJgsRhrCEolRNs7bPvThTb5/611opvnIG6Eyorh1BjSaWQszFFek9RzCVJcMfOvSXAZ3TVgojQ=";
const BASE_URL = "https://stagesearch.infotrack.com.au/services/customer-propertyenquiry/v1";

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return new Response(JSON.stringify({ error: 'Order ID required' }), { status: 400 });
  }

  try {
    const response = await fetch(`${BASE_URL}/orders/${orderId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${API_KEY}`
      }
    });

    if (!response.ok) {
       return new Response(JSON.stringify({ error: 'Download failed' }), { status: response.status });
    }

    const blob = await response.blob();
    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Disposition': response.headers.get('Content-Disposition') || `attachment; filename="document-${orderId}.pdf"`
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to download document' }), { status: 500 });
  }
}
