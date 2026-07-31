"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Loader2, ChefHat, CheckCircle2, AlertCircle, RefreshCcw, Flame, Clock } from 'lucide-react';
import Cookies from 'js-cookie';

interface OrderItem {
  id: number;
  product: number;
  product_name_snapshot: string;
  quantity: number;
  note: string;
}

interface Order {
  id: number;
  tracking_code: string;
  order_type: string;
  status: string;
  total_amount: string;
  created_at: string;
  items: OrderItem[];
  table?: string;
}

export default function KDSPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore(state => state.user);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/order/');
      // Filter orders that need kitchen attention
      const activeOrders = response.data.filter((o: Order) => ['NEW', 'ACCEPTED', 'PREPARING'].includes(o.status));
      setOrders(activeOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Use polling for reliability
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.patch(`/orders/order/${orderId}/`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert("Xəta baş verdi");
    }
  };

  const getTimerDisplay = (dateString: string) => {
    const created = new Date(dateString);
    const diffSecs = Math.floor((currentTime.getTime() - created.getTime()) / 1000);
    
    if (diffSecs < 0) return "00:00";
    
    const h = Math.floor(diffSecs / 3600);
    const m = Math.floor((diffSecs % 3600) / 60);
    const s = diffSecs % 60;
    
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isOrderLate = (dateString: string) => {
    const created = new Date(dateString);
    const diffMins = Math.floor((currentTime.getTime() - created.getTime()) / 60000);
    return diffMins >= 15;
  };


  if (isLoading && orders.length === 0) {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-rose-600 mb-4" />
        <p className="text-gray-500 font-medium">Mətbəx ekranı yüklənir...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">

      {/* Header matching Cashier / Operations design */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100 shadow-[0_2px_10px_rgb(0,0,0,0.04)]">
            <ChefHat className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Mətbəx Ekranı (KDS)</h1>
            <p className="text-gray-500 font-medium text-sm mt-0.5">Sipariş hazırlık ve mutfak yönetimi</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-bold border border-gray-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> 
            <span className="text-gray-700">Sistem Aktif</span>
          </div>
          <div className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-sm font-black border border-rose-100 shadow-sm">
            {orders.length} Bekleyen Sipariş
          </div>
          <button 
            onClick={fetchOrders} 
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black transition-all shadow-[0_4px_20px_rgb(79,70,229,0.2)] hover:-translate-y-0.5 active:scale-95 group"
          >
            <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" /> Ekranı Yenile
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[32px] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col items-center relative overflow-hidden">
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 relative z-10 shadow-inner">
            <ChefHat className="w-12 h-12 text-orange-400 animate-bounce" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight relative z-10">Mətbəx Boşdur</h3>
          <p className="text-gray-500 mt-3 font-medium text-lg relative z-10">Bütün siparişler hazırlandı, biraz dinlenebilirsiniz.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {orders.map(order => {
            const isLate = isOrderLate(order.created_at);
            const isPreparing = order.status === 'PREPARING';

            return (
              <div key={order.id} className={`bg-white rounded-[16px] shadow-sm border ${isLate ? 'border-rose-200' : 'border-gray-200'} overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg relative group`}>
                
                {/* Header Area */}
                <div className={`p-3 flex justify-between items-start border-b ${
                  isPreparing ? 'bg-orange-50/50 border-orange-100/50' : 'bg-rose-50/50 border-rose-100/50'
                }`}>
                  <div>
                    <h3 className="font-black text-base text-gray-900 tracking-tight">
                       {order.table ? (order.table.toString().toLowerCase().includes('masa') ? order.table : `Masa ${order.table}`) : 'Paket Servis'}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">#{order.id}</span>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[10px] font-black shadow-sm flex items-center gap-1
                    ${isPreparing ? 'bg-orange-100 text-orange-700' : 'bg-rose-100 text-rose-700'} 
                    ${isLate ? 'animate-pulse ring-2 ring-rose-400/50' : ''}`}>
                    <Clock className="w-3 h-3" />
                    {getTimerDisplay(order.created_at)}
                  </div>
                </div>

                {/* Items List */}
                <div className="p-1.5 flex-1 overflow-y-auto bg-slate-50/30 max-h-[300px]">
                  <div className="space-y-0.5">
                    {order.items?.map((item: any, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start p-2 bg-white hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                        <div className={`w-7 h-7 rounded-lg font-black flex items-center justify-center flex-shrink-0 text-xs shadow-sm
                          ${isPreparing ? 'bg-orange-100 text-orange-700' : 'bg-rose-100 text-rose-700'}
                        `}>
                          {Number(item.quantity)}x
                        </div>
                        <div className="flex-1 pt-0.5">
                           <span className="font-bold text-slate-800 text-[13px] leading-tight">{item.product_name_snapshot}</span>
                           {item.note && (
                            <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-start gap-1 bg-rose-50 p-1.5 rounded-md border border-rose-100/50">
                              <AlertCircle className="w-3 h-3 flex-shrink-0" /> 
                              <span className="leading-snug">{item.note}</span>
                            </p>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-2.5 bg-white border-t border-gray-50">
                    {['NEW', 'ACCEPTED'].includes(order.status) ? (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                        className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-rose-500/20 active:scale-[0.98]"
                      >
                        <Flame className="w-4 h-4" /> Hazırlamaya Başla
                      </button>
                    ) : (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'READY')}
                        className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-orange-500/20 active:scale-[0.98]"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Hazırlandı
                      </button>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
