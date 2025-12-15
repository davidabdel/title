export interface AddressResult {
  id: string;
  fullAddress: string;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  lotPlan?: string;
  titleReference?: string; // The Title Number (Volume/Folio)
}

export enum DocumentType {
  TITLE_SEARCH = 'Title Search',
  PLAN_IMAGE = 'Deposited Plan / Strata Plan',
  DEALING = 'Dealing / Instrument',
  COVENANT = 'Covenant',
  STRATA_REPORT = 'Strata Inspection Report'
}

export interface PropertyDocument {
  id: string;
  type: DocumentType;
  description: string;
  price: number;
  available: boolean;
}

export interface CartItem {
  propertyId: string;
  address: string;
  document: PropertyDocument;
}

export interface OrderItem {
  propertyId: string;
  address: string;
  document: PropertyDocument;
  status: 'processing' | 'ready';
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'processing' | 'completed' | 'failed';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}