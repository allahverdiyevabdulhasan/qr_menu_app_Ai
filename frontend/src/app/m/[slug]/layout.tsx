'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ScrollText, CircleUserRound, ShoppingBag, Sparkles, Store } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/components/LanguageProvider';

export default function MobileAppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const pathname = usePathname();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { t } = useTranslation();
  
  React.useEffect(() => {
    checkAuth();
    
    // TEST İÇİN GEÇİCİ KOD: Geliştirme aşamasında otomatik Masa 1'e oturt
    if (process.env.NODE_ENV === 'development') {
      const storedTable = localStorage.getItem(`table_${resolvedParams.slug}`);
      if (!storedTable) {
        localStorage.setItem(`table_${resolvedParams.slug}`, '1');
      }
    }
  }, [checkAuth, resolvedParams.slug]);
  
  // Redux'tan sepet bilgisini al
  const { cart } = useSelector((state: any) => state.cart || { cart: [] });
  const cartCount = cart?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  // Eğer sayfa checkout veya login ise bottom nav gizlenebilir
  const hideBottomNav = pathname.includes('/checkout') || pathname.includes('/login') || pathname.includes('/register');

  return (
    <div className="bg-zinc-100 h-[100dvh] w-full flex justify-center overflow-hidden font-sans">
      {/* Telefon Ekranı Simülasyonu */}
      <div className="w-full max-w-[400px] bg-white h-[100dvh] max-h-[100dvh] relative shadow-2xl flex flex-col overflow-hidden transform-gpu">
        
        {/* Ana İçerik Alanı (Scrollable) */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative z-[70]" style={{ WebkitOverflowScrolling: 'touch' }}>
          {children}
        </main>

        {/* Sabit Alt Menü (Bottom Navigation Bar) */}
        {!hideBottomNav && (
          <div className="shrink-0 bg-white/95 backdrop-blur-xl border-t border-zinc-100 pb-safe z-[80] shadow-[0_-4px_25px_-10px_rgba(0,0,0,0.08)] relative">
            <div className="flex justify-around items-center h-[72px] px-2 relative">
              
              {/* Home Tab */}
              <Link href={`/m/${resolvedParams.slug}`} className="flex flex-col items-center justify-center w-full h-full group active:scale-95 transition-all duration-300">
                 <div className={`flex flex-col items-center justify-center w-16 py-1.5 rounded-2xl transition-all duration-500 ease-out ${pathname === `/m/${resolvedParams.slug}` ? 'bg-orange-50 translate-y-[-4px] shadow-sm' : 'bg-transparent'}`}>
                   <Store size={22} className={`mb-1 transition-all duration-500 ${pathname === `/m/${resolvedParams.slug}` ? 'text-orange-600 stroke-[2.5px]' : 'text-zinc-400 stroke-[2px] group-hover:text-zinc-500 group-hover:-translate-y-0.5'}`} />
                   <span className={`text-[10px] font-bold transition-all duration-500 tracking-tight ${pathname === `/m/${resolvedParams.slug}` ? 'text-orange-600' : 'text-zinc-400 group-hover:text-zinc-500'}`}>{t('nav_menu', { defaultValue: 'Menü' })}</span>
                 </div>
              </Link>

              {/* Orders Tab */}
              <Link href={`/m/${resolvedParams.slug}/orders`} className="flex flex-col items-center justify-center w-full h-full group active:scale-95 transition-all duration-300">
                 <div className={`flex flex-col items-center justify-center w-16 py-1.5 rounded-2xl transition-all duration-500 ease-out ${pathname.includes('/orders') ? 'bg-emerald-50 translate-y-[-4px] shadow-sm' : 'bg-transparent'}`}>
                   <ScrollText size={22} className={`mb-1 transition-all duration-500 ${pathname.includes('/orders') ? 'text-emerald-600 stroke-[2.5px]' : 'text-zinc-400 stroke-[2px] group-hover:text-zinc-500 group-hover:-translate-y-0.5'}`} />
                   <span className={`text-[10px] font-bold transition-all duration-500 tracking-tight ${pathname.includes('/orders') ? 'text-emerald-600' : 'text-zinc-400 group-hover:text-zinc-500'}`}>{t('nav_orders', { defaultValue: 'Siparişler' })}</span>
                 </div>
              </Link>

              {/* AI Tab */}
              <Link href={`/m/${resolvedParams.slug}/ai`} className="flex flex-col items-center justify-center w-full h-full group active:scale-95 transition-all duration-300 relative">
                 <div className={`flex flex-col items-center justify-center w-16 py-1.5 rounded-2xl transition-all duration-500 ease-out ${pathname.includes('/ai') ? 'bg-indigo-50 translate-y-[-4px] shadow-sm' : 'bg-transparent'}`}>
                   <div className="absolute top-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm shadow-indigo-200 z-10">YENİ</div>
                   <Sparkles size={22} className={`mb-1 transition-all duration-500 mt-1 ${pathname.includes('/ai') ? 'text-indigo-600 stroke-[2.5px]' : 'text-zinc-400 stroke-[2px] group-hover:text-zinc-500 group-hover:-translate-y-0.5'}`} />
                   <span className={`text-[10px] font-bold transition-all duration-500 tracking-tight ${pathname.includes('/ai') ? 'text-indigo-600' : 'text-zinc-400 group-hover:text-zinc-500'}`}>{t('nav_ai', { defaultValue: 'AI Asistan' })}</span>
                 </div>
              </Link>

              {/* Profile Tab */}
              <Link href={`/m/${resolvedParams.slug}/profile`} className="flex flex-col items-center justify-center w-full h-full group active:scale-95 transition-all duration-300">
                 <div className={`flex flex-col items-center justify-center w-16 py-1.5 rounded-2xl transition-all duration-500 ease-out ${pathname.includes('/profile') ? 'bg-blue-50 translate-y-[-4px] shadow-sm' : 'bg-transparent'}`}>
                   <CircleUserRound size={22} className={`mb-1 transition-all duration-500 ${pathname.includes('/profile') ? 'text-blue-600 stroke-[2.5px]' : 'text-zinc-400 stroke-[2px] group-hover:text-zinc-500 group-hover:-translate-y-0.5'}`} />
                   <span className={`text-[10px] font-bold transition-all duration-500 tracking-tight ${pathname.includes('/profile') ? 'text-blue-600' : 'text-zinc-400 group-hover:text-zinc-500'}`}>{t('nav_profile', { defaultValue: 'Profil' })}</span>
                 </div>
              </Link>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
