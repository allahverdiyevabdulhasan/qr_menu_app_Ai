"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2, TrendingUp, Users, DollarSign, Utensils, Star, Crown } from 'lucide-react';

interface TableStat {
  id: number;
  table_number: string;
  total_revenue: number;
  order_count: number;
  avg_order_value: number;
}

export default function TableAnalyticsPage() {
  const [stats, setStats] = useState<TableStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // In a real application, a backend endpoint like /api/analytics/tables/ would group and sum this data.
      // Here, we'll fetch orders and compute it on the frontend for demonstration.
      const response = await api.get('/orders/order/');
      const orders = response.data.filter((o: any) => o.status === 'COMPLETED');
      
      const tableMap: { [key: string]: TableStat } = {};
      
      orders.forEach((order: any) => {
        const tNum = order.table_number || 'Paket/Gəl-Al';
        if (!tableMap[tNum]) {
          tableMap[tNum] = {
            id: Math.random(),
            table_number: tNum.toString(),
            total_revenue: 0,
            order_count: 0,
            avg_order_value: 0
          };
        }
        tableMap[tNum].total_revenue += parseFloat(order.total_amount || 0);
        tableMap[tNum].order_count += 1;
      });

      const processedStats = Object.values(tableMap).map(stat => ({
        ...stat,
        avg_order_value: stat.total_revenue / stat.order_count
      })).sort((a, b) => b.total_revenue - a.total_revenue);

      setStats(processedStats);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalRevenue = stats.reduce((sum, stat) => sum + stat.total_revenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-fuchsia-50 rounded-2xl flex items-center justify-center border border-fuchsia-100 shadow-sm">
            <Utensils className="w-6 h-6 text-fuchsia-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Masa & Müştəri Analitikası</h1>
            <p className="text-gray-500 font-medium text-sm mt-0.5">Ən çox gəlir gətirən masalar və müştəri davranışları</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 bg-white rounded-[24px] border border-gray-100 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-fuchsia-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Top Masalar (Gəlirə Görə)
              </h2>
              
              <div className="space-y-4">
                {stats.slice(0, 5).map((stat, index) => (
                  <div key={stat.table_number} className="flex items-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm mr-4 shrink-0
                      ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-200 text-gray-700' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}
                    `}>
                      #{index + 1}
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="font-bold text-gray-900 text-lg">Masa {stat.table_number}</h3>
                      <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3"/> {stat.order_count} Sifariş</span>
                        <span className="flex items-center gap-1"><Star className="w-3 h-3"/> Orta hesabla ₺{stat.avg_order_value.toFixed(0)}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 mb-0.5">Ümumi Gəlir</p>
                      <p className="text-xl font-black text-fuchsia-600">₺{stat.total_revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                {stats.length === 0 && (
                  <div className="text-center py-10 text-gray-500 font-medium">Heç bir sifariş tapılmadı.</div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-fuchsia-600 to-purple-700 rounded-[24px] p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10">
                <TrendingUp className="w-32 h-32" />
              </div>
              <p className="font-bold text-fuchsia-100 mb-1 relative z-10">Ümumi Sifariş Gəliri</p>
              <h3 className="text-4xl font-black mb-6 relative z-10">₺{totalRevenue.toFixed(2)}</h3>
              
              <div className="space-y-3 relative z-10">
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm flex justify-between items-center">
                  <span className="font-medium text-sm text-fuchsia-100">Cəmi Sifariş</span>
                  <span className="font-bold">{stats.reduce((s, t) => s + t.order_count, 0)}</span>
                </div>
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm flex justify-between items-center">
                  <span className="font-medium text-sm text-fuchsia-100">Aktiv Masa</span>
                  <span className="font-bold">{stats.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                Daha Çox Satış Üçün İpucu
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Ən çox gəlir gətirən masalarınızda (Məsələn: Masa {stats[0]?.table_number || '?'}) QR sifarişlərdə Sadiqlik Proqramını (Loyalty) aktivləşdirin. Bu masalardakı müştərilərə xüsusi endirimlər təqdim etmək sifarişlərin sayını 30% artıra bilər.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
