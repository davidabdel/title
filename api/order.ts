import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

const API_KEY = process.env.INFOTRACK_API_KEY || "XcDVk/K/ZugnYoiLsI3wIiQ+zS9lIB0LCbJgsRhrCEolRNs7bPvThTb5/611opvnIG6Eyorh1BjSaWQszFFek9RzCVJcMfOvSXAZ3TVgojQ=";
const HOST = process.env.INFOTRACK_HOST || "https://stagesearch.infotrack.com.au";
const ENDPOINT = `${HOST}/service/au-api/v3/api/national/titles/address`;

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();
    const { street, suburb, state, postcode, clientReference, titleReference } = body;

    // Address Parsing Logic (Duplicated from search.ts for robustness)
    let streetNumberString = "";
    let streetName = "";
    let streetType = "";

    if (street) {
      const parts = street.trim().split(/\s+/);
      if (parts.length > 0) {
        streetNumberString = parts[0];
        // Identify if the first part is actually a number
        if (!/^\d/.test(streetNumberString)) {
          // Fallback if no number found at start
          streetNumberString = "";
          streetName = parts.join(' ');
        } else {
          streetName = parts.slice(1).join(' ');
        }
      }
    }

    let streetNumberObj = {};
    if (streetNumberString.includes('-')) {
      const rangeParts = streetNumberString.split('-');
      streetNumberObj = {
        streetNumberFrom: rangeParts[0],
        streetNumberTo: rangeParts[1]
      };
    } else {
      streetNumberObj = {
        streetNumberFrom: streetNumberString
      };
    }

    if (streetName) {
      const nameParts = streetName.split(/\s+/);
      if (nameParts.length > 1) {
        const lastWord = nameParts[nameParts.length - 1];
        if (/^[a-zA-Z]+$/.test(lastWord)) {
          streetType = lastWord;
          streetName = nameParts.slice(0, -1).join(' ');
        }
      }
    }

    const infoTrackBody = {
      streetNumber: streetNumberObj,
      streetName: streetName,
      streetType: streetType,
      suburb: suburb,
      state: state, // Ensure simple state (e.g. 'NSW')
      postcode: postcode,
      autoOrderPrimaryTitle: true, // TRIGGER ORDER
      clientReference: clientReference || `TitleFlow-${Date.now()}`
    };

    console.log(`[API Order] Placing Order:`, JSON.stringify(infoTrackBody));

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `ApiKey ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(infoTrackBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Order] Error ${response.status}:`, errorText);
      return new Response(JSON.stringify({ error: 'Order failed provider' }), { status: response.status });
    }

    const data = await response.json();
    console.log('[API Order] Success:', data);

    // Check if we got an orderId
    // Response might be { orderId: 123, ... } or { titleOrders: [...] }
    let orderId = data.orderId;
    if (!orderId && data.titleOrders && data.titleOrders.length > 0) {
      orderId = data.titleOrders[0].orderId;
    }

    return new Response(JSON.stringify({ ...data, orderId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('[API Order] Exception:', error);
    return new Response(JSON.stringify({ error: 'Failed to place order' }), { status: 500 });
  }
}
