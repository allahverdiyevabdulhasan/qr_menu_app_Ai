'use client';

import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';

export default function BottomCartBar({ restaurantSlug }: { restaurantSlug: string }) {
  const { getTotalItems, getTotalPrice, orderType } = useCartStore();
  const router = useRouter();
  
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  if (totalItems === 0 || orderType === 'NONE') return null;

  const handleCheckout = () => {
    // If table order, we might go to a different checkout or order summary
    if (orderType === 'TABLE') {
       const tableId = useCartStore.getState().tableId;
       router.push(`/${restaurantSlug}/table/${tableId}/checkout`);
    } else {
       router.push(`/${restaurantSlug}/order`);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 pb-6 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.1)] z-50">
      <div className="max-w-md mx-auto">
        <button 
          onClick={handleCheckout}
          className="w-full bg-black text-white rounded-2xl py-3.5 px-5 flex items-center justify-between font-medium hover:bg-gray-800 transition-colors shadow-lg active:scale-95"
        >
          <div className="flex items-center">
            <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center mr-3">
              <span className="text-sm font-bold">{totalItems}</span>
            </div>
            <span>Sepeti Görüntüle</span>
          </div>
          <span className="text-lg">₺{totalPrice.toFixed(2)}</span>
        </button>
      </div>
    </div>
  );
}
