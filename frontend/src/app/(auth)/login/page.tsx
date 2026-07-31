'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Lock, Mail, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  
  const login = useAuthStore(state => state.login);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'SUPER_ADMIN' || user.role === 'RESTAURANT_OWNER' || user.role === 'MANAGER') {
        router.push('/dashboard');
      } else if (user.role === 'CASHIER') {
        router.push('/operations/cashier');
      } else if (user.role === 'WAITER') {
        router.push('/operations/waiter');
      } else if (user.role === 'KITCHEN_STAFF') {
        router.push('/operations/kds');
      } else if (user.role === 'COURIER') {
        router.push('/operations/courier');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Lütfen kullanıcı adı/e-posta ve şifrenizi girin.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/token/', {
        username: email,
        password: password,
      });

      const { access, refresh } = response.data;
      
      // Temporarily set token to fetch user info
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      const meResponse = await api.get('/accounts/user/me/');
      const user = meResponse.data;

      login(user, access, refresh, rememberMe);
      
      // Role-based redirection
      if (user.role === 'SUPER_ADMIN' || user.role === 'RESTAURANT_OWNER' || user.role === 'MANAGER') {
        router.push('/dashboard');
      } else if (user.role === 'CASHIER') {
        router.push('/operations/cashier');
      } else if (user.role === 'WAITER') {
        router.push('/operations/waiter');
      } else if (user.role === 'KITCHEN_STAFF') {
        router.push('/operations/kds');
      } else if (user.role === 'COURIER') {
        router.push('/operations/courier');
      } else {
        router.push('/dashboard'); // fallback
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 backdrop-blur-xl bg-[url('/bg-pattern.svg')] bg-cover py-10">
      <div className="w-full max-w-md p-8 bg-white/70 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            NeyMenu
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">Hesabınıza giriş yapın</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Kullanıcı Adı veya E-posta</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                placeholder="Örn: owner@demo.com"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-bold text-gray-700">Şifre</label>
              <Link href="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                Şifremi unuttum?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium text-center flex items-center justify-center gap-2">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer" 
                />
                <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Beni Hatırla</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Giriş Yap <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
