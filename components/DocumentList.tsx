import React, { useState } from 'react';
import { PropertyDocument, CartItem, AddressResult } from '../types';
import { geminiService } from '../services/geminiService';

interface DocumentListProps {
  property: AddressResult;
  documents: PropertyDocument[];
  onAddToCart: (item: CartItem) => void;
  cart: CartItem[];
  isLoading: boolean;
}

const DocumentList: React.FC<DocumentListProps> = ({ property, documents, onAddToCart, cart, isLoading }) => {
  const [activeExplanation, setActiveExplanation] = useState<string | null>(null);
  const [explainingId, setExplainingId] = useState<string | null>(null);

  const handleExplain = async (docId: string, docType: string) => {
    if (activeExplanation === docId) {
      setActiveExplanation(null);
      return;
    }
    setExplainingId(docId);
    // Use the document type description to get a specific AI explanation
    const text = await geminiService.getExplanation(docType);
    setActiveExplanation(docId + '|' + text);
    setExplainingId(null);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Available Documents</h2>
            <p className="text-gray-500 mt-1">{property.fullAddress}</p>
          </div>
          {property.titleReference && (
            <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg flex flex-col items-end">
              <span className="text-xs text-blue-500 font-semibold uppercase tracking-wider">Title Reference</span>
              <span className="text-xl font-mono font-bold text-blue-900">{property.titleReference}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documents.map((doc) => {
          const inCart = cart.some(c => c.document.id === doc.id && c.propertyId === property.id);
          const explanation = activeExplanation?.startsWith(doc.id) ? activeExplanation.split('|')[1] : null;

          return (
            <div key={doc.id} className={`bg-white rounded-xl shadow-sm border p-6 transition-all ${inCart ? 'border-green-400 ring-1 ring-green-400 bg-green-50' : 'border-gray-200 hover:shadow-md'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  {doc.type}
                </div>
                <div className="text-lg font-bold text-gray-900">${doc.price.toFixed(2)}</div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-2">{doc.type}</h3>
              <p className="text-gray-600 text-sm mb-4">{doc.description}</p>

              {/* AI Explanation Area */}
              {explanation && (
                <div className="mb-4 bg-purple-50 p-3 rounded-lg border border-purple-100 text-sm text-purple-800 animate-fade-in">
                  <p className="font-semibold text-xs text-purple-600 mb-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                    AI Explanation
                  </p>
                  {explanation}
                </div>
              )}

              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => onAddToCart({
                    propertyId: property.id,
                    address: property.fullAddress,
                    document: doc,
                    titleReference: property.titleReference,
                    street: property.street,
                    suburb: property.suburb,
                    state: property.state,
                    postcode: property.postcode
                  })}
                  disabled={inCart || !doc.available}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${inCart
                      ? 'bg-green-600 text-white cursor-default'
                      : !doc.available
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    }`}
                >
                  {inCart ? 'Added to Order' : doc.available ? 'Add to Order' : 'Unavailable'}
                </button>
                <button
                  onClick={() => handleExplain(doc.id, doc.type)}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-md border border-purple-200"
                  title="Explain this document"
                >
                  {explainingId === doc.id ? (
                    <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentList;