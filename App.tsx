import React, { useState } from 'react';
import Hero from './components/Hero';
import SearchResults from './components/SearchResults';
import DocumentList from './components/DocumentList';
import Cart from './components/Cart';
import Assistant from './components/Assistant';
import OrderHistory from './components/OrderHistory';
import { PropertyService } from './services/propertyService';
import { AddressResult, PropertyDocument, CartItem, Order } from './types';

type ViewState = 'search' | 'orders';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('search');
  
  // Search State
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AddressResult[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<AddressResult | null>(null);
  
  // Document State
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  
  // Cart & Order State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderComplete, setOrderComplete] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string>('');

  const propertyService = PropertyService.getInstance();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    setSelectedProperty(null);
    setOrderComplete(false);
    
    try {
      const results = await propertyService.searchAddress(query);
      setSearchResults(results);
    } catch (error) {
      console.error(error);
      alert('Failed to search properties');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectProperty = async (prop: AddressResult) => {
    setSelectedProperty(prop);
    setSearchResults([]); // Clear search list to focus on details
    setQuery(prop.fullAddress); // Update input
    setIsLoadingDocs(true);

    try {
      const docs = await propertyService.getAvailableDocuments(prop.id);
      setDocuments(docs);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleAddToCart = (item: CartItem) => {
    setCart(prev => [...prev, item]);
  };

  const handleRemoveFromCart = (propertyId: string, docId: string) => {
    setCart(prev => prev.filter(item => !(item.propertyId === propertyId && item.document.id === docId)));
  };

  const handleCheckout = async () => {
    setIsProcessingOrder(true);
    try {
      // 1. Process order with service
      const id = await propertyService.orderDocuments(
        cart.map(c => ({ propertyId: c.propertyId, documentId: c.document.id }))
      );

      // 2. Create the new Order object
      const newOrder: Order = {
        id,
        date: new Date().toISOString(),
        items: cart.map(c => ({ ...c, status: 'processing' })),
        total: cart.reduce((sum, item) => sum + item.document.price, 0),
        status: 'processing'
      };

      // 3. Update state
      setOrders(prev => [newOrder, ...prev]);
      setLastOrderId(id);
      setOrderComplete(true);
      setCart([]);
      setSelectedProperty(null);
      setQuery('');
      setDocuments([]);

      // 4. Switch to Orders view after brief delay or immediately?
      // User flow: Show confirmation, then they can click "Go to Orders" or "New Search".
      // However, we also need to simulate the docs becoming ready.
      
      setTimeout(() => {
        setOrders(currentOrders => 
          currentOrders.map(o => {
            if (o.id === id) {
              return {
                ...o,
                status: 'completed',
                items: o.items.map(i => ({ ...i, status: 'ready' }))
              };
            }
            return o;
          })
        );
      }, 5000); // Documents become "ready" after 5 seconds

    } catch (error) {
      alert("Checkout failed. Please try again.");
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const handleNavigation = (view: ViewState) => {
    setCurrentView(view);
    setOrderComplete(false); // Reset confirmation screen if navigating
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => handleNavigation('search')}>
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="ml-2 text-xl font-bold text-slate-900">TitleFlow</span>
            </div>
            
            <div className="flex items-center space-x-4">
               <button 
                 onClick={() => handleNavigation('search')}
                 className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                   currentView === 'search' 
                     ? 'bg-blue-50 text-blue-700' 
                     : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                 }`}
               >
                 Search
               </button>
               <button 
                 onClick={() => handleNavigation('orders')}
                 className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                   currentView === 'orders' 
                     ? 'bg-blue-50 text-blue-700' 
                     : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                 }`}
               >
                 My Orders
                 {orders.length > 0 && (
                   <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                     {orders.length}
                   </span>
                 )}
               </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pb-24">
        {currentView === 'orders' ? (
          <OrderHistory orders={orders} />
        ) : (
          <>
            {orderComplete ? (
              <div className="max-w-2xl mx-auto mt-16 px-4 text-center animate-fade-in">
                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
                  <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Order Confirmed!</h2>
                <p className="text-gray-600 text-lg mb-8">
                  We are processing your documents. You can track their status in the "My Orders" tab.
                </p>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 inline-block text-left mb-8">
                    <p className="text-sm text-gray-500">Order Reference</p>
                    <p className="text-2xl font-mono font-bold text-gray-800">{lastOrderId}</p>
                </div>
                <div className="flex justify-center gap-4">
                    <button 
                      onClick={() => handleNavigation('orders')}
                      className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                    >
                        View My Orders
                    </button>
                    <button 
                      onClick={() => setOrderComplete(false)}
                      className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        New Search
                    </button>
                </div>
              </div>
            ) : (
              <>
                <Hero 
                  query={query} 
                  setQuery={setQuery} 
                  onSearch={handleSearch} 
                  isLoading={isSearching} 
                />
                
                <SearchResults 
                  results={searchResults} 
                  onSelect={handleSelectProperty} 
                />

                {selectedProperty && (
                  <DocumentList 
                    property={selectedProperty} 
                    documents={documents} 
                    onAddToCart={handleAddToCart}
                    cart={cart}
                    isLoading={isLoadingDocs}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Cart Overlay - Only show on Search view */}
      {currentView === 'search' && !orderComplete && (
        <Cart 
          items={cart} 
          onRemove={handleRemoveFromCart} 
          onCheckout={handleCheckout} 
          isProcessing={isProcessingOrder} 
        />
      )}

      {/* AI Assistant */}
      <Assistant />

      {/* Status Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-xs text-gray-400">
           <span>&copy; 2025 TitleFlow</span>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
             <span>System Status: Demo Mode (Mock Data Active)</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;