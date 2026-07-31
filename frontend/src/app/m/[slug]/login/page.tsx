'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { ChevronLeft, Loader2, Phone, Lock, Eye, EyeOff, Mail, User } from 'lucide-react';
import { use } from 'react';
import { useTranslation } from '@/components/LanguageProvider';

export default function CustomerLoginPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(`/m/${resolvedParams.slug}/profile`);
    }
  }, [isAuthenticated, authLoading, router, resolvedParams.slug]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrEmail || !password) {
      setError(t('auth_err_login_empty'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('http://127.0.0.1:8000/api/auth/login/', {
        username: phoneOrEmail,
        password: password,
      });

      const { access, refresh } = response.data;
      
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      const meResponse = await api.get('http://127.0.0.1:8000/api/auth/me/');
      const user = meResponse.data;

      login(user, access, refresh, true);
      
      // Capture location on login
      if (typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          localStorage.setItem('user_lat', position.coords.latitude.toString());
          localStorage.setItem('user_lng', position.coords.longitude.toString());
        }, (err) => {
          console.log("Konum alınamadı:", err);
        });
      }
      
      // Redirect back to menu
      router.push(`/m/${resolvedParams.slug}`);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.error || t('auth_err_login_fail'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = () => {
    setPhoneOrEmail('testuser');
    setPassword('password123');
    // We delay the submit slightly so state can update
    setTimeout(() => {
      document.getElementById('login-form-submit')?.click();
    }, 100);
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA] flex flex-col font-sans selection:bg-zinc-200">
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-[#FAFAFA]/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="px-5 py-4 flex items-center">
           <button onClick={() => router.push(`/m/${resolvedParams.slug}`)} className="w-10 h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-900 shadow-sm active:scale-95 transition-transform">
             <ChevronLeft size={20} strokeWidth={2.5}/>
           </button>
           <div className="flex-1 text-center pr-10">
             <h1 className="font-bold text-[15px] tracking-tight text-zinc-900">{t('auth_login_title')}</h1>
           </div>
        </div>
      </div>

      <div className="flex-1 px-6 pt-10 pb-20 flex flex-col justify-center">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-zinc-900 mb-2 tracking-tight">{t('auth_welcome')}</h2>
          <p className="text-sm text-zinc-500 font-medium leading-relaxed">{t('auth_login_desc')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">{t('auth_email_or_user')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-zinc-400" />
              </div>
              <input
                type="text"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-zinc-200 rounded-2xl text-sm font-medium text-zinc-900 outline-none focus:border-zinc-400 transition-colors shadow-sm placeholder:text-zinc-400"
                placeholder={t('auth_email_or_user_ph')}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">{t('auth_password')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-zinc-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 bg-white border border-zinc-200 rounded-2xl text-sm font-medium text-zinc-900 outline-none focus:border-zinc-400 transition-colors shadow-sm placeholder:text-zinc-400"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <button
            id="login-form-submit"
            type="submit"
            disabled={isLoading}
            className="w-full bg-zinc-900 text-white font-semibold py-4 rounded-2xl shadow-xl shadow-zinc-900/10 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-70 disabled:pointer-events-none"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth_login_link')}
          </button>
          
          <button
            type="button"
            onClick={handleTestLogin}
            className="w-full bg-emerald-50 text-emerald-600 font-semibold py-4 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-emerald-100 border border-emerald-200 mt-2"
          >
            {t('auth_fast_test_login')}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm font-medium text-zinc-500">
          {t('auth_no_account')} <Link href={`/m/${resolvedParams.slug}/register`} className="text-zinc-900 font-bold underline underline-offset-2">{t('auth_register_title')}</Link>
        </div>
      </div>
    </div>
  );
}
