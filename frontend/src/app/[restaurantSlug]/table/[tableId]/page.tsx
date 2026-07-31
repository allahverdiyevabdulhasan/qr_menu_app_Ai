'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function TableOrderPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string; tableId: string }>;
}) {
  const { restaurantSlug, tableId } = use(params);
  const router = useRouter();

  useEffect(() => {
    // Masayı hafızaya al
    localStorage.setItem(`table_${restaurantSlug}`, tableId);
    
    // Müşteriyi doğrudan yeni premium menüye yönlendir
    router.replace(`/m/${restaurantSlug}`);
  }, [restaurantSlug, tableId, router]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-500 font-medium text-sm">Menüye yönlendiriliyorsunuz...</p>
      </div>
    </div>
  );
}
