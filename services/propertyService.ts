import { AddressResult, PropertyDocument } from '../types';
import { MOCK_ADDRESSES, MOCK_DOCUMENTS, USE_MOCK_API } from '../constants';

// Simulated delay for realistic UI
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class PropertyService {
  private static instance: PropertyService;
  private static logListeners: ((msg: string) => void)[] = [];

  private constructor() { }

  public static getInstance(): PropertyService {
    if (!PropertyService.instance) {
      PropertyService.instance = new PropertyService();
    }
    return PropertyService.instance;
  }

  public static onLog(listener: (msg: string) => void) {
    this.logListeners.push(listener);
  }

  private log(msg: string, data?: any) {
    const message = data ? `${msg} ${JSON.stringify(data, null, 2)}` : msg;
    console.log(`[PropertyService] ${message}`);
    PropertyService.logListeners.forEach(l => l(message));
  }

  /**
   * Helper to normalize address for flexible matching
   */
  private normalizeAddress(addr: string): string {
    return addr.toLowerCase()
      .replace(/,/g, '')
      .replace(/\s+street\b/g, ' st')
      .replace(/\s+drive\b/g, ' dr')
      .replace(/\s+road\b/g, ' rd')
      .replace(/\s+avenue\b/g, ' ave')
      .replace(/\s+place\b/g, ' pl')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Searches for a property. 
   * Now calls local Vercel API Route (/api/search) which acts as a proxy.
   */
  async searchAddress(query: string): Promise<AddressResult[]> {
    if (!query) return [];

    // 1. Attempt Real API Call via Vercel Proxy
    if (!USE_MOCK_API) {
      try {
        this.log(`Searching via Proxy for: ${query}`);

        // Call local endpoint
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();
          this.log('API Response received', data);

          // Check for different response structures
          let props: any[] = [];

          if (data.properties) {
            props = data.properties;
          } else if (data.relatedTitles) {
            props = data.relatedTitles.map((t: any) => ({
              titleReference: t.titleReference,
              display: `Title ${t.titleReference}`
            }));
          } else if (data.titleOrders && Array.isArray(data.titleOrders)) {
            // Sometimes results are in titleOrders if it auto-ordered
            props = data.titleOrders.map((t: any) => ({
              titleReference: t.titleReference,
              display: `Order ${t.orderId} - ${t.status}`
            }));
          } else if (data.status === 'Pending' || data.status === 'Waiting') {
            this.log("⚠️ Search initiated but result is Pending. Staging might be slow or require polling.");
            // We could return a dummy 'Pending' result to show the user
            return [{
              id: data.orderId || 'pending',
              fullAddress: query,
              street: 'Processing...',
              suburb: '',
              state: '',
              postcode: '',
              titleReference: `PENDING (Order ${data.orderId})`,
              lotPlan: 'Checking...'
            }];
          }

          if (props.length > 0) {
            return props.map((prop: any) => {
              return {
                id: prop.propertyId || Math.random().toString(36).substr(2, 9),
                fullAddress: prop.address?.fullAddress || prop.description || query,
                street: prop.address?.street || '',
                suburb: prop.address?.suburb || '',
                state: prop.address?.state || '',
                postcode: prop.address?.postcode || '',
                titleReference: prop.titleReference || prop.titleRef || (prop.attributes && prop.attributes.titleReference) || prop.display,
                lotPlan: prop.lotPlan || prop.planLabel || (prop.attributes && prop.attributes.lotPlan)
              };
            });
          }
          this.log('API OK but no properties found.');
          // If response was OK but no properties, return empty list (don't fallback to mock)
          return [];
        } else {
          const errorText = await response.text();
          this.log(`Proxy Error (${response.status}): ${response.statusText}`);
          this.log(`Error Details: ${errorText.substring(0, 150)}`);

          if (response.status === 404) {
            if (errorText.includes('<!DOCTYPE html>')) {
              this.log("⚠️ API Route not found on this environment.");
            } else {
              try {
                const errJson = JSON.parse(errorText);
                this.log(`Provider Message: ${errJson.title || 'Unknown'} - Status ${errJson.status}`);
              } catch (e) {
                this.log("Provider returned 404 (Endpoint likely incorrect)");
              }
            }
          }

          throw new Error(`API Error: ${response.status}`);
        }
      } catch (error: any) {
        this.log('Proxy connection failed', error.message);
        // If we want to ensure we NEVER show mock data when live, we should rethrow or return empty.
        // Returning empty array will show "No results found" instead of fake data.
        return [];
      }
    }

    // 2. Fallback to Mock Data (ONLY if USE_MOCK_API is true)
    await delay(600);
    const normalizedQuery = this.normalizeAddress(query);

    // Fuzzy match logic
    const knownMocks = MOCK_ADDRESSES.filter(addr => {
      const normalizedMock = this.normalizeAddress(addr.fullAddress);
      const normalizedTitle = addr.titleReference ? this.normalizeAddress(addr.titleReference) : '';
      const normalizedLot = addr.lotPlan ? this.normalizeAddress(addr.lotPlan) : '';

      return normalizedMock.includes(normalizedQuery) ||
        normalizedTitle.includes(normalizedQuery) ||
        normalizedLot.includes(normalizedQuery);
    });

    if (knownMocks.length > 0) return knownMocks;

    // Dynamic Mock generation for unknown addresses
    return [{
      id: `sim_${Math.random().toString(36).substr(2, 5)}`,
      fullAddress: query.toUpperCase(),
      street: query.split(',')[0] || query,
      suburb: query.split(',')[1] || 'UNKNOWN',
      state: 'NSW',
      postcode: '2000',
      lotPlan: '1//DP999999',
      titleReference: '1/DP999999'
    }];
  }

  /**
   * Polls for order status.
   * Returns AddressResult[] if complete, null if still pending.
   */
  async pollOrderStatus(orderId: string): Promise<AddressResult[] | null> {
    if (USE_MOCK_API) {
      // Mock simulation
      await delay(2000);
      return [{
        id: 'mock_complete',
        fullAddress: '49-51 Good Street, Westmead 2145',
        street: '49-51 Good Street',
        suburb: 'Westmead',
        titleReference: '1/SP123456',
        lotPlan: 'Lot 1 DP123456',
        state: 'NSW',
        postcode: '2145'
      }];
    }

    try {
      this.log(`Polling status for order ${orderId}...`);
      const response = await fetch(`/api/status?orderId=${orderId}`);
      const data = await response.json();

      // Handle variations in status field ("orderStatus" vs "status")
      const status = data.status || data.orderStatus;

      if (status === 'Complete') {
        this.log('Order Complete!', data);

        // Map results similar to searchAddress
        let props: any[] = [];
        if (data.properties) props = data.properties;
        else if (data.relatedTitles) props = data.relatedTitles;
        else if (data.titleOrders) props = data.titleOrders;

        if (props.length > 0) {
          return props.map((prop: any) => ({
            id: prop.propertyId || Math.random().toString(36).substr(2, 9),
            fullAddress: prop.address?.fullAddress || prop.description || 'Unknown Address',
            street: prop.address?.street || '',
            suburb: prop.address?.suburb || '',
            state: prop.address?.state || '',
            postcode: prop.address?.postcode || '',
            titleReference: prop.titleReference || prop.titleRef || prop.description, // Fallback
            lotPlan: prop.lotPlan || prop.planLabel
          }));
        }
        // Fallback if complete but no props array (maybe single result in root?)
        return [{
          id: data.orderId,
          fullAddress: data.description || 'Verified Property',
          street: '',
          suburb: '',
          state: '',
          postcode: '',
          titleReference: data.titleReference || 'Verified',
          lotPlan: ''
        }];

      } else if (status === 'Error') {
        throw new Error(data.failureReason || data.displayStatus || 'Order Failed');
      }

      return null; // Still pending

    } catch (e) {
      console.error("Polling error", e);
      return null;
    }
  }

  async getAvailableDocuments(propertyId: string): Promise<PropertyDocument[]> {
    await delay(800);
    // In a real scenario, this would call /api/properties/{id}/documents
    // Keeping this mock for now as the user didn't provide that specific endpoint
    return MOCK_DOCUMENTS.map(doc => ({
      ...doc,
      available: true
    }));
  }

  async orderDocuments(items: any[]): Promise<string> {
    if (!USE_MOCK_API) {
      try {
        console.log('[PropertyService] Placing Order via Proxy...');
        // We only handle the first item for now or assume single-property batch
        const item = items[0];

        // Construct payload based on available data
        const payload = {
          titleReference: item.titleReference,
          street: item.street, // api/order will need to parse this or address
          suburb: item.suburb,
          state: item.state,
          postcode: item.postcode,
          clientReference: `TitleFlow-Order-${Date.now()}`
        };

        const response = await fetch(`/api/order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          // If the order returned an orderId directly
          return data.orderId || data.order?.orderId || `ORD-${Math.floor(Math.random() * 1000000)}`;
        } else {
          console.error("[PropertyService] Order Proxy Failed", response.status);
        }
      } catch (e) {
        console.warn("[PropertyService] API Order failed. Using mock order ID.", e);
      }
    }

    await delay(1500);
    return `ORD-${Math.floor(Math.random() * 1000000)}`;
  }

  /**
   * Downloads a document. 
   */
  async downloadDocument(orderId: string, docType: string, address: string): Promise<Blob> {
    // 1. Attempt Real API Download via Proxy
    if (!USE_MOCK_API) {
      const response = await fetch(`/api/download?orderId=${orderId}`, {
        method: 'GET'
      });

      if (response.ok) {
        return await response.blob();
      }

      const errorText = await response.text();
      console.error(`[PropertyService] Download failed: ${response.status}`, errorText);
      throw new Error(`Download failed: ${response.statusText} (${response.status})`);
    }

    // 2. Mock Data Flow (Only if USE_MOCK_API is true)
    await delay(1000);
    const content = this.generateMockDocumentContent(docType, address, orderId);
    return new Blob([content], { type: 'text/plain' });
  }

  private generateMockDocumentContent(type: string, address: string, orderId: string): string {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    const isTitleAlertCase = address.includes('SP724538');
    const isPrestonsCase = this.normalizeAddress(address).includes('prestons') || address.includes('2331/1092549');

    let lotPlan = `Lot 1 in Deposited Plan ${Math.floor(Math.random() * 900000)}`;
    let owner = "JOHN DOE & JANE DOE";
    let unregisteredDealings = "NIL";
    let lga = "SYDNEY";
    let parish = "ALEXANDRIA";

    const isTitleRef = address.match(/\d+\/+[A-Z]+\d+/);
    if (isTitleRef) lotPlan = address;

    if (isPrestonsCase) {
      lotPlan = "Lot 2331 in Deposited Plan 1092549";
      owner = "MICHAEL SMITH & SARAH SMITH";
      lga = "LIVERPOOL";
      parish = "MINTO";
    }

    if (isTitleAlertCase) {
      owner = "ROBERT SMITH";
      unregisteredDealings = "AH123456  CAVEAT  (DATED 14/12/2025)";
    }

    if (type.includes('Title Search')) {
      return `LAND REGISTRY SERVICES - TITLE SEARCH
--------------------------------------------------
Search Date: ${date}
Time: ${time}
Reference: ${orderId}

LAND DESCRIPTION
----------------
${lotPlan}
Property Address: ${address}
LGA: ${lga}
Parish: ${parish}  County: CUMBERLAND

FIRST SCHEDULE
--------------
${owner}
AS JOINT TENANTS

SECOND SCHEDULE (NOTIFICATIONS)
---------------
1. RESERVATIONS AND CONDITIONS IN THE CROWN GRANT(S)
2. MORTGAGE TO COMMONWEALTH BANK OF AUSTRALIA
${isTitleAlertCase ? '3. AM12345  CAVEAT BY INTERESTED PARTY' : ''}

UNREGISTERED DEALINGS: ${unregisteredDealings}

*** END OF SEARCH ***
(Printed via TitleFlow System)`;
    }

    if (type.includes('Plan')) {
      return `[OFFICIAL PLAN IMAGE PLACEHOLDER]
          
DEPOSITED PLAN: ${lotPlan.includes('DP') ? lotPlan.split('Plan ')[1] : '876543'}
---------------------
Plan of Subdivision
Address: ${address}
LGA: ${lga}

[ ASCII DIAGRAM ]
__________________________
|                        |
|        LOT ${isPrestonsCase ? '2331' : '1'}           |
|      ${isPrestonsCase ? '650.0' : '500.0'} m2          |
|                        |
|________________________|
      ROAD WIDENING
      (15m WIDE)

Surveyor: B. BUILDER
Registered: 12/03/1995`;
    }

    return `OFFICIAL DOCUMENT: ${type.toUpperCase()}
Property: ${address}
Order ID: ${orderId}
Date: ${date}

This certifies the details requested for the above property have been searched against the official register.

Status: CLEAR
Encumbrances: NONE LISTED
Caveats: NIL

Certified correct for the purposes of the Real Property Act.
Registrar General.`;
  }
}