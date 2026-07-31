'use client';

import { useEffect } from 'react';
import { useRestaurantStore } from '@/store/restaurantStore';
import { getRestaurantConfig } from '@/services/restaurantService';

export default function RestaurantProvider({
  children,
  restaurantSlug,
}: {
  children: React.ReactNode;
  restaurantSlug: string;
}) {
  const { setRestaurantData, setLoading, setError, isLoading, error } = useRestaurantStore();

  useEffect(() => {
    let isMounted = true;

    const fetchConfig = async () => {
      setLoading(true);
      try {
        const data = await getRestaurantConfig(restaurantSlug);
        
        if (isMounted) {
          const info = {
            id: data.restaurant.id.toString(),
            slug: data.restaurant.slug,
            name: data.restaurant.name,
            logoUrl: data.restaurant.logo || undefined,
            currency: data.settings?.currency || '₺',
          };
          
          const features = {
            hasTableOrder: data.settings?.allow_dine_in_orders ?? false,
            requireLoginForTable: false, // Could be mapped if backend supports it
            hasOnlineOrder: (data.settings?.allow_takeaway_orders || data.settings?.enable_courier) ?? false,
            hasReservation: data.settings?.enable_reservations ?? false,
          };
          
          const mappedCategories = data.categories.map((c: any) => ({
            id: c.id.toString(),
            name: c.name,
          }));

          const mappedProducts = data.products.map((p: any) => ({
            id: p.id.toString(),
            name: p.name,
            description: p.description || '',
            price: parseFloat(p.price),
            imageUrl: p.image || undefined,
            categoryId: p.category ? p.category.toString() : '',
          }));
          
          setRestaurantData(info, features, mappedCategories, mappedProducts);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Restoran bilgileri alınamadı.');
        }
      }
    };

    fetchConfig();

    return () => {
      isMounted = false;
    };
  }, [restaurantSlug, setRestaurantData, setLoading, setError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Hata</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return <>{children}</>;
}
