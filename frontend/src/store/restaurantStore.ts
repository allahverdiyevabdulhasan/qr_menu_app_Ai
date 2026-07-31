import { create } from 'zustand';
import { Product } from '@/components/menu/ProductCard';
import { Category } from '@/services/restaurantService';

export interface RestaurantFeatures {
  hasTableOrder: boolean;
  requireLoginForTable: boolean;
  hasOnlineOrder: boolean;
  hasReservation: boolean;
}

export interface RestaurantInfo {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  currency: string;
}

interface RestaurantState {
  info: RestaurantInfo | null;
  features: RestaurantFeatures;
  categories: Category[];
  products: Product[];
  isLoading: boolean;
  error: string | null;
  setRestaurantData: (info: RestaurantInfo, features: RestaurantFeatures, categories: Category[], products: Product[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
}

export const useRestaurantStore = create<RestaurantState>((set) => ({
  info: null,
  features: {
    hasTableOrder: false,
    requireLoginForTable: false,
    hasOnlineOrder: false,
    hasReservation: false,
  },
  categories: [],
  products: [],
  isLoading: true,
  error: null,
  setRestaurantData: (info, features, categories, products) => set({ info, features, categories, products, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));
