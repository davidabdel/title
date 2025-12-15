import React from 'react';
import { TEST_SCENARIOS } from '../constants';

interface HeroProps {
  query: string;
  setQuery: (q: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

const Hero: React.FC<HeroProps> = ({ query, setQuery, onSearch, isLoading }) => {
  return (
    <div className="relative bg-blue-900 text-white py-20 px-4 overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
        </svg>
      </div>

      <div className="relative max-w-4xl mx-auto text-center z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
          Secure Property Documents, <br/>
          <span className="text-blue-400">Simplified.</span>
        </h1>
        <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
          Instant access to Land Titles, Plans, and Dealings across Australia.
          Official data from InfoTrack.
        </p>

        <div className="bg-white p-2 rounded-lg shadow-2xl max-w-2xl mx-auto flex flex-col md:flex-row gap-2">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 md:py-4 border-none rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by address (e.g. 42 Wallaby Way)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            />
          </div>
          <button
            onClick={onSearch}
            disabled={isLoading}
            className="w-full md:w-auto px-8 py-3 md:py-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75 transition-colors"
          >
            {isLoading ? 'Searching...' : 'Search Property'}
          </button>
        </div>
        
        {/* Quick Test Data Section */}
        <div className="mt-8">
          <p className="text-sm text-blue-200 mb-3">Quick Test Scenarios:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {TEST_SCENARIOS.map((scenario) => (
              <button
                key={scenario.label}
                onClick={() => setQuery(scenario.query)}
                className="px-3 py-1 bg-blue-800/50 hover:bg-blue-700/50 border border-blue-500/30 rounded-full text-xs text-blue-100 transition-colors"
                title={scenario.description}
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;