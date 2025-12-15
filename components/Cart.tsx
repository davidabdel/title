import React from 'react';
import { CartItem } from '../types';

interface CartProps {
  items: CartItem[];
  onRemove: (propertyId: string, docId: string) => void;
  onCheckout: () => void;
  isProcessing: boolean;
}

const Cart: React.FC<CartProps> = ({ items, onRemove, onCheckout, isProcessing }) => {
  const total = items.reduce((sum, item) => sum + item.document.price, 0);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg z-40 transform transition-transform duration-300">
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex-1 w-full md:w-auto overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
            <div className="flex gap-4">
                {items.map((item, idx) => (
                    <div key={`${item.propertyId}-${item.document.id}`} className="inline-flex items-center bg-gray-100 rounded-full px-4 py-1 text-sm border border-gray-200">
                        <span className="font-semibold mr-2">{item.document.type}</span>
                        <span className="text-gray-500 mr-2 text-xs">({item.address.split(',')[0]})</span>
                        <button 
                            onClick={() => onRemove(item.propertyId, item.document.id)}
                            className="text-gray-400 hover:text-red-500"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0">
            <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-semibold">Total Estimate</p>
                <p className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</p>
            </div>
            <button
                onClick={onCheckout}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md font-bold text-lg shadow-md disabled:opacity-75 disabled:cursor-wait flex items-center"
            >
                {isProcessing ? (
                   <>
                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Processing...
                   </>
                ) : 'Checkout'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
