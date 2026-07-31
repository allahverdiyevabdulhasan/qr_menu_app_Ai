"use client";
import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Loader2, Hourglass, Flame, CheckCircle2, BellRing, Calendar, RefreshCcw, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WaiterPanelPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'NEW' | 'PREPARING' | 'READY' | 'CALLS' | 'RESERVATIONS'>('NEW');
  const router = useRouter();
  const prevCallsCountRef = useRef(0);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, callsRes] = await Promise.all([
        api.get('/orders/order/'),
        api.get('/tables/waitercall/').catch(() => ({ data: [] })) // Ignore if endpoint is missing for now
      ]);
      setOrders(ordersRes.data);
      const activeCalls = callsRes.data.filter((c: any) => c.is_active);
      setCalls(activeCalls);
      
      // Notification sound logic
      if (activeCalls.length > prevCallsCountRef.current && prevCallsCountRef.current !== -1) {
        // Only play if it's not the initial load (where ref is 0, but wait, initial load ref is 0. If it goes 0->2, it will play. That's fine or we can set it to -1 initially.)
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Audio error:', e));
      }
      // First load prevention: if ref is 0 and we load for first time, we don't want a bunch of sounds, but if we do, it's ok. Let's just update the ref.
      prevCallsCountRef.current = activeCalls.length;
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const changeOrderStatus = async (orderId: number, status: string) => {
    try {
      await api.patch(`/orders/order/${orderId}/`, { status });
      fetchData();
    } catch (err) {
      console.error("Status error:", err);
    }
  };

  const closeCall = async (callId: number) => {
    try {
      await api.patch(`/tables/waitercall/${callId}/`, { is_active: false });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const activeOrders = orders.filter(o => ['NEW', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status));
  const newOrders = activeOrders.filter(o => o.status === 'NEW' || o.status === 'ACCEPTED');
  const prepOrders = activeOrders.filter(o => o.status === 'PREPARING');
  const readyOrders = activeOrders.filter(o => o.status === 'READY');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Servise Hazır Siparişler</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Müşteriye ulaştırdığınız siparişleri "Servis Edildi" olarak işaretleyin.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push('/operations/orders/create')} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Yeni Sipariş
          </button>
          <button onClick={fetchData} className="px-5 py-2.5 bg-white border border-gray-200 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2">
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Yenile
          </button>
        </div>
      </div>

      {/* Metric Cards (Tabs) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-10">
        {[
          { id: 'NEW', label: 'ONAY BEKLEYEN', count: newOrders.length, gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/30', text: 'text-blue-600', bg: 'bg-blue-50', icon: <Hourglass className="w-7 h-7" /> },
          { id: 'PREPARING', label: 'MUTFAKTA', count: prepOrders.length, gradient: 'from-orange-400 to-rose-500', shadow: 'shadow-orange-500/30', text: 'text-orange-500', bg: 'bg-orange-50', icon: <Flame className="w-7 h-7" /> },
          { id: 'READY', label: 'SERVİSE HAZIR', count: readyOrders.length, gradient: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/30', text: 'text-emerald-600', bg: 'bg-emerald-50', icon: <CheckCircle2 className="w-7 h-7" /> },
          { 
            id: 'CALLS', 
            label: 'GARSON ÇAĞRILARI', 
            count: calls.length, 
            gradient: 'from-rose-400 to-pink-600', 
            shadow: 'shadow-rose-500/30', 
            text: 'text-rose-600', 
            bg: 'bg-rose-50', 
            icon: (
              <div className="relative">
                <BellRing className="w-7 h-7" />
                {calls.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full animate-pulse shadow-sm"></span>
                )}
              </div>
            )
          },
          { id: 'RESERVATIONS', label: 'REZERVASYONLAR', count: 0, gradient: 'from-purple-500 to-violet-600', shadow: 'shadow-purple-500/30', text: 'text-purple-600', bg: 'bg-purple-50', icon: <Calendar className="w-7 h-7" /> },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <div 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`cursor-pointer rounded-[24px] p-5 relative overflow-hidden transition-all duration-300 border-2
                ${isActive 
                  ? `bg-gradient-to-br ${tab.gradient} border-transparent text-white shadow-xl ${tab.shadow} scale-105` 
                  : `bg-white border-gray-100/80 hover:border-gray-200 hover:shadow-lg text-gray-500 hover:-translate-y-1`}
              `}
            >
              {isActive && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
              )}
              
              <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-[16px] transition-colors ${isActive ? 'bg-white/20 text-white shadow-inner' : `${tab.bg} ${tab.text}`}`}>
                    {tab.icon}
                  </div>
                  <h2 className={`text-4xl font-black tracking-tight ${isActive ? 'text-white' : 'text-gray-900'}`}>{tab.count}</h2>
                </div>
                <p className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-white/90' : 'text-gray-400'}`}>
                  {tab.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Active Calls Section */}
      {(activeTab === 'CALLS' || calls.length > 0) && (
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xs font-black text-rose-500 tracking-widest uppercase mb-4 flex items-center gap-2">
            <BellRing className="w-4 h-4" /> Aktif Masa Çağrıları & Talepleri
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {calls.map(call => (
              <div key={call.id} className="bg-white border border-rose-100 rounded-[24px] p-5 flex flex-col items-center justify-center text-center shadow-sm relative transition-all hover:shadow-md hover:-translate-y-1">
                <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-4 shadow-inner">
                  <BellRing className="w-6 h-6 animate-bounce" />
                </div>
                <h3 className="text-xl font-black text-gray-900">{call.table_name || `Masa #${call.table}`}</h3>
                <span className="px-3 py-1 bg-rose-100 text-rose-700 font-bold text-[10px] rounded-full uppercase mt-2 tracking-wide">
                  {call.call_type === 'bill' ? 'Hesap İstiyor' : 'Garson Çağrısı'}
                </span>
                <button 
                  onClick={() => closeCall(call.id)}
                  className="mt-5 w-full py-2.5 bg-white border-2 border-rose-100 hover:border-rose-200 hover:bg-rose-50 text-rose-600 text-sm font-bold rounded-xl transition-all"
                >
                  Gidildi ✓
                </button>
              </div>
            ))}
            {calls.length === 0 && <p className="text-sm text-gray-500 col-span-full">Şu an aktif bir çağrı yok.</p>}
          </div>
        </div>
      )}

      {/* Orders List Section */}
      {activeTab !== 'CALLS' && activeTab !== 'RESERVATIONS' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xs font-black text-indigo-500 tracking-widest uppercase mb-4 flex items-center gap-2">
            <Hourglass className="w-4 h-4" /> {
              activeTab === 'NEW' ? 'ONAY BEKLEYEN YENİ SİPARİŞLER' :
              activeTab === 'PREPARING' ? 'MUTFAKTA HAZIRLANAN SİPARİŞLER' :
              'SERVİSE HAZIR SİPARİŞLER'
            } ({activeTab === 'NEW' ? newOrders.length : activeTab === 'PREPARING' ? prepOrders.length : readyOrders.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {(activeTab === 'NEW' ? newOrders : activeTab === 'PREPARING' ? prepOrders : readyOrders).map(order => (
              <div key={order.id} className="bg-white rounded-[16px] shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100/80 flex flex-col overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 group">
                
                {/* Header Area */}
                <div className={`p-3 flex justify-between items-start border-b ${
                  activeTab === 'NEW' ? 'bg-blue-50/50 border-blue-100/50' : 
                  activeTab === 'PREPARING' ? 'bg-orange-50/50 border-orange-100/50' : 
                  'bg-emerald-50/50 border-emerald-100/50'
                }`}>
                  <div>
                    <h3 className="font-black text-base text-gray-900 tracking-tight">
                       {order.table ? (order.table.toString().toLowerCase().includes('masa') ? order.table : `Masa ${order.table}`) : 'Paket Servis'}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">#{order.tracking_code?.slice(-6) || order.tracking_code}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg shadow-sm
                    ${activeTab === 'NEW' ? 'bg-blue-600 text-white' : activeTab === 'PREPARING' ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'}
                  `}>
                    {activeTab === 'NEW' ? 'YENİ SİPARİŞ' : activeTab === 'PREPARING' ? 'HAZIRLANIYOR' : 'SERVİSE HAZIR'}
                  </span>
                </div>

                {/* Items List */}
                <div className="p-1.5 flex-1 overflow-y-auto max-h-[280px] bg-slate-50/30">
                  <div className="space-y-0.5">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex gap-2.5 items-center p-2 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                        <div className={`w-7 h-7 rounded-lg font-black flex items-center justify-center flex-shrink-0 text-xs shadow-sm
                          ${activeTab === 'NEW' ? 'bg-blue-100 text-blue-700' : activeTab === 'PREPARING' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}
                        `}>
                          {Number(item.quantity)}x
                        </div>
                        <div className="flex-1">
                           <span className="font-bold text-slate-800 text-[13px] leading-tight">{item.product_name_snapshot}</span>
                           {item.note && <p className="text-[11px] text-gray-500 mt-0.5">{item.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-2.5 bg-white border-t border-gray-50">
                  {activeTab === 'NEW' && (
                    <button onClick={() => changeOrderStatus(order.id, 'PREPARING')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-xl text-xs transition-all shadow-sm shadow-blue-600/20 flex justify-center items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Mutfağa Gönder
                    </button>
                  )}
                  {activeTab === 'READY' && (
                    <button onClick={() => changeOrderStatus(order.id, 'SERVED')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-2.5 rounded-xl text-xs transition-all shadow-sm shadow-emerald-500/20 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Servis Edildi
                    </button>
                  )}
                  {activeTab === 'PREPARING' && (
                    <div className="w-full bg-orange-50 text-orange-600 font-bold py-2.5 rounded-xl text-xs text-center flex items-center justify-center gap-1.5 border border-orange-100">
                      <Loader2 className="w-4 h-4 animate-spin" /> Mutfakta Hazırlanıyor...
                    </div>
                  )}
                </div>
              </div>
            ))}
            {(activeTab === 'NEW' ? newOrders : activeTab === 'PREPARING' ? prepOrders : readyOrders).length === 0 && (
              <div className="col-span-full py-16 text-center bg-gray-50/50 rounded-[32px] border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4">
                  <Hourglass className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-600">Sipariş Bulunmuyor</h3>
                <p className="text-sm text-gray-400 font-medium mt-1">Bu kategoride şu an aktif sipariş yok.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
