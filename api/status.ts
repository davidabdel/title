import { NextRequest } from 'next/server';

export const config = {
    runtime: 'edge',
};

const API_KEY = process.env.INFOTRACK_API_KEY || "XcDVk/K/ZugnYoiLsI3wIiQ+zS9lIB0LCbJgsRhrCEolRNs7bPvThTb5/611opvnIG6Eyorh1BjSaWQszFFek9RzCVJcMfOvSXAZ3TVgojQ=";
const HOST = process.env.INFOTRACK_HOST || "https://stagesearch.infotrack.com.au";

export default async function handler(req: Request) {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
        return new Response(JSON.stringify({ error: 'Order ID required' }), { status: 400 });
    }

    // Determine endpoint based on what we are polling. 
    // For now, assume it is an Address Search Order.
    // Endpoint: GET /v3/api/national/titles/address/{orderId}

    const targetUrl = `${HOST}/service/au-api/v3/api/national/titles/address/${orderId}`;

    console.log(`[API Status] Polling: ${targetUrl}`);

    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Authorization': `ApiKey ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`[API Status] Error ${response.status}: ${response.statusText}`);
            // Pass through error
            return new Response(JSON.stringify({ error: response.statusText }), { status: response.status });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('[API Status] Network Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
