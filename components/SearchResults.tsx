import React from 'react';
import { AddressResult } from '../types';

interface SearchResultsProps {
  results: AddressResult[];
  onSelect: (address: AddressResult) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onSelect }) => {
  if (results.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Did you mean?</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {results.map((addr) => (
            <li
              key={addr.id}
              className={`hover:bg-blue-50 cursor-pointer transition-colors duration-150 ${addr.titleReference?.includes('PENDING') ? 'bg-gray-50' : ''}`}
              onClick={() => {
                if (!addr.titleReference?.includes('PENDING')) {
                  onSelect(addr);
                }
              }}
            >
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${addr.titleReference?.includes('PENDING') ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'}`}>
                    {addr.titleReference?.includes('PENDING') ? (
                      <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{addr.fullAddress}</p>
                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                      {addr.titleReference && (
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded border ${addr.titleReference?.includes('PENDING') ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                          {!addr.titleReference?.includes('PENDING') && (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          )}
                          {addr.titleReference?.includes('PENDING') ? 'Checking Title...' : `Title: ${addr.titleReference}`}
                        </span>
                      )}
                      <span>Lot/Plan: {addr.lotPlan || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  {addr.titleReference?.includes('PENDING') ? (
                    <span className="text-gray-400 text-sm italic">Please wait...</span>
                  ) : (
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">Select &rarr;</button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SearchResults;