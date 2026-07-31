import { create } from 'zustand';
import Cookies from 'js-cookie';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  restaurant_slug?: string;
  role?: string;
  is_superuser?: boolean;
  is_super_admin?: boolean;
  restaurant_currency?: string;
  restaurant_settings?: {
    enable_kds: boolean;
    enable_waiter: boolean;
    enable_cashier: boolean;
    enable_courier: boolean;
    enable_reservations: boolean;
    enable_menu_management: boolean;
    enable_finance: boolean;
    enable_hr: boolean;
    enable_inventory: boolean;
    enable_ai: boolean;
    enable_marketing: boolean;
    enable_reports: boolean;
    enable_branches?: boolean;
    enable_overview?: boolean;
    enable_orders?: boolean;
    [key: string]: any;
  };
  
  // Financial Permissions
  can_view_daily_revenue?: boolean;
  can_view_monthly_revenue?: boolean;
  can_view_yearly_revenue?: boolean;
  can_view_net_profit?: boolean;
  can_view_expenses?: boolean;
  can_view_payroll?: boolean;
  can_view_analytics?: boolean;
  
  // Module Access Permissions
  can_view_kitchen_screen?: boolean;
  can_view_waiter_panel?: boolean;
  can_view_cashier_panel?: boolean;
  can_manage_menu?: boolean;
  can_manage_inventory?: boolean;
  can_manage_customers?: boolean;
  can_view_ai_reports?: boolean;
  can_manage_campaigns?: boolean;
  can_view_reviews?: boolean;
  can_manage_settings?: boolean;
  can_manage_branches?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, access: string, refresh: string, rememberMe?: boolean) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  login: (user, access, refresh, rememberMe = false) => {
    const cookieOptions = rememberMe ? { expires: 30 } : {};
    Cookies.set('access_token', access, cookieOptions);
    Cookies.set('refresh_token', refresh, cookieOptions);
    // Ideally we would also store the user object in localStorage or fetch it
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user, isAuthenticated: true, isLoading: false });
  },
  
  logout: () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  
  checkAuth: () => {
    const token = Cookies.get('access_token');
    let user = null;
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          user = JSON.parse(storedUser);
        } catch (e) {}
      }
    }
    
    if (token && user) {
      set({ user, isAuthenticated: true, isLoading: false });
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  }
}));
