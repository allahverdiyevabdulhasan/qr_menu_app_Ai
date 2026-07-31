'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Bell, Search, User, LogOut, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import Cookies from 'js-cookie';
import { useTranslation } from '@/components/LanguageProvider';

export default function Header() {
  const router = useRouter();
  const { user, logout, checkAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [restaurantSlug, setRestaurantSlug] = useState<string | null>(null);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  
  const { t, locale, setLocale } = useTranslation();
  
  // Notification states
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDetails, setNotifDetails] = useState({ orders: 0, calls: 0 });
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const prevCountRef = useRef(-1); // -1 means initial load

  useEffect(() => {
    checkAuth();
    setMounted(true);
  }, [checkAuth]);
  
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.is_superuser || user?.is_super_admin;

  // Set the restaurant slug dynamically based on logged in user
  useEffect(() => {
    const impersonatedSlug = localStorage.getItem('impersonated_restaurant_slug');
    const isImpersonating = Cookies.get('superadmin_access_token');
    
    if (isImpersonating && impersonatedSlug) {
      setRestaurantSlug(impersonatedSlug);
    } else if (user?.restaurant_slug) {
      setRestaurantSlug(user.restaurant_slug);
    } else if (mounted) {
      // Fallback: If user has no slug but is logged in (not superadmin), fetch it
      if (!isSuperAdmin) {
        api.get('/restaurants/restaurant/')
          .then(res => {
            if (res.data && res.data.length > 0) {
              setRestaurantSlug(res.data[0].slug);
            }
          })
          .catch(err => console.error("Could not fetch restaurant", err));
      }
    }
  }, [user, mounted, isSuperAdmin]);

  // Poll for notifications
  useEffect(() => {
    if (!mounted || !user || isSuperAdmin) return;

    const fetchNotifications = async () => {
      try {
        const [callsRes] = await Promise.all([
          // api.get('/orders/order/').catch((e) => { console.log('Poll Order err:', e.response?.data); return { data: [] }; }),
          api.get('/tables/waitercall/').catch((e) => { console.log('Poll Call err:', e.response?.data); return { data: [] }; })
        ]);
        
        // Temporarily default newOrders to 0
        const newOrders = 0; // ordersRes.data.filter((o: any) => o.status === 'NEW').length;
        const activeCalls = callsRes.data.filter((c: any) => c.is_active).length;
        const totalUnread = newOrders + activeCalls;

        if (totalUnread > prevCountRef.current && prevCountRef.current !== -1) {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(e => console.log('Audio error:', e));
        }
        
        prevCountRef.current = totalUnread;
        setUnreadCount(totalUnread);
        setNotifDetails({ orders: newOrders, calls: activeCalls });

      } catch (err) {
        console.log('Notification fetch error', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [mounted, user, isSuperAdmin]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shadow-sm z-50 sticky top-0">
      <div className="flex-1 flex items-center">
        <div className="relative w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </span>
          <input 
            type="text" 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 transition-all focus:bg-white" 
            placeholder={t('header_search_placeholder')} 
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        {restaurantSlug && !isSuperAdmin && (
          <a 
            href={`/m/${restaurantSlug}`} 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Eye size={18} />
            Canlı Menü
          </a>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)} 
            className="relative text-gray-500 hover:text-indigo-600 transition-colors mt-2"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 ring-2 ring-white text-[8px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {isNotifMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100 mb-1">
                <span className="font-bold text-gray-700 text-sm">{t('header_notifications')}</span>
              </div>
              
              <button
                onClick={() => { router.push('/operations/orders'); setIsNotifMenuOpen(false); }}
                className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-indigo-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">{t('header_notif_new_orders')}</span>
                {notifDetails.orders > 0 ? (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{notifDetails.orders}</span>
                ) : (
                  <span className="text-gray-400 text-xs">0</span>
                )}
              </button>
              
              <button
                onClick={() => { router.push('/operations/waiter'); setIsNotifMenuOpen(false); }}
                className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-indigo-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">{t('header_notif_waiter_calls')}</span>
                {notifDetails.calls > 0 ? (
                  <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{notifDetails.calls}</span>
                ) : (
                  <span className="text-gray-400 text-xs">0</span>
                )}
              </button>
            </div>
          )}
        </div>
        
        {/* Language Switcher */}
        <div className="relative">
          <button 
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors bg-white font-bold text-gray-700"
          >
            {locale.toUpperCase()}
          </button>
          
          {isLangMenuOpen && (
            <div className="absolute right-0 mt-2 w-24 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
              {['tr', 'en', 'az', 'ru'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => { setLocale(lang); setIsLangMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors ${locale === lang ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-700'}`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-gray-200 mx-1"></div>

        <div className="flex items-center space-x-3 border-l border-gray-200 pl-6">
          {mounted && user ? (
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-gray-800">{user.first_name || user.username}</span>
              <span className="text-xs text-gray-500">{user.role?.replace('_', ' ') || 'User'}</span>
            </div>
          ) : (
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-gray-800">{t('wait')}</span>
            </div>
          )}
          <div 
            className="h-9 w-9 rounded-full bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center text-red-600 font-bold border border-red-200 cursor-pointer" 
            onClick={handleLogout}
            title={t('header_logout')}
          >
            <LogOut size={16} />
          </div>
        </div>
      </div>
    </header>
  );
}

