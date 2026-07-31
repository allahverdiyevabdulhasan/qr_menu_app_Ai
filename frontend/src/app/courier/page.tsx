'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Package, MapPin, CheckCircle2, Navigation, LogOut, Info, Phone } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function CourierAppPage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();
  const accessToken = Cookies.get('access_token');
  const [isClient, setIsClient] = useState(false);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const fetchOrders = async () => {
    if (!isAuthenticated || !accessToken) return;
    setIsLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/public/courier/orders/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      setOrders(res.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setToastMessage({ message: "Bu panele sadece kuryeler erişebilir.", type: 'error' });
      } else {
        setToastMessage({ message: "Siparişler yüklenemedi.", type: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isClient && isAuthenticated) {
      fetchOrders();
    } else {
      setIsLoading(false);
    }
  }, [isClient, isAuthenticated, accessToken]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await axios.post(`http://localhost:8000/api/public/auth/login/`, {
        username: loginEmail,
        password: loginPassword
      });
      useAuthStore.getState().login(res.data.user, res.data.access, res.data.refresh);
      
      // Capture location on login
      if (typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          localStorage.setItem('courier_lat', position.coords.latitude.toString());
          localStorage.setItem('courier_lng', position.coords.longitude.toString());
        }, (err) => {
          console.log("Kurye konumu alınamadı:", err);
        });
      }
    } catch (err: any) {
      setToastMessage({ message: "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.", type: 'error' });
    } finally {
      setLoginLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await axios.post(`http://localhost:8000/api/public/courier/orders/${orderId}/status/`, { status }, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      setToastMessage({ message: "Sipariş durumu güncellendi.", type: 'success' });
      fetchOrders();
    } catch (err: any) {
      setToastMessage({ message: err.response?.data?.error || "Hata oluştu.", type: 'error' });
    }
  };

  if (!isClient) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] bg-zinc-900 flex flex-col items-center justify-center p-6 text-white font-sans">
         <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center mb-6 rotate-3">
            <Package size={32} strokeWidth={1.5} className="text-white" />
         </div>
         <h1 className="text-2xl font-bold mb-2">Kurye Paneli</h1>
         <p className="text-zinc-400 text-sm mb-10">Lütfen kurye hesabınızla giriş yapın.</p>
         
         <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
            <input 
              type="text" 
              placeholder="Kullanıcı Adı veya E-posta" 
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-sm outline-none focus:border-emerald-500 transition-colors"
            />
            <input 
              type="password" 
              placeholder="Şifre" 
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-sm outline-none focus:border-emerald-500 transition-colors"
            />
            <button disabled={loginLoading} type="submit" className="w-full bg-emerald-500 text-white font-medium py-4 rounded-2xl flex justify-center items-center active:scale-95 transition-transform disabled:opacity-50 mt-4">
              {loginLoading ? <Loader2 className="animate-spin" size={20} /> : "Giriş Yap"}
            </button>
         </form>

         {toastMessage && (
           <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[150] px-5 py-3 bg-red-500 rounded-full shadow-xl text-sm font-medium animate-in slide-in-from-top-4">
             {toastMessage.message}
           </div>
         )}
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-100 font-sans text-zinc-900 flex flex-col">
       {/* HEADER */}
       <div className="bg-zinc-900 text-white px-5 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Package size={16} strokeWidth={2} className="text-white" />
             </div>
             <div>
                <h1 className="font-bold text-sm tracking-wide">Kurye Paneli</h1>
                <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-semibold">Aktif Görevdesiniz</p>
             </div>
          </div>
          <button onClick={() => logout()} className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
            <LogOut size={16} />
          </button>
       </div>

       <div className="flex-1 p-5 pb-10 space-y-4 max-w-lg mx-auto w-full">
         <h2 className="font-semibold text-lg mb-2">Aktif Siparişleriniz</h2>
         
         {isLoading ? (
           <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-400" size={32}/></div>
         ) : orders.length === 0 ? (
           <div className="bg-white rounded-3xl p-10 text-center flex flex-col items-center justify-center shadow-sm border border-zinc-200 mt-10">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="font-semibold text-lg">Tüm siparişleri teslim ettiniz!</h3>
              <p className="text-sm text-zinc-500 mt-2">Şu an size atanmış bekleyen bir teslimat bulunmuyor. Yeni siparişler geldiğinde burada görünecek.</p>
              <button onClick={fetchOrders} className="mt-6 text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl">Yenile</button>
           </div>
         ) : (
           orders.map(order => (
             <div key={order.id} className="bg-white rounded-3xl p-5 shadow-sm border border-zinc-200 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${order.status === 'OUT_FOR_DELIVERY' ? 'bg-amber-400' : 'bg-emerald-500'}`}></div>
                
                <div className="flex justify-between items-start mb-4">
                   <div>
                     <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">SİPARİŞ KODU</span>
                     <span className="font-semibold text-zinc-900">{order.tracking_code || `#${order.id}`}</span>
                   </div>
                   <div className="text-right">
                     <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">TUTAR</span>
                     <span className="font-bold text-lg text-emerald-600">{order.total_amount} ₺</span>
                     {Number(order.tip_amount) > 0 && <span className="block text-[10px] text-emerald-500 font-bold uppercase tracking-wider">+{order.tip_amount}₺ Bahşiş</span>}
                   </div>
                </div>

                <div className="bg-zinc-50 rounded-2xl p-4 mb-5 border border-zinc-100">
                   <div className="flex items-start gap-3 mb-3">
                     <MapPin size={18} className="text-zinc-400 flex-shrink-0 mt-0.5" />
                     <div>
                       <p className="text-sm font-medium text-zinc-900">{order.address || "Adres belirtilmemiş"}</p>
                     </div>
                   </div>
                   {order.phone && (
                     <div className="flex items-center gap-3">
                       <Phone size={18} className="text-zinc-400 flex-shrink-0" />
                       <p className="text-sm font-medium text-zinc-900">{order.phone}</p>
                     </div>
                   )}
                </div>

                {order.status === 'READY' || order.status === 'PREPARING' || order.status === 'ACCEPTED' || order.status === 'NEW' ? (
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}
                    className="w-full bg-amber-500 text-white font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <Navigation size={18} /> Yola Çıktı Olarak İşaretle
                  </button>
                ) : order.status === 'OUT_FOR_DELIVERY' ? (
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                    className="w-full bg-emerald-500 text-white font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <CheckCircle2 size={18} /> Teslim Edildi Olarak İşaretle
                  </button>
                ) : (
                   <div className="w-full bg-zinc-100 text-zinc-500 font-medium py-3.5 rounded-xl flex items-center justify-center gap-2">
                     <Info size={18} /> Durum: {order.status}
                   </div>
                )}
             </div>
           ))
         )}
       </div>

       {/* TOAST MESSAGE */}
       {toastMessage && (
         <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[150] px-5 py-3 rounded-full shadow-xl text-sm font-medium animate-in slide-in-from-top-4 flex items-center gap-2 border" style={{ 
             backgroundColor: toastMessage.type === 'success' ? '#10b981' : '#ef4444', 
             color: 'white',
             borderColor: toastMessage.type === 'success' ? '#059669' : '#dc2626'
         }}>
           {toastMessage.type === 'success' ? <CheckCircle2 size={16} /> : <Info size={16} />}
           {toastMessage.message}
         </div>
       )}
    </div>
  );
}
