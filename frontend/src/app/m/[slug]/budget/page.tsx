"use client";
import React, { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, ChevronLeft, Sparkles, Utensils, ShoppingBag } from 'lucide-react';

export default function BudgetPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  
  const [budget, setBudget] = useState('');
  const [personCount, setPersonCount] = useState('1');
  const [dietaryPreferences, setDietaryPreferences] = useState('');
  const [athleteMode, setAthleteMode] = useState(false);
  
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = () => {
    const amount = Number(budget);
    if (!amount || amount < 50) {
      alert("Lütfen en az 50 TL'lik bir bütçe giriniz.");
      return;
    }
    
    setIsSearching(true);
    setResult(null);
    
    setTimeout(() => {
      // Mock result based on budget and preferences
      let items = [];
      let totalPerPerson = 0;
      
      const isAthlete = athleteMode || dietaryPreferences.toLowerCase().includes('protein');
      const isVegetarian = dietaryPreferences.toLowerCase().includes('vejetaryen');
      const count = Number(personCount) || 1;
      
      const budgetPerPerson = amount / count;
      
      if (isAthlete) {
        items = [
          { name: 'Izgara Tavuk Göğsü', price: 210, icon: '🍗' },
          { name: 'Haşlanmış Brokoli', price: 70, icon: '🥦' },
          { name: 'Şekersiz Filtre Kahve', price: 60, icon: '☕' }
        ];
        totalPerPerson = 340;
      } else if (isVegetarian) {
        items = [
          { name: 'Mantar Sote', price: 180, icon: '🍄' },
          { name: 'Mevsim Salata', price: 90, icon: '🥗' },
          { name: 'Limonata', price: 50, icon: '🍋' }
        ];
        totalPerPerson = 320;
      } else if (budgetPerPerson <= 120) {
        // Tight budget (e.g. 50-120 TL)
        items = [
          { name: 'Mercimek Çorbası', price: 60, icon: '🥣' },
          { name: 'Yarım Ekmek Tavuk Döner', price: 50, icon: '🥪' }
        ];
        totalPerPerson = 110;
      } else if (budgetPerPerson <= 220) {
        // Medium budget (e.g. 500 TL for 3 people, or 1000 TL for 5 people = 200 TL per person)
        // A very filling menu
        items = [
          { name: 'Doyurucu Burger Menü', price: 160, icon: '🍔' },
          { name: 'Çıtır Soğan Halkası', price: 30, icon: '🧅' },
          { name: 'Kutu İçecek', price: 30, icon: '🥤' }
        ];
        totalPerPerson = 220;
        
        // If budget is strictly 200, adjust the menu slightly
        if (budgetPerPerson < 220) {
            items = [
              { name: 'Karışık Pide', price: 160, icon: '🍕' },
              { name: 'Büyük Boy Ayran', price: 35, icon: '🥛' }
            ];
            totalPerPerson = 195;
        }
      } else {
        // Rich budget
        items = [
          { name: 'Karışık Izgara Tabağı', price: 380, icon: '🥩' },
          { name: 'Gavurdağı Salatası', price: 110, icon: '🥗' },
          { name: 'Fırın Sütlaç', price: 90, icon: '🍮' }
        ];
        totalPerPerson = 580;
      }
      
      // Calculate totals based on person count
      let finalItems = [];
      if (count > 1) {
         finalItems = items.map(item => ({ ...item, price: item.price * count, name: `${count} Adet ${item.name}` }));
      } else {
         finalItems = items;
      }
      const finalTotal = totalPerPerson * count;
      
      setResult({ items: finalItems, total: finalTotal });
      setIsSearching(false);
    }, 1500);
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <button onClick={() => router.push(`/m/${resolvedParams.slug}`)} className="p-2 bg-gray-100 rounded-full active:scale-95 transition-transform">
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-black flex items-center gap-2 text-gray-900">
          <Wallet className="text-[#645aff]" fill="currentColor" size={20} /> Bütçene Göre Menü
        </h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {!result && (
          <div className="bg-white p-7 rounded-[2rem] shadow-[0_4px_24px_rgb(0,0,0,0.03)] border border-gray-100/50 space-y-7 mb-6 mt-4 mx-2">
            
            {/* Bütçe */}
            <div>
              <label className="text-[12px] font-bold text-[#5c6275] uppercase tracking-wide mb-2.5 flex items-center gap-2">
                💰 TOPLAM BÜTÇE (TL)
              </label>
              <input 
                type="number" 
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="örn. 50" 
                className="w-full bg-[#f6f7fa] border-none rounded-[1rem] p-4 text-[15px] font-semibold text-[#1e2029] focus:ring-2 focus:ring-purple-500/20 placeholder:text-gray-400 transition-all outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
              />
            </div>

            {/* Kişi Sayısı */}
            <div>
              <label className="text-[12px] font-bold text-[#5c6275] uppercase tracking-wide mb-2.5 flex items-center gap-2">
                👥 KİŞİ SAYISI
              </label>
              <input 
                type="number" 
                value={personCount}
                onChange={e => setPersonCount(e.target.value)}
                className="w-full bg-[#f6f7fa] border-none rounded-[1rem] p-4 text-[15px] font-semibold text-[#1e2029] focus:ring-2 focus:ring-purple-500/20 transition-all outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
              />
            </div>

            {/* Beslenme Tercihleri */}
            <div>
              <label className="text-[12px] font-bold text-[#5c6275] uppercase tracking-wide mb-2.5 flex items-center gap-2">
                🍽️ BESLENME TERCİHLERİ
              </label>
              <textarea 
                value={dietaryPreferences}
                onChange={e => setDietaryPreferences(e.target.value)}
                placeholder="örn. Yüksek protein, glutensiz, vejetaryen..." 
                rows={2}
                className="w-full bg-[#f6f7fa] border-none rounded-[1rem] p-4 text-[15px] font-semibold text-[#1e2029] focus:ring-2 focus:ring-purple-500/20 placeholder:text-gray-400 transition-all outline-none resize-none" 
              />
            </div>

            {/* Sporcu Modu Toggle */}
            <div 
              className={`flex items-center justify-between p-4 rounded-[1rem] border transition-colors cursor-pointer ${athleteMode ? 'bg-[#f0fcf0] border-[#c4ebc2]' : 'bg-[#f6f7fa] border-transparent'}`} 
              onClick={() => setAthleteMode(!athleteMode)}
            >
              <div className="flex items-start gap-3 flex-1">
                <span className="text-[18px] leading-none mt-0.5">💪</span>
                <div className="flex flex-col">
                  <span className={`font-bold text-[14px] ${athleteMode ? 'text-[#1d5c14]' : 'text-gray-700'}`}>Sporcu modu</span>
                  <span className={`text-[12px] font-medium mt-0.5 ${athleteMode ? 'text-[#368b2a]' : 'text-gray-500'}`}>Yüksek proteinli seçeneklere öncelik ver</span>
                </div>
              </div>
              
              {/* Toggle Switch */}
              <div className={`w-11 h-6 rounded-full flex items-center p-0.5 transition-colors shrink-0 ml-3 ${athleteMode ? 'bg-[#3eb532]' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${athleteMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
            </div>

            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className={`w-full py-4 rounded-[1rem] font-bold flex items-center justify-center gap-2 transition-all mt-8 ${isSearching ? 'bg-[#15161c] text-white/80 scale-[0.98]' : 'bg-[#15161c] text-white active:scale-[0.98] shadow-lg shadow-gray-900/10'}`}
            >
              {isSearching ? (
                <div className="flex items-center gap-2 h-6 text-[15px]">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Oluşturuluyor...
                </div>
              ) : (
                <div className="flex items-center gap-2 h-6 text-[15px]">
                  ✨ Mükemmel Menüyü Oluştur
                </div>
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="animate-in slide-in-from-bottom-8 fade-in duration-500 flex flex-col flex-1">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border border-indigo-100 shadow-sm mb-6 flex-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-[#645aff] text-sm uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={16} /> Önerilen Menü
                </h3>
                <div className="bg-white px-3 py-1 rounded-full text-xs font-bold text-[#645aff] shadow-sm">
                  Kalan: {Number(budget) - result.total} ₺
                </div>
              </div>
              
              <div className="space-y-3">
                {result.items.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50/50 rounded-xl flex items-center justify-center text-xl shadow-inner">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-gray-900 text-sm mb-0.5">{item.name}</div>
                    </div>
                    <div className="font-black text-[#645aff]">{item.price} ₺</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-auto">
              <button 
                onClick={() => {
                  const storedCart = localStorage.getItem(`cart_${resolvedParams.slug}`);
                  let cart = storedCart ? JSON.parse(storedCart) : [];
                  
                  // Add items to cart with fake IDs for mocked products
                  const newItems = result.items.map((item: any, i: number) => ({
                    product: {
                      id: 9000 + i, // Fake ID
                      name: item.name + ' (AI Önerisi)',
                      price: item.price.toString(),
                      category: 1,
                      display_image: null,
                      description: 'Yapay Zeka Bütçe Önerisi'
                    },
                    quantity: 1,
                    note: 'Bütçe Menüsü'
                  }));
                  
                  cart = [...cart, ...newItems];
                  localStorage.setItem(`cart_${resolvedParams.slug}`, JSON.stringify(cart));
                  
                  // Go back to main menu
                  router.push(`/m/${resolvedParams.slug}`);
                }}
                className="w-full py-4 bg-[#1e2029] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-gray-900/20 active:scale-95 transition-transform text-[15px]"
              >
                <ShoppingBag size={20} /> Hepsini Sepete Ekle - {result.total} ₺
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
