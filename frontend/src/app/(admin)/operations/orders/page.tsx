'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2, ClipboardList, Flame, CheckCircle2, CircleDollarSign, Search, Filter, Eye, Printer, MoreHorizontal, Edit, Clock, X, Check, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function OrdersPage() {
  const { user } = useAuthStore();
  const currencySymbol = user?.restaurant_currency || '₺';

  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'NEW' | 'PREPARING' | 'READY' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [statusOrder, setStatusOrder] = useState<any>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/orders/order/?hide_z_reported=true');
      setData(response.data);
    } catch (err: any) {
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

  const handleStatusChange = async (orderId: number, newStatus: string, reason?: string) => {
    setIsUpdatingStatus(true);
    try {
      const payload: any = { status: newStatus };
      if (reason) payload.cancellation_reason = reason;
      
      await api.patch(`/orders/order/${orderId}/`, payload);
      fetchData(); // refresh list
      setStatusOrder(null);
      setIsCancelling(false);
      setCancelReason('');
    } catch (err) {
      console.error(err);
      alert('Status dəyişdirilərkən xəta baş verdi.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Metrics calculation
  const todayOrders = data.length;
  const kitchenOrders = data.filter(o => o.status === 'PREPARING').length;
  const completedOrdersList = data.filter(o => o.status === 'COMPLETED' || o.status === 'SERVED');
  const todayRevenue = completedOrdersList.reduce((sum, o) => sum + Number(o.total_amount), 0);

  // Filter & Search Data
  const filteredData = data.filter(o => {
    const matchesFilter = 
      filter === 'ALL' ? true :
      filter === 'NEW' ? (o.status === 'NEW' || o.status === 'ACCEPTED') :
      filter === 'PREPARING' ? o.status === 'PREPARING' :
      filter === 'READY' ? o.status === 'READY' :
      filter === 'COMPLETED' ? (o.status === 'COMPLETED' || o.status === 'SERVED') : true;

    const matchesSearch = 
      o.tracking_code?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.table?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex justify-between items-center relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">BUGÜNKÜ SİPARİŞLER</h3>
            <p className="text-4xl font-black text-indigo-600">{todayOrders}</p>
          </div>
          <ClipboardList className="w-16 h-16 text-indigo-50 absolute -right-2 -bottom-2" />
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex justify-between items-center relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">MUTFAKTAKİ SİPARİŞLER</h3>
            <p className="text-4xl font-black text-orange-500">{kitchenOrders}</p>
          </div>
          <Flame className="w-16 h-16 text-orange-50 absolute -right-2 -bottom-2" />
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex justify-between items-center relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">TAMAMLANANLAR</h3>
            <p className="text-4xl font-black text-emerald-500">{completedOrdersList.length}</p>
          </div>
          <CheckCircle2 className="w-16 h-16 text-emerald-50 absolute -right-2 -bottom-2" />
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex justify-between items-center relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">BUGÜNKÜ CİRO</h3>
            <p className="text-4xl font-black text-indigo-500">{currencySymbol}{todayRevenue.toFixed(2)}</p>
          </div>
          <CircleDollarSign className="w-16 h-16 text-indigo-50 absolute -right-2 -bottom-2" />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-5 py-2.5 rounded-full text-sm font-black transition-all ${filter === 'ALL' ? 'bg-[#7A5CFF] text-white shadow-md shadow-indigo-500/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            Tümü
          </button>
          <button 
            onClick={() => setFilter('NEW')}
            className={`px-5 py-2.5 rounded-full text-sm font-black transition-all flex items-center gap-2 ${filter === 'NEW' ? 'bg-[#7A5CFF] text-white shadow-md shadow-indigo-500/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <div className="w-4 h-3 bg-blue-100 rounded-sm flex items-center justify-center"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div></div> Yeni Bekleyen
          </button>
          <button 
            onClick={() => setFilter('PREPARING')}
            className={`px-5 py-2.5 rounded-full text-sm font-black transition-all flex items-center gap-2 ${filter === 'PREPARING' ? 'bg-[#7A5CFF] text-white shadow-md shadow-indigo-500/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <Flame className={`w-4 h-4 ${filter === 'PREPARING' ? 'text-white' : 'text-orange-500'}`} /> Hazırlanıyor
          </button>
          <button 
            onClick={() => setFilter('READY')}
            className={`px-5 py-2.5 rounded-full text-sm font-black transition-all flex items-center gap-2 ${filter === 'READY' ? 'bg-[#7A5CFF] text-white shadow-md shadow-indigo-500/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <CheckCircle2 className={`w-4 h-4 ${filter === 'READY' ? 'text-white' : 'text-emerald-500'}`} /> Hazır
          </button>
          <button 
            onClick={() => setFilter('COMPLETED')}
            className={`px-5 py-2.5 rounded-full text-sm font-black transition-all flex items-center gap-2 ${filter === 'COMPLETED' ? 'bg-[#7A5CFF] text-white shadow-md shadow-indigo-500/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <div className="w-4 h-4 grid grid-cols-2 gap-[1px]">
              <div className={`bg-gray-400 ${filter === 'COMPLETED' ? 'bg-white' : ''} rounded-sm`}></div>
              <div className={`bg-gray-400 ${filter === 'COMPLETED' ? 'bg-white' : ''} rounded-sm`}></div>
              <div className={`bg-gray-400 ${filter === 'COMPLETED' ? 'bg-white' : ''} rounded-sm`}></div>
              <div className={`bg-gray-400 ${filter === 'COMPLETED' ? 'bg-white' : ''} rounded-sm`}></div>
            </div> 
            Tamamlanan
          </button>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Sipariş No veya Masa..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all flex-shrink-0">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
          <div className="w-10 h-10 bg-white rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.06)] flex items-center justify-center">
             <ClipboardList className="w-5 h-5 text-[#7A5CFF]" />
          </div>
          Sipariş Listesi
        </h2>
        <span className="bg-white border border-gray-100 text-[#7A5CFF] shadow-sm px-4 py-2 rounded-xl text-sm font-black">
          Toplam {filteredData.length} Sipariş
        </span>
      </div>

      <div className="overflow-x-auto pb-10">
        <table className="w-full text-left text-sm whitespace-nowrap border-separate" style={{ borderSpacing: '0 12px' }}>
          <thead>
            <tr className="text-gray-400">
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">SİPARİŞ NO</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">MASA / MÜŞTERİ</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">TİP</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">ÖĞELER</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">TOPLAM TUTAR</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">ÖDEME</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">DURUM</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">SAAT</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest text-right">İŞLEMLER</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? filteredData.map((order: any, idx: number) => (
              <tr key={idx} className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                <td className="px-6 py-5 rounded-l-[24px] font-black text-gray-900 text-sm relative">
                  <div className="absolute inset-y-0 left-0 w-1 bg-transparent group-hover:bg-[#7A5CFF] transition-colors rounded-l-[24px]"></div>
                  {order.tracking_code || `#${order.id}`}
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3 font-bold text-gray-800">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 text-sm shadow-sm border border-orange-100">🪑</div>
                    {order.table || 'Ayaqüstü'}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest border border-gray-100">
                    {order.order_type?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{order.items?.length || 0} Öğe</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                   <div className="font-black text-transparent bg-clip-text bg-gradient-to-r from-[#7A5CFF] to-blue-500 text-lg">
                     {currencySymbol}{Number(order.total_amount).toFixed(2)}
                   </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${order.payment_status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                    {order.payment_status}
                  </span>
                </td>
                <td className="px-6 py-5">
                    {order.status === 'NEW' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                        <Clock className="w-3.5 h-3.5" /> Onay Bekliyor
                      </span>
                    )}
                    {order.status === 'ACCEPTED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-yellow-50 text-yellow-600 border border-yellow-100 shadow-sm">
                        Kabul Edildi
                      </span>
                    )}
                    {order.status === 'PREPARING' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-orange-50 text-orange-600 border border-orange-100 shadow-sm">
                        <Flame className="w-3.5 h-3.5" /> Hazırlanıyor
                      </span>
                    )}
                    {order.status === 'READY' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Hazır
                      </span>
                    )}
                    {(order.status === 'COMPLETED' || order.status === 'SERVED') && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-gray-50 text-gray-600 border border-gray-200 shadow-sm">
                        Tamamlandı
                      </span>
                    )}
                    {order.status === 'CANCELLED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-rose-50 text-rose-600 border border-rose-100 shadow-sm">
                        İptal Edildi
                      </span>
                    )}
                </td>
                <td className="px-6 py-5 text-gray-400 font-medium text-xs">
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-bold">{new Date(order.created_at).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
                    <span>{new Date(order.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right rounded-r-[24px]">
                  <div className="flex items-center justify-end gap-1.5">
                    <button 
                      onClick={() => setViewOrder(order)}
                      title="Detayları Gör"
                      className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[#7A5CFF] bg-white hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-xl transition-all shadow-sm"
                    >
                      <Eye size={16} />
                    </button>
                    
                    <Link href={`/operations/orders/create?order_id=${order.id}`} title="Siparişe Ürün Ekle (Düzenle)">
                      <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[#7A5CFF] bg-white hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-xl transition-all shadow-sm">
                        <Edit size={16} />
                      </button>
                    </Link>

                    <button 
                      onClick={() => setStatusOrder(order)}
                      title="Durumu Değiştir"
                      className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-orange-600 bg-white hover:bg-orange-50 border border-transparent hover:border-orange-100 rounded-xl transition-all shadow-sm"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    
                    <button title="Yazdır" className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-900 bg-white hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded-xl transition-all shadow-sm">
                      <Printer size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={9} className="px-6 py-16 text-center bg-white rounded-[24px] shadow-sm border border-gray-50">
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-[#7A5CFF]" />
                      <span className="text-gray-500 font-bold">Yükleniyor...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <Search className="w-8 h-8 text-gray-300" />
                      </div>
                      <span className="text-gray-500 font-bold text-lg">Sipariş Bulunamadı</span>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Order Modal */}
      {viewOrder && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black text-gray-900">Sipariş Detayı</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">{viewOrder.tracking_code || `#ORD-${viewOrder.id}`} • {viewOrder.table}</p>
              </div>
              <button onClick={() => setViewOrder(null)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-white hover:shadow-sm rounded-full transition-all border border-transparent hover:border-gray-200">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                {viewOrder.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-4 border border-gray-100 rounded-2xl hover:border-indigo-100 transition-colors">
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-black flex items-center justify-center">
                        {Number(item.quantity)}x
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{item.product_name_snapshot}</p>
                        <p className="text-xs text-gray-400 font-medium">Birim: {currencySymbol}{Number(item.unit_price).toFixed(2)}</p>
                      </div>
                    </div>
                    <p className="font-black text-gray-900 text-lg">{currencySymbol}{Number(item.total_price).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-white">
              <div className="flex justify-between items-center p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                <span className="text-indigo-900 font-black">Toplam Tutar</span>
                <span className="text-3xl font-black text-[#7A5CFF]">{currencySymbol}{Number(viewOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal (Restored) */}
      {statusOrder && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-black text-gray-900">Durum Güncelle</h2>
              <button onClick={() => setStatusOrder(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-2">
              <button 
                onClick={() => handleStatusChange(statusOrder.id, 'ACCEPTED')}
                disabled={isUpdatingStatus}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 font-bold transition-colors"
              >
                <Check size={18} /> Siparişi Onayla
              </button>
              <button 
                onClick={() => handleStatusChange(statusOrder.id, 'PREPARING')}
                disabled={isUpdatingStatus}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 hover:text-orange-700 text-gray-700 font-bold transition-colors"
              >
                <Clock size={18} /> Hazırlanıyor
              </button>
              <button 
                onClick={() => handleStatusChange(statusOrder.id, 'READY')}
                disabled={isUpdatingStatus}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 hover:text-green-700 text-gray-700 font-bold transition-colors"
              >
                <CheckCircle2 size={18} /> Hazır
              </button>
              <button 
                onClick={() => handleStatusChange(statusOrder.id, 'SERVED')}
                disabled={isUpdatingStatus}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-bold transition-colors"
              >
                <CheckCircle2 size={18} /> Servis Edildi (Tamamlandı)
              </button>
              <button 
                onClick={() => setIsCancelling(true)}
                disabled={isUpdatingStatus}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 hover:text-red-700 text-gray-700 font-bold transition-colors"
              >
                <XCircle size={18} /> İptal Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {isCancelling && statusOrder && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-rose-50/30">
              <h2 className="text-lg font-black text-rose-600">İptal Sebebi</h2>
              <button onClick={() => { setIsCancelling(false); setCancelReason(''); }} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Lütfen iptal sebebini belirtin *</label>
                <textarea 
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Örn: Müşteri vazgeçti, Ürün kalmadı..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none resize-none h-24 font-medium"
                ></textarea>
              </div>
              <button 
                onClick={() => {
                  if (!cancelReason.trim()) {
                    alert('Lütfen bir iptal sebebi yazın!');
                    return;
                  }
                  handleStatusChange(statusOrder.id, 'CANCELLED', cancelReason);
                }}
                disabled={isUpdatingStatus || !cancelReason.trim()}
                className="w-full flex items-center justify-center gap-2 p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black transition-colors disabled:opacity-50"
              >
                <XCircle size={18} /> Siparişi İptal Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

