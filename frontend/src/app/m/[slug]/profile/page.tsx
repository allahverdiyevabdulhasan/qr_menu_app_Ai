'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { 
  ChevronLeft, LogOut, User, 
  MapPin, Phone, Mail, ReceiptText, ChevronRight, Wallet, Apple
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import Cookies from 'js-cookie';
import { useTranslation } from '@/components/LanguageProvider';

export default function CustomerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuthStore();
  const { t } = useTranslation();

  const [preferences, setPreferences] = useState<{wallet_balance: string, dietary_preferences: string[], allergies: string[]}>({
    wallet_balance: '0.00',
    dietary_preferences: [],
    allergies: []
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push(`/m/${resolvedParams.slug}/login`);
      return;
    }

    const fetchPreferences = async () => {
      try {
        const token = Cookies.get('access_token');
        const response = await axios.get(`http://127.0.0.1:8000/api/public/auth/me/preferences/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setPreferences(response.data);
      } catch (error: any) {
        if (error.response?.status === 404) {
           console.log('User has no preferences profile yet.');
        } else {
           console.log('Error fetching preferences');
        }
      }
    };
    fetchPreferences();
  }, [isAuthenticated, authLoading, router, resolvedParams.slug]);

  if (authLoading || !isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    router.push(`/m/${resolvedParams.slug}`);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'M';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col font-sans text-slate-900 pb-20">
      {/* HEADER BACKGROUND */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-br from-[#7A5CFF] via-[#5C45CC] to-[#3B298C] rounded-b-[40px] shadow-lg overflow-hidden z-0">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* TOP NAV */}
      <div className="relative z-10 px-6 py-6 flex items-center justify-between text-white">
        <button onClick={() => router.push(`/m/${resolvedParams.slug}`)} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white active:scale-95 transition-all hover:bg-white/30 border border-white/10">
          <ChevronLeft size={22} strokeWidth={2.5}/>
        </button>
        <h1 className="font-bold text-lg tracking-wide">{t('profile_title') || 'Profil'}</h1>
        <button onClick={handleLogout} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white active:scale-95 transition-all hover:bg-red-500/80 border border-white/10">
          <LogOut size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="relative z-10 max-w-xl mx-auto w-full px-6 pt-2">
        
        {/* User Info Panel */}
        <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 mb-6 flex flex-col items-center text-center -mt-2">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-[#7A5CFF] font-black text-3xl mb-4 border-[4px] border-white shadow-sm">
             {getInitials(user?.first_name || user?.username)}
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-800">{user?.first_name || user?.username || 'Değerli Müşterimiz'}</h2>
          
          <div className="flex items-center gap-4 mt-4 w-full justify-center">
            {user?.email && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500">
                <Mail size={12} className="text-[#7A5CFF]" />
                <span className="truncate max-w-[120px]">{user.email}</span>
              </div>
            )}
            {user?.phone && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500">
                <Phone size={12} className="text-[#7A5CFF]" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Wallet Dashboard */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-7 shadow-xl shadow-slate-900/20 mb-6 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#7A5CFF]/30 to-transparent rounded-full blur-2xl -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-125"></div>
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-300">
                <Wallet size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">{t('profile_wallet_balance') || 'Cüzdan Bakiyem'}</span>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black tracking-tighter">{Number(preferences.wallet_balance).toFixed(2)}</span>
              <span className="text-xl font-bold text-slate-400 mb-1">₺</span>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <Link href={`/m/${resolvedParams.slug}/orders`} className="bg-white p-5 rounded-[28px] shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center gap-3 active:scale-95 transition-all hover:border-indigo-100 hover:shadow-md">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#7A5CFF]">
                    <ReceiptText size={26} strokeWidth={2} />
                </div>
                <span className="font-bold text-slate-700 text-sm">{t('profile_my_orders') || 'Siparişlerim'}</span>
            </Link>

            <Link href={`/m/${resolvedParams.slug}/profile/addresses`} className="bg-white p-5 rounded-[28px] shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center gap-3 active:scale-95 transition-all hover:border-emerald-100 hover:shadow-md">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <MapPin size={26} strokeWidth={2} />
                </div>
                <span className="font-bold text-slate-700 text-sm">{t('profile_my_addresses') || 'Adreslerim'}</span>
            </Link>

            <Link href={`/m/${resolvedParams.slug}/profile/preferences`} className="col-span-2 bg-white p-5 rounded-[28px] shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-between active:scale-[0.98] transition-all hover:border-orange-100 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                      <Apple size={26} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{t('profile_allergies_prefs') || 'Alerji ve Tercihler'}</span>
                    <span className="text-xs font-medium text-slate-400">Yemek profilinizi yönetin</span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-300" />
            </Link>
        </div>

      </div>
    </div>
  );
}
