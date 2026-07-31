'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useRestaurantStore } from '@/store/restaurantStore';
import { useCartStore } from '@/store/cartStore';
import axios from 'axios';

export default function OrderPage({ params }: { params: Promise<{ restaurantSlug: string }> }) {
  const resolvedParams = use(params);
  const restaurantSlug = resolvedParams.restaurantSlug;
  const { features, info } = useRestaurantStore();
  const { items, getTotalPrice, clearCart, setOrderContext } = useCartStore();
  const router = useRouter();

  const [orderMethod, setOrderMethod] = useState<'DELIVERY' | 'TAKEAWAY'>('DELIVERY');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const currency = info?.currency || '₺';

  useEffect(() => {
    if (!features.hasOnlineOrder) {
      router.replace(`/${restaurantSlug}/menu`);
    } else {
      setOrderContext(orderMethod);
    }
  }, [features.hasOnlineOrder, router, restaurantSlug, setOrderContext, orderMethod]);

  if (!features.hasOnlineOrder) return null;

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-xl font-bold mb-2">Sepetiniz Boş</h1>
        <button 
          onClick={() => router.push(`/${restaurantSlug}/menu`)}
          className="mt-4 px-6 py-2 bg-black text-white rounded-full font-medium"
        >
          Menüye Dön
        </button>
      </div>
    );
  }

  const handleConfirmOrder = async () => {
    if (orderMethod === 'DELIVERY' && (!address || !phone)) {
      alert('Lütfen adres ve telefon bilgilerinizi doldurun.');
      return;
    }
    if (orderMethod === 'TAKEAWAY' && !phone) {
      alert('Lütfen telefon numaranızı girin.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const orderItems = items.map(item => ({
        product_id: parseInt(item.productId),
        quantity: item.quantity,
      }));

      // NOTE: Our backend PublicOrderAPIView currently expects 'table_number'
      // Since it's public and basic, we send table_number="ONLINE" or similar for now.
      // In a real scenario, PublicOrderAPIView should handle 'DELIVERY' and 'TAKEAWAY' properly.
      await axios.post('http://localhost:8000/api/public/order/', {
        restaurant_slug: restaurantSlug,
        table_number: orderMethod === 'DELIVERY' ? 'ADRESE TESLİM' : 'GEL-AL',
        items: orderItems,
        // Backend could be updated to read these later:
        customer_phone: phone,
        delivery_address: address,
      });

      setIsSuccess(true);
      clearCart();
    } catch (error) {
      console.error('Order submission failed:', error);
      alert('Siparişiniz alınamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-green-50">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 text-2xl">✓</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Siparişiniz Alındı!</h1>
        <p className="text-gray-600 mb-8">
          {orderMethod === 'DELIVERY' 
            ? 'Siparişiniz yola çıkmak üzere hazırlanıyor. 🛵' 
            : 'Siparişiniz gel-al için hazırlanıyor. 🛍️'}
        </p>
        <button 
          onClick={() => router.push(`/${params.restaurantSlug}/menu`)}
          className="px-6 py-3 bg-black text-white rounded-xl font-medium w-full max-w-xs"
        >
          Menüye Dön
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      <div className="p-4 bg-white border-b sticky top-0 z-10 flex items-center shadow-sm">
        <button onClick={() => router.back()} className="text-gray-600 font-medium text-xl mr-4 hover:text-black transition-colors">
          ←
        </button>
        <h1 className="text-xl font-bold text-gray-900">Sipariş Özeti</h1>
      </div>

      <div className="p-4 flex-1 space-y-6">
        {/* Order Method Selector */}
        <div className="bg-white p-1 rounded-xl border flex shadow-sm">
          <button
            className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
              orderMethod === 'DELIVERY' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => setOrderMethod('DELIVERY')}
          >
            Adrese Teslim
          </button>
          <button
            className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
              orderMethod === 'TAKEAWAY' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => setOrderMethod('TAKEAWAY')}
          >
            Gel-Al
          </button>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">İletişim & Teslimat</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numarası</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0555 555 55 55"
              className="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
            />
          </div>
          
          {orderMethod === 'DELIVERY' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teslimat Adresi</label>
              <textarea 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Mahalle, Sokak, Bina No..."
                rows={3}
                className="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all resize-none"
              />
            </div>
          )}
        </div>

        {/* Cart Summary */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Sepet İçeriği</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.cartItemId} className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">
                    {item.quantity}x {item.name}
                  </div>
                </div>
                <div className="font-medium">
                  {currency}{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t flex justify-between items-center">
            <span className="font-bold text-gray-900">Toplam Tutar</span>
            <span className="font-bold text-2xl text-gray-900">
              {currency}{getTotalPrice().toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 pb-6 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.1)] z-50">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleConfirmOrder}
            disabled={isSubmitting}
            className="w-full bg-black text-white rounded-2xl py-4 font-bold text-lg shadow-lg disabled:bg-gray-400 active:scale-95 transition-all flex justify-center items-center"
          >
            {isSubmitting ? (
               <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
               'Siparişi Tamamla'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
