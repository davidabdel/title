import { DocumentType } from './types';

// We default to false to try the real API first, but the service handles fallback if it fails.
export const USE_MOCK_API = false; 

// The API Key provided by the user.
export const INFOTRACK_API_KEY = "XcDVk/K/ZugnYoiLsI3wIiQ+zS9lIB0LCbJgsRhrCEolRNs7bPvThTb5/611opvnIG6Eyorh1BjSaWQszFFek9RzCVJcMfOvSXAZ3TVgojQ=";
export const INFOTRACK_API_URL = "https://stagesearch.infotrack.com.au/services/customer-propertyenquiry/v1";

// Gemini API Key is injected via process.env.API_KEY as per system instructions
export const GEMINI_MODEL = 'gemini-2.5-flash';

// Pre-defined test scenarios for the UI
export const TEST_SCENARIOS = [
  { label: 'NSW Address', query: '1 Test Street, Sydney NSW 2000', description: 'Standard NSW Search' },
  { label: 'VIC Title', query: '1/PS123456', description: 'Search by Title Reference' },
  { label: 'QLD Address', query: '2 Test Street, Brisbane QLD 4000', description: 'Standard QLD Search' },
  { label: 'Title Alert Test', query: '2/SP724538', description: 'Specific Test for Title Alerts Workflow' },
  { label: 'Prestons Test', query: '90 Dalmeny Drive, Prestons NSW 2170', description: 'User Specific Test Case' }
];

export const MOCK_ADDRESSES = [
  // Existing Data
  {
    id: 'prop_001',
    fullAddress: '42 Wallaby Way, Sydney NSW 2000',
    street: '42 Wallaby Way',
    suburb: 'Sydney',
    state: 'NSW',
    postcode: '2000',
    lotPlan: '12//DP876543',
    titleReference: '12/DP876543'
  },
  {
    id: 'prop_002',
    fullAddress: '10 Downing Street, Melbourne VIC 3000',
    street: '10 Downing Street',
    suburb: 'Melbourne',
    state: 'VIC',
    postcode: '3000',
    lotPlan: '1//PS123456',
    titleReference: '1/PS123456'
  },
  
  // InfoTrack Test Data Patterns
  {
    id: 'test_nsw_01',
    fullAddress: '1 Test Street, Sydney NSW 2000',
    street: '1 Test Street',
    suburb: 'Sydney',
    state: 'NSW',
    postcode: '2000',
    lotPlan: '1//DP111111',
    titleReference: '1/DP111111'
  },
  {
    id: 'test_vic_01',
    fullAddress: '100 Test Road, Melbourne VIC 3000', // Result for 1/PS123456
    street: '100 Test Road',
    suburb: 'Melbourne',
    state: 'VIC',
    postcode: '3000',
    lotPlan: '1//PS123456',
    titleReference: '1/PS123456'
  },
  {
    id: 'test_qld_01',
    fullAddress: '2 Test Street, Brisbane QLD 4000',
    street: '2 Test Street',
    suburb: 'Brisbane',
    state: 'QLD',
    postcode: '4000',
    lotPlan: '2//SP222222',
    titleReference: '2/SP222222'
  },
  {
    id: 'test_alert_01',
    fullAddress: 'Lot 2 in Strata Plan 724538',
    street: '2/SP724538',
    suburb: 'Bondi',
    state: 'NSW',
    postcode: '2026',
    lotPlan: '2//SP724538',
    titleReference: '2/SP724538'
  },
  // User specific test case
  {
    id: 'prop_test_001',
    fullAddress: 'Unit 6, 32 Clifford St, Torrensville 5031',
    street: 'Unit 6, 32 Clifford St',
    suburb: 'Torrensville',
    state: 'SA',
    postcode: '5031',
    lotPlan: '6//SP12345',
    titleReference: 'CT 6000/100'
  },
  // New User Case
  {
    id: 'prop_prestons_01',
    fullAddress: '90 Dalmeny Drive, Prestons NSW 2170',
    street: '90 Dalmeny Drive',
    suburb: 'Prestons',
    state: 'NSW',
    postcode: '2170',
    lotPlan: '2331//DP1092549',
    titleReference: '2331/1092549'
  }
];

export const MOCK_DOCUMENTS = [
  {
    id: 'doc_title',
    type: DocumentType.TITLE_SEARCH,
    description: 'Current ownership details and encumbrances.',
    price: 18.50,
    available: true
  },
  {
    id: 'doc_plan',
    type: DocumentType.PLAN_IMAGE,
    description: 'Visual diagram of the lot dimensions and location.',
    price: 12.95,
    available: true
  },
  {
    id: 'doc_covenant',
    type: DocumentType.COVENANT,
    description: 'Details of restrictions on the use of the land.',
    price: 25.00,
    available: true
  },
  {
    id: 'doc_dealing',
    type: DocumentType.DEALING,
    description: 'Copy of specific dealing or instrument.',
    price: 15.40,
    available: true
  }
];