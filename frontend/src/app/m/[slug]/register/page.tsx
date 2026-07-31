'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { ChevronLeft, Loader2, Phone, Lock, Eye, EyeOff, User, Mail } from 'lucide-react';
import { use } from 'react';
import { useTranslation } from '@/components/LanguageProvider';

export default function CustomerRegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { t } = useTranslation();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useAuthStore(state => state.login);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t('auth_err_email'));
      return;
    }
    if (!password) {
      setError(t('auth_err_pass'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('http://127.0.0.1:8000/api/public/auth/register/', {
        name,
        phone,
        email,
        password,
        restaurant_slug: resolvedParams.slug
      });

      const { access, refresh } = response.data;
      
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      const meResponse = await api.get('http://127.0.0.1:8000/api/auth/me/');
      const user = meResponse.data;

      login(user, access, refresh, true);
      
      // Redirect back to menu
      router.push(`/m/${resolvedParams.slug}`);
      
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.detail || t('auth_err_register'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA] flex flex-col font-sans selection:bg-zinc-200">
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-[#FAFAFA]/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="px-5 py-4 flex items-center">
           <button onClick={() => router.push(`/m/${resolvedParams.slug}/login`)} className="w-10 h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-900 shadow-sm active:scale-95 transition-transform">
             <ChevronLeft size={20} strokeWidth={2.5}/>
           </button>
           <div className="flex-1 text-center pr-10">
             <h1 className="font-bold text-[15px] tracking-tight text-zinc-900">{t('auth_register_title')}</h1>
           </div>
        </div>
      </div>

      <div className="flex-1 px-6 pt-8 pb-20 flex flex-col justify-center">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-zinc-900 mb-2 tracking-tight">{t('auth_new_account')}</h2>
          <p className="text-sm text-zinc-500 font-medium leading-relaxed">{t('auth_register_desc')}</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">{t('auth_fullname')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-zinc-400" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm font-medium text-zinc-900 outline-none focus:border-zinc-400 transition-colors shadow-sm placeholder:text-zinc-400"
                placeholder={t('auth_fullname_ph')}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">{t('auth_email')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-zinc-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm font-medium text-zinc-900 outline-none focus:border-zinc-400 transition-colors shadow-sm placeholder:text-zinc-400"
                placeholder={t('auth_email_ph')}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">{t('auth_phone')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="w-5 h-5 text-zinc-400" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm font-medium text-zinc-900 outline-none focus:border-zinc-400 transition-colors shadow-sm placeholder:text-zinc-400"
                placeholder={t('auth_phone_ph')}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">{t('auth_password')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-zinc-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 bg-white border border-zinc-200 rounded-2xl text-sm font-medium text-zinc-900 outline-none focus:border-zinc-400 transition-colors shadow-sm placeholder:text-zinc-400"
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
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium text-center mt-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-semibold shadow-xl shadow-zinc-900/10 active:scale-95 transition-transform flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth_register_title')}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm font-medium text-zinc-500">
          {t('auth_already_have_account')} <Link href={`/m/${resolvedParams.slug}/login`} className="text-zinc-900 font-bold underline underline-offset-2">{t('auth_login_link')}</Link>
        </div>
      </div>
    </div>
  );
}
