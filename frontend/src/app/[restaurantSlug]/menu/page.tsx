'use client';

import MenuView from '@/components/menu/MenuView';
import { use } from 'react';

export default function MenuPage({ params }: { params: Promise<{ restaurantSlug: string }> }) {
  const resolvedParams = use(params);
  return <MenuView restaurantSlug={resolvedParams.restaurantSlug} />;
}
