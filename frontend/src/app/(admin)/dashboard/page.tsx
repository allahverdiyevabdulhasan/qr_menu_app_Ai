"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/components/LanguageProvider';
import { Loader2, TrendingUp, Users, DollarSign, ShoppingCart, ArrowUpRight, ArrowDownRight, Clock, Activity, Store, Calendar, CheckCircle } from 'lucide-react';

interface OrderItem {
  id: number;
  product: number;
  quantity: number;
}

interface Order {
  id: number;
  status: string;
  total_amount: string;
  created_at: string;
  table_number?: string;
  items: OrderItem[];
}

interface RestaurantData {
  id: number;
  name: string;
  subscription_plan: string;
  subscription_end_date: string | null;
  total_revenue: number;
  total_saas_revenue_from_firm?: number;
  status: string;
}

interface SuperAdminStats {
  total_restaurants: number;
  saas_revenue: {
    total: number;
  };
  total_orders_global: number;
  restaurants: RestaurantData[];
}

// SUPER ADMIN COMPONENT
function SuperAdminDashboard({ user }: { user: any }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSuperAdminData = async () => {
      try {
        const response = await api.get('/restaurants/restaurant/superadmin_stats/');
        setStats(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuperAdminData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const topCards = [
    { id: 1, title: t('dashboard_super_total_restaurants'), value: stats?.total_restaurants || 0, icon: Store, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 2, title: t('dashboard_super_platform_revenue'), value: `₼${(stats?.saas_revenue?.total || 0).toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 3, title: t('dashboard_super_total_orders'), value: stats?.total_orders_global || 0, icon: ShoppingCart, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#121621] rounded-[24px] p-8 flex justify-between items-center relative overflow-hidden shadow-xl shadow-gray-900/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">
            {t('dashboard_super_welcome', { name: user?.first_name || '' })} 👑
          </h1>
          <p className="text-gray-400 font-medium text-sm">{t('dashboard_super_welcome_desc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topCards.map(stat => (
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

      <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-6 overflow-hidden mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
            <div className="w-10 h-10 bg-white rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.06)] flex items-center justify-center">
               <Store className="w-5 h-5 text-indigo-600" />
            </div>
            {t('dashboard_super_restaurants_list')}
          </h2>
        </div>
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left text-sm whitespace-nowrap border-separate" style={{ borderSpacing: '0 12px' }}>
            <thead>
              <tr className="text-gray-400">
                <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">{t('dashboard_super_col_restaurant')}</th>
                <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest text-center">{t('dashboard_super_col_status')}</th>
                <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">{t('dashboard_super_col_plan')}</th>
                <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">{t('dashboard_super_col_end_date')}</th>
                <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest text-right">{t('dashboard_super_col_revenue')}</th>
              </tr>
            </thead>
            <tbody>
              {stats?.restaurants.map((rest) => (
                <tr key={rest.id} className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                  <td className="px-6 py-5 rounded-l-[24px] font-black text-gray-900 relative">
                    <div className="absolute inset-y-0 left-0 w-1 bg-transparent group-hover:bg-[#7A5CFF] transition-colors rounded-l-[24px]"></div>
                    {rest.name}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border ${rest.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                      <CheckCircle className="w-3 h-3" />
                      {rest.status === 'active' ? t('dashboard_status_active') : t('dashboard_status_passive')}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest border border-indigo-100">
                      {rest.subscription_plan}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-gray-500 font-bold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {rest.subscription_end_date ? new Date(rest.subscription_end_date).toLocaleDateString() : t('dashboard_unlimited')}
                  </td>
                  <td className="px-6 py-5 text-right font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 text-lg rounded-r-[24px]">₼{(rest.total_saas_revenue_from_firm || 0).toFixed(2)}</td>
                </tr>
              ))}
              {stats?.restaurants.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500 font-bold">Heç bir restoran tapılmadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// NORMAL RESTAURANT DASHBOARD
function RestaurantDashboard({ user }: { user: any }) {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/orders/order/');
      setOrders(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const today = new Date();
  const todayStr = today.toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const todaysOrders = orders.filter(o => new Date(o.created_at).toDateString() === todayStr);
  const yesterdaysOrders = orders.filter(o => new Date(o.created_at).toDateString() === yesterdayStr);

  const totalRevenue = todaysOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const yesterdayRevenue = yesterdaysOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  const revenueChangeNum = yesterdayRevenue ? ((totalRevenue - yesterdayRevenue) / yesterdayRevenue * 100) : (totalRevenue > 0 ? 100 : 0);
  const revenueChange = `${revenueChangeNum >= 0 ? '+' : ''}${revenueChangeNum.toFixed(1)}%`;

  const ordersChangeNum = yesterdaysOrders.length ? ((todaysOrders.length - yesterdaysOrders.length) / yesterdaysOrders.length * 100) : (todaysOrders.length > 0 ? 100 : 0);
  const ordersChange = `${ordersChangeNum >= 0 ? '+' : ''}${ordersChangeNum.toFixed(1)}%`;

  const pendingOrdersCount = orders.filter(o => ['pending', 'preparing', 'new', 'accepted'].includes(o.status?.toLowerCase())).length;
  
  const cancelledToday = todaysOrders.filter(o => o.status?.toLowerCase() === 'cancelled').length;
  const cancellationRate = todaysOrders.length ? ((cancelledToday / todaysOrders.length) * 100).toFixed(1) : '0.0';

  const stats = [
    { id: 1, title: t('dashboard_rest_today_sales'), value: `₼${totalRevenue.toFixed(2)}`, change: revenueChange, isUp: revenueChangeNum >= 0, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 2, title: t('dashboard_rest_orders_today'), value: todaysOrders.length.toString(), change: ordersChange, isUp: ordersChangeNum >= 0, icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 3, title: t('dashboard_rest_active_kitchen'), value: pendingOrdersCount.toString(), change: t('dashboard_rest_preparing'), isUp: true, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 4, title: t('dashboard_rest_cancel_rate'), value: `%${cancellationRate}`, change: t('dashboard_rest_today'), isUp: false, icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const recentOrders = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#121621] rounded-[24px] p-8 flex justify-between items-center relative overflow-hidden shadow-xl shadow-gray-900/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">
            {t('dashboard_rest_welcome', { name: user?.first_name || 'Admin' })} 👋
          </h1>
          <p className="text-gray-400 font-medium text-sm">{t('dashboard_rest_welcome_desc')}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(stat => (
              <div key={stat.id} className="bg-white p-6 rounded-[20px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-md ${stat.isUp ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                    {stat.isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-gray-500 text-sm font-semibold mb-1">{stat.title}</h3>
                <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Side: Recent Orders & Best Sellers */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Son Siparişler Table */}
              <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.06)] flex items-center justify-center">
                       <ShoppingCart className="w-5 h-5 text-indigo-600" />
                    </div>
                    {t('dashboard_rest_recent_orders')}
                  </h2>
                  <button className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-bold rounded-xl transition-colors shadow-sm">
                    {t('dashboard_rest_view_all')}
                  </button>
                </div>

                <div className="overflow-x-auto pb-4">
                  <table className="w-full text-left text-sm whitespace-nowrap border-separate" style={{ borderSpacing: '0 12px' }}>
                    <thead>
                      <tr className="text-gray-400">
                        <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">#</th>
                        <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">{t('dashboard_rest_col_table')}</th>
                        <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">{t('dashboard_rest_col_status')}</th>
                        <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest text-right">{t('dashboard_rest_col_total')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 font-bold text-gray-500">{t('dashboard_rest_no_orders')}</td>
                        </tr>
                      ) : (
                        recentOrders.map(order => (
                          <tr key={order.id} className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                            <td className="px-6 py-5 rounded-l-[24px] relative">
                              <div className="absolute inset-y-0 left-0 w-1 bg-transparent group-hover:bg-[#7A5CFF] transition-colors rounded-l-[24px]"></div>
                              <div className="font-black text-gray-900 text-base">#{order.id}</div>
                              <div className="text-xs font-bold text-gray-400 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3"/> {formatTime(order.created_at)}</div>
                            </td>
                            <td className="px-6 py-5 font-black text-gray-600">
                              {order.table_number ? `${t('dashboard_rest_col_table')} ${order.table_number}` : '—'}
                            </td>
                            <td className="px-6 py-5">
                              <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] uppercase tracking-widest font-black rounded-lg shadow-sm">
                                {order.status.toLowerCase() === 'new' || order.status.toLowerCase() === 'pending' ? t('dashboard_rest_status_complete') : order.status}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 text-lg rounded-r-[24px]">
                              {Number(order.total_amount).toFixed(2).replace('.', ',')} ₼
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* En Çok Satanlar */}
              <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-xl">🏆</span> {t('dashboard_rest_best_sellers')}
                  </h2>
                  <span className="text-sm font-semibold text-gray-400">{t('dashboard_rest_last_30_days')}</span>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                   <Activity className="w-12 h-12 mb-3 opacity-20" />
                   <p className="font-medium text-sm">{t('dashboard_rest_gathering_data')}</p>
                </div>
              </div>

            </div>

            {/* Right Side: AI Predictions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-xl">💡</span> {t('dashboard_rest_ai_insights')}
                  </h2>
                  <span className="px-2 py-1 bg-indigo-500 text-white text-[10px] font-bold rounded-full">
                    {t('dashboard_rest_ai')}
                  </span>
                </div>

                <div className="space-y-6 flex-1">
                  {/* Item 1 */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">🚀</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{t('dashboard_rest_ai_growth_title')}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {t('dashboard_rest_ai_growth_desc')}
                      </p>
                    </div>
                  </div>
                  <div className="h-px bg-gray-50 w-full"></div>

                  {/* Item 2 */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">⚡</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{t('dashboard_rest_ai_kitchen_title')}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {t('dashboard_rest_ai_kitchen_desc')}
                      </p>
                    </div>
                  </div>
                  <div className="h-px bg-gray-50 w-full"></div>

                  {/* Item 3 */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">🎯</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{t('dashboard_rest_ai_rush_title')}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {t('dashboard_rest_ai_rush_desc')}
                      </p>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-8 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-[14px] transition-colors flex justify-center items-center gap-2">
                  {t('dashboard_rest_ai_view_all')} <span>→</span>
                </button>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}

export default function DashboardWrapper() {
  const user = useAuthStore(state => state.user);
  
  if (user?.role === 'SUPER_ADMIN' || user?.is_superuser) {
    return <SuperAdminDashboard user={user} />;
  }
  
  return <RestaurantDashboard user={user} />;
}
