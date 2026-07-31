"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2, PieChart, Search, TrendingUp, DollarSign, ShoppingCart, Activity, Calendar, ArrowUpRight, ArrowDownRight, Clock, Box } from 'lucide-react';
import { useTranslation } from '@/components/LanguageProvider';

export default function DashboardReportsSalesPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/orders/order/');
      setData(response.data);
      setError('');
    } catch (err: any) {
      setError(t('sales_error_fetch'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate Metrics
  const totalOrders = data.length;
  const totalRevenue = data.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const today = new Date().toDateString();
  const todaysRevenue = data.filter(o => new Date(o.created_at).toDateString() === today)
                            .reduce((sum, o) => sum + Number(o.total_amount), 0);

  // Best selling products logic
  const productSales: Record<string, { quantity: number, revenue: number }> = {};
  data.forEach(order => {
    order.items?.forEach((item: any) => {
      const name = item.product_name_snapshot || t('sales_unknown_product', { defaultValue: 'Bilinməyən Məhsul' });
      const qty = Number(item.quantity) || 1;
      const price = Number(item.total_price) || 0;
      if (!productSales[name]) productSales[name] = { quantity: 0, revenue: 0 };
      productSales[name].quantity += qty;
      productSales[name].revenue += price;
    });
  });

  const bestSellers = Object.entries(productSales)
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, 5);

  const stats = [
    { id: 1, title: t('sales_today'), value: `₼${todaysRevenue.toFixed(2)}`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 2, title: t('sales_total_revenue'), value: `₼${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 3, title: t('sales_order_count'), value: totalOrders, icon: ShoppingCart, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 4, title: t('sales_avg_order'), value: `₼${avgOrderValue.toFixed(2)}`, icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm">
            <PieChart className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('sales_reports_title')}</h1>
            <p className="text-gray-500 font-medium text-sm">{t('sales_reports_desc')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('sales_search')} 
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <button onClick={fetchData} className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-colors">
            {t('sales_refresh')}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold">{error}</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(stat => (
              <div key={stat.id} className="bg-white p-6 rounded-[20px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${stat.bg}`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm font-semibold mb-1">{stat.title}</h3>
                  <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sales Chart Area */}
            <div className="lg:col-span-2 bg-white rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-6 flex flex-col items-center justify-center text-gray-400 min-h-[350px]">
               <Activity className="w-16 h-16 mb-4 opacity-20" />
               <p className="font-bold">{t('sales_charts_soon')}</p>
               <p className="text-sm">{t('sales_charts_desc')}</p>
            </div>

            {/* Top Selling Products */}
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-xl">🏆</span> {t('sales_best_sellers')}
                </h2>
              </div>
              <div className="space-y-4">
                {bestSellers.length === 0 ? (
                  <p className="text-sm text-gray-500">{t('sales_no_data')}</p>
                ) : (
                  bestSellers.map(([name, stats], index) => (
                    <div key={name} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-xs">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">{name}</p>
                          <p className="text-xs text-gray-500">{stats.quantity} {t('sales_item_sold')}</p>
                        </div>
                      </div>
                      <div className="font-black text-sm text-gray-900">
                        ₼{stats.revenue.toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Detailed Orders Table */}
          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-6 flex flex-col mt-8">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3 tracking-tight">
               <div className="w-10 h-10 bg-white rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.06)] flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-indigo-600" />
               </div>
               {t('sales_all_orders')}
            </h2>
            <div className="overflow-x-auto pb-4">
              <table className="w-full text-left text-sm whitespace-nowrap border-separate" style={{ borderSpacing: '0 12px' }}>
                <thead>
                  <tr className="text-gray-400">
                    <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">{t('sales_col_date')}</th>
                    <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">{t('sales_col_details')}</th>
                    <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">{t('sales_col_status')}</th>
                    <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest text-right">{t('sales_col_amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 font-bold text-gray-500">{t('sales_no_orders')}</td>
                    </tr>
                  ) : (
                    data.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(order => (
                      <tr key={order.id} className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                        <td className="px-6 py-5 rounded-l-[24px] relative">
                          <div className="absolute inset-y-0 left-0 w-1 bg-transparent group-hover:bg-[#7A5CFF] transition-colors rounded-l-[24px]"></div>
                          <div className="font-black text-gray-900 text-base">#{order.id}</div>
                          <div className="text-xs font-bold text-gray-400 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(order.created_at).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-bold text-gray-700 line-clamp-1 max-w-[250px] whitespace-normal">
                            {order.items?.map((i:any) => i.product_name_snapshot).join(', ') || t('sales_no_product', { defaultValue: 'Məhsul yoxdur' })}
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-1">
                            {order.items?.length || 0} {t('sales_product_count')}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-black rounded-lg shadow-sm border ${
                            ['preparing', 'accepted', 'new'].includes(order.status.toLowerCase()) ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 text-lg rounded-r-[24px]">
                          ₼{Number(order.total_amount).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
