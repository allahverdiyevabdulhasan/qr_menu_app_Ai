'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useRestaurantStore } from '@/store/restaurantStore';

export default function ReservationPage({ params }: { params: Promise<{ restaurantSlug: string }> }) {
  const resolvedParams = use(params);
  const restaurantSlug = resolvedParams.restaurantSlug;
  const { features, info } = useRestaurantStore();
  const router = useRouter();

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('2');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!features.hasReservation) {
      router.replace(`/${restaurantSlug}/menu`);
    }
  }, [features.hasReservation, router, restaurantSlug]);

  if (!features.hasReservation) return null;

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !name || !phone) {
      alert('Lütfen zorunlu alanları doldurun.');
      return;
    }

    setIsSubmitting(true);
    // Mock API Call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-green-50">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 text-2xl">✓</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Rezervasyon İsteği Alındı!</h1>
        <p className="text-gray-600 mb-8">
          {date} tarihi, saat {time} için talebiniz restoranımıza iletildi. Sizinle iletişime geçeceğiz.
        </p>
        <button 
          onClick={() => router.push(`/${restaurantSlug}/menu`)}
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
        <h1 className="text-xl font-bold text-gray-900">Masa Rezervasyonu</h1>
      </div>

      <div className="p-4 flex-1">
        <form onSubmit={handleConfirmReservation} className="space-y-6">
          
          <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Zaman ve Kişi Sayısı</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tarih *</label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-black outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Saat *</label>
                <input 
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-black outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kişi Sayısı</label>
              <select 
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-black outline-none"
              >
                {[1,2,3,4,5,6,7,8,9,10, '10+'].map(num => (
                  <option key={num} value={num}>{num} Kişi</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">İletişim Bilgileri</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                className="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-black outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0555 555 55 55"
                className="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-black outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Özel İstek / Not</label>
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Bebek sandalyesi vb..."
                rows={2}
                className="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-black outline-none resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white rounded-2xl py-4 font-bold text-lg shadow-lg disabled:bg-gray-400 active:scale-95 transition-all flex justify-center items-center"
          >
            {isSubmitting ? (
               <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
               'Rezervasyon İste'
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
