"use client";
import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ChevronLeft, ShoppingBag } from 'lucide-react';

export default function AIMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    // Simulate AI Generation time
    const timer = setTimeout(() => {
      setIsGenerating(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <button onClick={() => router.push(`/m/${resolvedParams.slug}`)} className="p-2 bg-gray-100 rounded-full active:scale-95 transition-transform">
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-black flex items-center gap-2 text-gray-900">
          <Sparkles className="text-[#fa7c05]" fill="currentColor" size={20} /> AI Özel Menü
        </h1>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {isGenerating ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
              <Sparkles className="text-[#fa7c05] w-12 h-12 animate-pulse" fill="currentColor" />
              {/* Spinner ring */}
              <div className="absolute inset-0 border-4 border-orange-200 border-t-[#fa7c05] rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Sizin İçin Menü Hazırlanıyor</h2>
            <p className="text-gray-500 font-medium text-sm">Geçmiş tercihlerinizi ve popüler lezzetleri analiz ediyoruz...</p>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col flex-1">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-6 border border-orange-100 mb-6 shadow-sm">
              <p className="text-orange-900 text-[13px] leading-relaxed mb-6 font-medium">
                <strong className="font-black text-[#fa7c05]">NeyMenu Yapay Zekası</strong>, geçmiş siparişleriniz ve popüler tercihlere göre sadece size özel mükemmel bir üçlü hazırladı!
              </p>
              
              <div className="space-y-3">
                <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 border border-orange-50">
                  <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-2xl shadow-sm">🍲</div>
                  <div className="flex-1">
                    <div className="font-black text-gray-900 text-sm mb-0.5">Günün Çorbası</div>
                    <div className="text-xs font-semibold text-gray-400">Başlangıç</div>
                  </div>
                  <div className="font-black text-[#fa7c05]">80₺</div>
                </div>
                
                <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 border border-orange-50">
                  <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-2xl shadow-sm">🥩</div>
                  <div className="flex-1">
                    <div className="font-black text-gray-900 text-sm mb-0.5">Izgara Antrikot</div>
                    <div className="text-xs font-semibold text-gray-400">Ana Yemek</div>
                  </div>
                  <div className="font-black text-[#fa7c05]">420₺</div>
                </div>
                
                <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 border border-orange-50">
                  <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-2xl shadow-sm">🍮</div>
                  <div className="flex-1">
                    <div className="font-black text-gray-900 text-sm mb-0.5">Fırın Sütlaç</div>
                    <div className="text-xs font-semibold text-gray-400">Tatlı</div>
                  </div>
                  <div className="font-black text-[#fa7c05]">110₺</div>
                </div>
              </div>
            </div>
            
            <div className="mt-auto">
              <button 
                onClick={() => {
                  const storedCart = localStorage.getItem(`cart_${resolvedParams.slug}`);
                  let cart = storedCart ? JSON.parse(storedCart) : [];
                  
                  // Mocked items from the AI Menu
                  const aiItems = [
                    { name: 'Günün Çorbası', price: '80', icon: '🍲' },
                    { name: 'Izgara Antrikot', price: '420', icon: '🥩' },
                    { name: 'Fırın Sütlaç', price: '110', icon: '🍮' }
                  ];

                  const newItems = aiItems.map((item, i) => ({
                    product: {
                      id: 8000 + i, // Fake ID
                      name: item.name + ' (Özel Menü)',
                      price: item.price,
                      category: 1,
                      display_image: null,
                      description: 'Yapay Zeka Özel Menüsü'
                    },
                    quantity: 1,
                    note: 'Özel AI Kombinasyonu'
                  }));
                  
                  cart = [...cart, ...newItems];
                  localStorage.setItem(`cart_${resolvedParams.slug}`, JSON.stringify(cart));
                  
                  // Go back to main menu
                  router.push(`/m/${resolvedParams.slug}`);
                }}
                className="w-full py-4 bg-[#fa7c05] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#fa7c05]/30 active:scale-95 transition-transform text-[15px]"
              >
                <ShoppingBag size={20} /> Bu Menüyü Sepete Ekle - 610₺
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
