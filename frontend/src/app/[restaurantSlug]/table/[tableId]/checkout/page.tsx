'use client';

import { useCartStore } from '@/store/cartStore';
import { useRestaurantStore } from '@/store/restaurantStore';
import { useRouter } from 'next/navigation';
import { useState, use } from 'react';
import axios from 'axios';

export default function TableCheckoutPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string; tableId: string }>;
}) {
  const resolvedParams = use(params);
  const { restaurantSlug, tableId } = resolvedParams;
  
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { features, info } = useRestaurantStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const currency = info?.currency || '₺';

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-xl font-bold mb-2">Sepetiniz Boş</h1>
        <button 
          onClick={() => router.push(`/${restaurantSlug}/table/${tableId}`)}
          className="mt-4 px-6 py-2 bg-black text-white rounded-full font-medium"
        >
          Menüye Dön
        </button>
      </div>
    );
  }

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    
    try {
      // Map cart items to backend format
      const orderItems = items.map(item => ({
        product_id: parseInt(item.productId),
        quantity: item.quantity,
      }));

      await axios.post('http://localhost:8000/api/public/order/', {
        restaurant_slug: restaurantSlug,
        table_number: tableId,
        items: orderItems,
      });

      setIsSuccess(true);
      clearCart();
    } catch (error) {
      console.error('Order submission failed:', error);
      alert('Sipariş gönderilirken bir hata oluştu. Lütfen garsona danışın.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-green-50">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 text-2xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Siparişiniz Alındı!</h1>
        <p className="text-gray-600 mb-8">
          Masa {tableId} için siparişiniz mutfağa iletildi. Hazırlanıyor... 🧑‍🍳
        </p>
        <button 
          onClick={() => router.push(`/${restaurantSlug}/table/${tableId}`)}
          className="px-6 py-3 bg-black text-white rounded-xl font-medium w-full max-w-xs"
        >
          Menüye Dön
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-4 bg-white border-b sticky top-0 z-10 flex items-center">
        <button onClick={() => router.back()} className="text-gray-600 font-medium text-xl mr-4">
          ←
        </button>
        <h1 className="text-xl font-bold text-gray-900">Sipariş Özeti</h1>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-sm border p-4 mb-4">
          <div className="flex justify-between items-center mb-4 pb-4 border-b">
            <span className="text-gray-500">Masa Numarası</span>
            <span className="font-bold text-lg">{tableId}</span>
          </div>

          <h2 className="font-semibold text-gray-900 mb-3">Siparişleriniz</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.cartItemId} className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">
                    {item.quantity}x {item.name}
                  </div>
                  {item.options.length > 0 && (
                    <div className="text-sm text-gray-500 mt-0.5">
                      {item.options.map((opt) => opt.name).join(', ')}
                    </div>
                  )}
                </div>
                <div className="font-medium">
                  {currency}{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t flex justify-between items-center">
            <span className="font-bold text-gray-900">Toplam Tutar</span>
            <span className="font-bold text-xl text-gray-900">
              {currency}{getTotalPrice().toFixed(2)}
            </span>
          </div>
        </div>

        {features.requireLoginForTable && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 text-sm text-yellow-800">
            <strong>Bilgi:</strong> Bu restoran masadan siparişler için giriş yapmanızı zorunlu kılıyor. (SMS Doğrulama modülü buraya eklenecek).
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t">
        <button
          onClick={handleConfirmOrder}
          disabled={isSubmitting}
          className="w-full bg-black text-white rounded-xl py-4 font-bold text-lg shadow-lg disabled:bg-gray-400 disabled:scale-100 active:scale-95 transition-all flex justify-center items-center"
        >
          {isSubmitting ? (
             <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
             'Siparişi Onayla'
          )}
        </button>
      </div>
    </div>
  );
}
