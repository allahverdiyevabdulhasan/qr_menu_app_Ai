import { ReactNode, use } from 'react';
import RestaurantProvider from './RestaurantProvider';

export default function RestaurantLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ restaurantSlug: string }>;
}) {
  const resolvedParams = use(params);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <RestaurantProvider restaurantSlug={resolvedParams.restaurantSlug}>
        {/* Navbar will go here */}
        <main className="w-full max-w-md mx-auto min-h-screen bg-white shadow-xl relative pb-20">
          {children}
        </main>
        {/* Bottom Navigation will go here */}
      </RestaurantProvider>
    </div>
  );
}

