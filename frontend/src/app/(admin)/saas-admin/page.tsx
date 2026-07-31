"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Shield, Building2, DollarSign, AlertCircle, Key, Activity, Clock, Loader2, PlayCircle, Plus, Power, Percent, Settings } from 'lucide-react';
import Cookies from 'js-cookie';
import { useTranslation } from '@/components/LanguageProvider';

interface RestaurantStats {
  id: number;
  name: string;
  owner_email: string;
  subscription_plan: string;
  subscription_end_date: string | null;
  subscription_status: string;
  custom_discount: number;
  payment_amount: number;
  payment_status: string;
  total_saas_revenue_from_firm: number;
  total_food_revenue: number;
  total_orders: number;
  status: string;
  settings?: any;
  custom_domain?: string;
}

interface SuperAdminStats {
  total_restaurants: number;
  total_orders_global: number;
  saas_revenue: {
    total: number;
    last_1m: number;
    last_6m: number;
    last_1y: number;
  };
  plan_distribution: {
    PRO: number;
    FREE: number;
    TRIAL: number;
    INACTIVE: number;
  };
  restaurants: RestaurantStats[];
}

export default function SaaSAdminPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Subscription Modal State
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantStats | null>(null);
  const [subForm, setSubForm] = useState({ plan: 'Pro', days: '365', exactDate: '', discount: '0', paymentAmount: '0', paymentStatus: 'PENDING', custom_domain: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Instant Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', industry: 'restaurant' });
  const [isCreating, setIsCreating] = useState(false);

  // Modules Modal State
  const [isModulesModalOpen, setIsModulesModalOpen] = useState(false);
  const [selectedRestSettings, setSelectedRestSettings] = useState<any>(null);

  // Sorting State
  const [sortBy, setSortBy] = useState<'ciro_desc' | 'orders_desc' | 'name_asc' | 'newest'>('newest');

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/restaurants/restaurant/superadmin_stats/');
      setStats(response.data);
    } catch (err) {
      console.error(err);
      alert("SaaS verileri alınamadı. Super Admin yetkiniz olmayabilir.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleImpersonate = async (id: number) => {
    try {
      if (!confirm("Bu restoranın paneline giriş yapmak istediğinize emin misiniz?")) return;
      const response = await api.post(`/restaurants/restaurant/${id}/impersonate/`);
      
      // Save current superadmin tokens and user data
      const currentAccess = Cookies.get('access_token');
      const currentRefresh = Cookies.get('refresh_token');
      const currentUser = localStorage.getItem('user');
      
      if (currentAccess) Cookies.set('superadmin_access_token', currentAccess, { path: '/' });
      if (currentRefresh) Cookies.set('superadmin_refresh_token', currentRefresh, { path: '/' });
      if (currentUser) localStorage.setItem('superadmin_user', currentUser);

      Cookies.set('access_token', response.data.access, { path: '/' });
      Cookies.set('refresh_token', response.data.refresh, { path: '/' });
      
      if (response.data.impersonated_restaurant_slug) {
        localStorage.setItem('impersonated_restaurant_slug', response.data.impersonated_restaurant_slug);
      }
      
      // Axios default header'ı anında güncelleyelim ki araya giren istekler eski token ile gitmesin
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      
      // Fetch the impersonated user's data and update the store
      const meResponse = await api.get('/accounts/user/me/');
      localStorage.setItem('user', JSON.stringify(meResponse.data));
      
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error(err);
      alert(`Giriş başarısız oldu: ${err.response?.data?.detail || err.response?.data?.error || err.message}`);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      const action = currentStatus === 'active' ? "Dondurmak" : "Aktifleştirmek";
      if (!confirm(`Bu restoranı ${action} istediğinize emin misiniz?`)) return;
      
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      if (stats) {
        setStats({
          ...stats,
          restaurants: stats.restaurants.map(r => r.id === id ? { ...r, status: newStatus } : r)
        });
      }

      await api.post(`/restaurants/restaurant/${id}/toggle_status/`);
      fetchStats();
    } catch (err) {
      console.error(err);
      alert("Durum güncellenirken hata oluştu.");
      fetchStats();
    }
  };

  const handleInstantCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await api.post('/restaurants/restaurant/instant_create/', createForm);
      setIsCreateModalOpen(false);
      setCreateForm({ name: '', email: '', industry: 'restaurant' });
      fetchStats();
      alert("Restoran başarıyla oluşturuldu ve 7 Günlük Deneme başlatıldı.");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Oluşturulurken hata oluştu.");
    } finally {
      setIsCreating(false);
    }
  };

  const openSubModal = (rest: RestaurantStats) => {
    setSelectedRestaurant(rest);
    let initialDate = '';
    if (rest.subscription_end_date) {
      initialDate = new Date(rest.subscription_end_date).toISOString().split('T')[0];
    } else {
      const d = new Date();
      d.setDate(d.getDate() + 365);
      initialDate = d.toISOString().split('T')[0];
    }
    
    setSubForm({ 
      plan: rest.subscription_plan || 'Pro', 
      days: '365', 
      exactDate: initialDate,
      discount: rest.custom_discount.toString(), 
      paymentAmount: rest.payment_amount?.toString() || '0', 
      paymentStatus: rest.payment_status || 'PENDING',
      custom_domain: rest.custom_domain || ''
    });
    setIsSubModalOpen(true);
  };

  const getFutureDate = (days: number, baseDateStr?: string | null) => {
    const baseDate = baseDateStr ? new Date(baseDateStr) : new Date();
    // If base date is in the past, use today
    if (baseDate.getTime() < new Date().getTime()) {
      baseDate.setTime(new Date().getTime());
    }
    baseDate.setDate(baseDate.getDate() + days);
    return baseDate.toISOString().split('T')[0];
  };

  const handleSubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) return;
    
    setIsSubmitting(true);
    try {
      await api.post(`/restaurants/restaurant/${selectedRestaurant.id}/update_subscription/`, {
        subscription_plan: subForm.plan,
        days_to_add: parseInt(subForm.days) || null,
        exact_end_date: subForm.exactDate,
        custom_discount: parseFloat(subForm.discount),
        payment_amount: parseFloat(subForm.paymentAmount || '0'),
        payment_status: subForm.paymentStatus,
        custom_domain: subForm.custom_domain
      });
      setIsSubModalOpen(false);
      fetchStats();
    } catch (err) {
      console.error(err);
      alert("Abonelik güncellenirken hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModulesModal = (rest: RestaurantStats) => {
    setSelectedRestaurant(rest);
    setSelectedRestSettings(rest.settings);
    setIsModulesModalOpen(true);
  };

  const handleModuleToggle = async (field: string) => {
    if (!selectedRestSettings) return;
    try {
      const newSettings = { ...selectedRestSettings, [field]: !selectedRestSettings[field] };
      setSelectedRestSettings(newSettings);
      await api.patch(`/restaurants/restaurantsettings/${selectedRestSettings.id}/`, { [field]: newSettings[field] });
      fetchStats();
    } catch (err) {
      console.error('Failed to toggle module', err);
      alert('Ayar güncellenirken hata oluştu.');
    }
  };

  const calculateDaysLeft = (endDateStr: string | null) => {
    if (!endDateStr) return 0;
    const end = new Date(endDateStr);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDaysLeft = (days: number) => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      const remainingDays = days % 365;
      if (remainingDays === 0) return `${years} Yıl`;
      
      const months = Math.floor(remainingDays / 30);
      const daysLeft = remainingDays % 30;
      
      let res = `${years} Yıl`;
      if (months > 0) res += ` ${months} Ay`;
      if (daysLeft > 0) res += ` ${daysLeft} Gün`;
      return res;
    } else if (days >= 30) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      if (remainingDays === 0) return `${months} Ay`;
      return `${months} Ay ${remainingDays} Gün`;
    }
    return `${days} Gün`;
  };

  if (isLoading && !stats) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* SaaS Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-[24px] p-8 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{t('saas_admin_title')}</h1>
          </div>
          <p className="text-indigo-100 font-medium max-w-xl text-sm md:text-base leading-relaxed">
            {t('saas_admin_desc')}
          </p>
        </div>
        <div className="relative z-10">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-white text-indigo-900 rounded-xl font-black shadow-lg hover:bg-indigo-50 hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Yeni Restoran Ekle
          </button>
        </div>
      </div>

      {/* Advanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-1">{t('saas_stats_restaurants')}</p>
            <h2 className="text-4xl font-black text-gray-900">{stats?.total_restaurants || 0}</h2>
          </div>
        </div>
        
        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col justify-between md:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="flex gap-2">
              <div className="px-3 py-1 bg-gray-50 rounded-lg border border-gray-100 text-center">
                <p className="text-[10px] text-gray-500 font-bold uppercase">1 Ay</p>
                <p className="text-sm font-black text-emerald-600">₼{stats?.saas_revenue?.last_1m?.toFixed(2)}</p>
              </div>
              <div className="px-3 py-1 bg-gray-50 rounded-lg border border-gray-100 text-center">
                <p className="text-[10px] text-gray-500 font-bold uppercase">6 Ay</p>
                <p className="text-sm font-black text-emerald-600">₼{stats?.saas_revenue?.last_6m?.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-1">{t('saas_stats_revenue')}</p>
            <h2 className="text-4xl font-black text-gray-900">₼{stats?.saas_revenue?.total?.toFixed(2) || '0.00'}</h2>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <p className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-3">Plan Dağılımı</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-700">Pro</span>
              <span className="text-sm font-black text-indigo-600">{stats?.plan_distribution?.PRO || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-700">Free</span>
              <span className="text-sm font-black text-emerald-600">{stats?.plan_distribution?.FREE || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-700">Trial (Deneme)</span>
              <span className="text-sm font-black text-orange-500">{stats?.plan_distribution?.TRIAL || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurants Table */}
      <div className="flex items-center justify-between mb-6 px-2 mt-8">
        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-indigo-600" />
          Kayıtlı Firmalar
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sırala:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">En Yeniler</option>
            <option value="ciro_desc">Ciro (Yüksekten Düşüğe)</option>
            <option value="orders_desc">Sipariş (Çoktan Aza)</option>
            <option value="name_asc">İsim (A'dan Z'ye)</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto pb-10">
        <table className="w-full text-left text-sm whitespace-nowrap border-separate" style={{ borderSpacing: '0 12px' }}>
          <thead>
            <tr className="text-gray-400">
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">{t('saas_table_restaurant')}</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">{t('saas_table_plan')}</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">{t('saas_table_performance')}</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest text-right">{t('saas_table_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {stats?.restaurants
              .sort((a, b) => {
                if (sortBy === 'ciro_desc') return b.total_food_revenue - a.total_food_revenue;
                if (sortBy === 'orders_desc') return b.total_orders - a.total_orders;
                if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
                return b.id - a.id;
              })
              .map((rest, index) => {
              const daysLeft = calculateDaysLeft(rest.subscription_end_date);
              const isExpired = daysLeft <= 0;
              const isInactive = rest.status === 'inactive';
              const isTrial = rest.subscription_status === 'TRIAL';
              const isTopPerformer = sortBy === 'ciro_desc' && index === 0 && rest.total_food_revenue > 0;
              
              return (
                <tr key={rest.id} className={`bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group ${isInactive ? 'opacity-60 grayscale' : ''}`}>
                  <td className="px-6 py-5 rounded-l-[24px] relative">
                    <div className={`absolute inset-y-0 left-0 w-1 bg-transparent transition-colors rounded-l-[24px] ${isInactive ? '' : 'group-hover:bg-indigo-500'}`}></div>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm border
                        ${isTrial ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                        {rest.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-gray-900 text-base flex items-center gap-2">
                          {rest.name} 
                          {isInactive && <span className="text-xs text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 uppercase tracking-widest">Donduruldu</span>}
                          {isTopPerformer && <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1 uppercase font-black"><Activity className="w-3 h-3" /> Lider</span>}
                        </span>
                        <span className="text-sm text-gray-500 font-bold">{rest.owner_email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black w-fit uppercase tracking-widest shadow-sm border
                          ${isTrial ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}
                        `}>
                          {rest.subscription_plan || 'FREE'}
                        </span>
                        {rest.custom_discount > 0 && (
                          <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-600 font-black px-2 py-1.5 rounded-lg uppercase tracking-widest shadow-sm">-%{rest.custom_discount} İND.</span>
                        )}
                        {rest.payment_amount > 0 && (
                          <span className={`text-[10px] font-black px-2 py-1.5 rounded-lg uppercase tracking-widest shadow-sm border ${rest.payment_status === 'PAID' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                            {rest.payment_status === 'PAID' ? 'ÖDENDİ' : 'ÖDENECEK'}: ₼{rest.payment_amount}
                          </span>
                        )}
                      </div>
                      {rest.subscription_end_date ? (
                          <div className={`flex items-center gap-1.5 text-xs font-bold ${isExpired ? 'text-rose-600' : (isTrial ? 'text-orange-500' : 'text-emerald-600')}`}>
                            <Clock className="w-4 h-4" />
                            {isExpired ? 'Süresi Doldu' : `${formatDaysLeft(daysLeft)} Kaldı ${isTrial ? '(Deneme)' : ''}`}
                          </div>
                      ) : (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                            Süre Tanımsız
                          </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">SaaS: <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 text-sm">₼{rest.total_saas_revenue_from_firm.toFixed(2)}</span></p>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Ciro: <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 text-sm">₼{rest.total_food_revenue.toFixed(2)}</span></p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{rest.total_orders} Sipariş</p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right rounded-r-[24px]">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleToggleStatus(rest.id, rest.status)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-sm border
                          ${isInactive 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700' 
                            : 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100 hover:text-rose-700'}`}
                        title={isInactive ? 'Aktifleştir' : 'Dondur'}
                      >
                        <Power size={18} />
                      </button>
                      <button 
                        onClick={() => openSubModal(rest)}
                        className="px-4 h-10 bg-white border border-transparent hover:border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                      >
                        <PlayCircle size={18} />
                        {t('saas_action_manage_plan')}
                      </button>

                      <button 
                        onClick={() => handleImpersonate(rest.id)}
                        className="px-4 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
                      >
                        <Key size={18} />
                        {t('saas_action_login')}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {stats?.restaurants.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center bg-white rounded-[24px] shadow-sm border border-gray-50 text-gray-500 font-bold">
                  {t('saas_no_restaurant')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Instant Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-gray-900">Yeni Restoran Oluştur</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Anında 7 günlük deneme (Trial) ile başlat.</p>
              </div>
            </div>
            
            <form onSubmit={handleInstantCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Restoran/Firma Adı</label>
                <input 
                  required
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                  placeholder="Örn: NeyMenu Center"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Sahibinin E-posta Adresi</label>
                <input 
                  required
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                  placeholder="owner@firma.com"
                />
                <p className="text-xs text-gray-400 mt-2">Bu e-posta ile giriş yapılacak. (Şifre: password123)</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Sektör / Endüstri</label>
                <select
                  value={createForm.industry}
                  onChange={(e) => setCreateForm({...createForm, industry: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                >
                  <option value="restaurant">Restoran & Kafe</option>
                  <option value="hotel">Otel / Konaklama</option>
                  <option value="retail">Mağaza / Perakende</option>
                  <option value="beauty">Güzellik Salonu / Kuaför</option>
                  <option value="service">Genel Hizmet / Diğer</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  disabled={isCreating}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
                >
                  {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Oluştur & Başlat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {isSubModalOpen && selectedRestaurant && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-900">Abonelik & Fiyatlandırma</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">{selectedRestaurant.name} için işlem yapıyorsunuz</p>
            </div>
            
            <form onSubmit={handleSubSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Özel Domain (Custom Domain)</label>
                <input 
                  type="text"
                  value={subForm.custom_domain}
                  onChange={(e) => setSubForm({...subForm, custom_domain: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                  placeholder="örn: menum.com"
                />
                <p className="text-xs text-gray-400 mt-1">Yalnızca Super Admin değiştirebilir.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Abonelik Paketi</label>
                  <select 
                    value={subForm.plan}
                    onChange={(e) => setSubForm({...subForm, plan: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                  >
                    <option value="Free">Free</option>
                    <option value="Basic">Basic</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Özel İndirim (%)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      value={subForm.discount}
                      onChange={(e) => setSubForm({...subForm, discount: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium pl-10"
                    />
                    <Percent className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Ödenecek Tutar (₼)</label>
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    value={subForm.paymentAmount}
                    onChange={(e) => setSubForm({...subForm, paymentAmount: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                  />
                  {parseFloat(subForm.paymentAmount || '0') > 0 && parseInt(subForm.days) >= 30 && (
                    <div className="mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 flex items-center justify-between">
                      <span>Aylık Ortalama:</span>
                      <span className="font-black">₼{(parseFloat(subForm.paymentAmount) / (parseInt(subForm.days) / 30)).toFixed(2)} / ay</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Ödeme Durumu</label>
                  <select 
                    value={subForm.paymentStatus}
                    onChange={(e) => setSubForm({...subForm, paymentStatus: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                  >
                    <option value="PENDING">Ödenecek (Bekliyor)</option>
                    <option value="PAID">Ödendi (Tahsil Edildi)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Tanımlanacak Süre (Bugünden İtibaren)</label>
                <div className="flex gap-3">
                  <div className="relative w-1/2">
                    <input 
                      type="number"
                      min="1"
                      placeholder="Örn: 365"
                      value={subForm.days}
                      onChange={(e) => {
                        const d = e.target.value;
                        setSubForm({...subForm, days: d, exactDate: d ? getFutureDate(parseInt(d), null) : ''});
                      }}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium pr-12"
                    />
                    <span className="absolute right-4 top-3.5 text-sm font-bold text-gray-400">Gün</span>
                  </div>
                  <div className="w-1/2">
                    <input 
                      type="date"
                      value={subForm.exactDate}
                      onChange={(e) => setSubForm({...subForm, exactDate: e.target.value, days: ''})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-gray-600"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setSubForm({...subForm, exactDate: getFutureDate(30, null), days: '30'})} className="flex-1 text-xs bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors border border-gray-200 shadow-sm">1 Ay Ver</button>
                  <button type="button" onClick={() => setSubForm({...subForm, exactDate: getFutureDate(180, null), days: '180'})} className="flex-1 text-xs bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors border border-gray-200 shadow-sm">6 Ay Ver</button>
                  <button type="button" onClick={() => setSubForm({...subForm, exactDate: getFutureDate(365, null), days: '365'})} className="flex-1 text-xs bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors border border-gray-200 shadow-sm">1 Yıl Ver</button>
                </div>
              </div>
              
              <div className="bg-indigo-50 text-indigo-700 p-4 rounded-xl text-sm font-medium border border-indigo-100 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <p>Girdiğiniz gün sayısı <strong>bugünden itibaren</strong> hesaplanır. Mevcut hatalı süreleri sıfırlayıp net bir bitiş tarihi belirlemek için kullanılır.</p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsSubModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Güncelle ve Aktifleştir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



    </div>
  );
}
