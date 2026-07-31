"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { RotateCcw, Search, ArrowLeft, PlusCircle, FileText, Truck, CreditCard, Users, ChefHat, TrendingDown, BarChart2, BookOpen, Gift, Clock, DollarSign, PieChart, ShoppingCart, MapPin, Star, Calendar, CheckCircle2 } from 'lucide-react';

export default function ManagementFinanceRefundsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/orders/order/');
      setOrders(response.data);
      setError('');
    } catch (err: any) {
      setError('Məlumatları yükləmək mümkün olmadı.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const cancelledOrders = orders.filter(o => o.status?.toUpperCase() === 'CANCELLED');
  
  const filteredOrders = cancelledOrders.filter(o => 
    o.id.toString().includes(searchQuery) || 
    (o.table && o.table.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalCancelledAmount = cancelledOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 shadow-[0_2px_10px_rgb(0,0,0,0.04)]">
            <RotateCcw className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">İmtinalar və Qaytarmalar</h1>
            <p className="text-gray-500 font-medium text-sm mt-0.5">Sifariş İptalleri ve İadeler</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Sipariş ID veya Masa ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>
          <button onClick={fetchOrders} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-gray-600">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center">
            <TrendingDown className="w-7 h-7 text-rose-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 mb-1">Toplam İptal Tutarı (Zarar)</p>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">₼{totalCancelledAmount.toFixed(2)}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center">
            <FileText className="w-7 h-7 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 mb-1">İptal Edilen Sipariş Sayısı</p>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{cancelledOrders.length} Adet</h3>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
            <p className="text-gray-500 font-medium">İptaller yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32">
            <p className="text-red-500 font-bold mb-4">{error}</p>
            <button onClick={fetchOrders} className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold">Tekrar Dene</button>
          </div>
        ) : filteredOrders.length === 0 ? (
           <div className="text-center py-32 flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Harika! İptal Edilen Sipariş Yok</h3>
            <p className="text-gray-500 font-medium">Sistemde henüz iptal edilmiş bir sipariş bulunmuyor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-6 font-bold text-xs text-gray-500 uppercase tracking-wider">Sipariş No</th>
                  <th className="py-4 px-6 font-bold text-xs text-gray-500 uppercase tracking-wider">Masa</th>
                  <th className="py-4 px-6 font-bold text-xs text-gray-500 uppercase tracking-wider">Tarih / Saat</th>
                  <th className="py-4 px-6 font-bold text-xs text-gray-500 uppercase tracking-wider">İptal Sebebi</th>
                  <th className="py-4 px-6 font-bold text-xs text-gray-500 uppercase tracking-wider text-right">Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-black text-gray-900">#{order.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-gray-700">{order.table || 'Belirtilmedi'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-600 text-sm">{formatTime(order.created_at)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg max-w-xs truncate" title={order.cancellation_reason || 'Sebep belirtilmemiş'}>
                        <span className="text-sm font-bold text-rose-600">{order.cancellation_reason || 'Sebep belirtilmemiş'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-black text-rose-600 text-lg">₼{Number(order.total_amount).toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
