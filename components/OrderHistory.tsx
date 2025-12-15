import React, { useState } from 'react';
import { Order } from '../types';
import { PropertyService } from '../services/propertyService';

interface OrderHistoryProps {
  orders: Order[];
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders }) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (orderId: string, docId: string, docType: string, address: string) => {
    // Unique ID for the loading state of specific button
    const btnId = `${orderId}-${docId}`;
    setDownloadingId(btnId);

    try {
      const blob = await PropertyService.getInstance().downloadDocument(orderId, docType, address);
      
      const element = document.createElement("a");
      element.href = URL.createObjectURL(blob);
      element.download = `${docType.replace(/\s+/g, '_')}-${address.split(',')[0].replace(/\s+/g, '_')}.txt`; // Defaulting to txt for the mock response
      document.body.appendChild(element); 
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to download document. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
        <p className="mt-1">Search for a property to place your first order.</p>
      </div>
    );
  }

  // Sort orders by date (newest first)
  const sortedOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
      
      <div className="space-y-6">
        {sortedOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between md:items-center gap-2">
              <div>
                <span className="text-sm text-gray-500">Order Placed</span>
                <div className="font-medium text-gray-900">{new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Order #</span>
                <div className="font-medium text-gray-900">{order.id}</div>
              </div>
              <div>
                 <span className="text-sm text-gray-500">Total</span>
                 <div className="font-medium text-gray-900">${order.total.toFixed(2)}</div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {order.items.map((item, idx) => {
                const isDownloading = downloadingId === `${order.id}-${item.document.id}`;
                
                return (
                  <div key={`${order.id}-${idx}`} className="px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.document.type}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-900 font-medium">{item.address}</p>
                      <p className="text-xs text-gray-500">{item.document.description}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      {item.status === 'ready' ? (
                        <button 
                          onClick={() => handleDownload(order.id, item.document.id, item.document.type, item.address)}
                          disabled={isDownloading}
                          className="flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          {isDownloading ? (
                             <svg className="animate-spin h-4 w-4 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                          ) : (
                             <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                             </svg>
                          )}
                          {isDownloading ? 'Fetching...' : 'Download'}
                        </button>
                      ) : (
                         <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 bg-gray-50 rounded-md border border-gray-100">
                           <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           Processing...
                         </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;