import axios from 'axios';
import { Product } from '@/components/menu/ProductCard';

export interface Category {
  id: string;
  name: string;
}

export interface RestaurantResponse {
  restaurant: {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
  };
  settings: {
    allow_dine_in_orders: boolean;
    allow_takeaway_orders: boolean;
    enable_reservations: boolean;
    enable_courier: boolean;
    currency: string;
    require_login_for_table?: boolean; // Hypothetical, adapt as needed
  } | null;
  categories: Category[];
  products: Product[];
}

const API_URL = 'http://localhost:8000/api/public';

export const getRestaurantConfig = async (slug: string): Promise<RestaurantResponse> => {
  const response = await axios.get<RestaurantResponse>(`${API_URL}/menu/${slug}/`);
  return response.data;
};
