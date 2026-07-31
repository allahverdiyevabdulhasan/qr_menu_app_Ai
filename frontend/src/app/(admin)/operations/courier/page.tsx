"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { Truck, Search, ArrowLeft, PlusCircle, RotateCcw, FileText, CreditCard, Users, ChefHat, TrendingDown, BarChart2, BookOpen, Gift, Clock, DollarSign, PieChart, ShoppingCart, MapPin, Star, Calendar } from 'lucide-react';

export default function OperationsCourierPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/orders/order/');
      setData(response.data);
      setError('');
    } catch (err: any) {
      setError('Məlumatları yükləmək mümkün olmadı.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm">
            <Truck className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Kuryer Paneli</h1>
            <p className="text-gray-500 font-medium text-sm">Çatdırılma İzləmə</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Axtarış..." 
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-6 flex flex-col mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
             <div className="w-10 h-10 bg-white rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.06)] flex items-center justify-center">
                <Truck className="w-5 h-5 text-indigo-600" />
             </div>
             Kuryer Sifarişləri
          </h2>
          <button onClick={fetchData} className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2">
            <RotateCcw size={16} />
            Yenilə
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-gray-500 font-medium">Məlumatlar yüklənir...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold">{error}</div>
        ) : data && data.length > 0 ? (
          <div className="overflow-x-auto pb-4">
            <table className="w-full text-left text-sm whitespace-nowrap border-separate" style={{ borderSpacing: '0 12px' }}>
              <thead>
                <tr className="text-gray-400">
                  <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">SİFARİŞ NO / TARİX</th>
                  <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">ÇATDIRILMA ÜNVANI / MASA</th>
                  <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">MƏHSULLAR</th>
                  <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest text-center">STATUS</th>
                  <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest text-right">MƏBLƏĞ</th>
                  <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest text-right">İŞLƏMLƏR</th>
                </tr>
              </thead>
              <tbody>
                {data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((order: any) => (
                  <tr key={order.id} className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                    <td className="px-6 py-5 rounded-l-[24px] relative">
                      <div className="absolute inset-y-0 left-0 w-1 bg-transparent group-hover:bg-[#7A5CFF] transition-colors rounded-l-[24px]"></div>
                      <div className="font-black text-gray-900 text-base">#{order.id}</div>
                      <div className="text-xs font-bold text-gray-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-gray-600">
                      {order.table_number ? `Masa ${order.table_number}` : 'Paket Servis'}
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-gray-700 line-clamp-1 max-w-[200px] whitespace-normal">
                        {order.items?.map((i:any) => i.product_name_snapshot).join(', ') || 'Məhsul yoxdur'}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-1">
                        {order.items?.length || 0} növ məhsul
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-black rounded-lg shadow-sm border ${
                        ['preparing', 'new'].includes(order.status.toLowerCase()) ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        ['ready', 'delivering'].includes(order.status.toLowerCase()) ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 text-lg">
                      ₼{Number(order.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-5 text-right rounded-r-[24px]">
                      <button className="px-4 py-2 bg-white hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 font-bold text-sm rounded-xl border border-transparent hover:border-indigo-100 transition-colors shadow-sm">
                        Detallar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 opacity-80">
              <Truck className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sifariş Tapılmadı</h2>
            <p className="text-gray-500 font-medium">Hal-hazırda kuryer üçün aktiv sifariş yoxdur.</p>
          </div>
        )}
      </div>
    </div>
  );
}
