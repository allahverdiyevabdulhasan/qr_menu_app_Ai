"use client";
import React, { useState, useEffect } from "react";
import { LayoutTemplate, Loader2, Save, ShieldAlert } from "lucide-react";
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/components/LanguageProvider';

export default function ModulesSettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/restaurants/restaurant/');
      if (response.data.length > 0) {
        setData(response.data[0]); // Get first restaurant
      }
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

  const handleToggle = async (field: string) => {
    if (!data || !data.settings) return;
    try {
      const newSettings = { ...data.settings, [field]: !data.settings[field] };
      setData({ ...data, settings: newSettings });
      await api.patch(`/restaurants/restaurantsettings/${data.settings.id}/`, { [field]: newSettings[field] });
      alert('Modül ayarı güncellendi! Değişikliklerin menüye yansıması için sayfayı yenileyin.');
    } catch (err) {
      console.error('Failed to toggle module', err);
      alert('Ayar güncellenirken hata oluştu.');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500 flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!data) return <div className="p-8 text-center text-red-500">Restoran bilgisi bulunamadı.</div>;

  const modules = [
    { id: 'enable_overview', label: t('sidebar_general_overview'), desc: t('module_overview') },
    { id: 'enable_reports', label: t('sidebar_sales_reports'), desc: t('module_reports') },
    { id: 'enable_orders', label: t('sidebar_orders'), desc: t('module_orders') },
    { id: 'enable_pos', label: t('sidebar_new_order'), desc: t('module_pos') },
    { id: 'enable_kds', label: t('sidebar_kds'), desc: t('module_kds') },
    { id: 'enable_waiter', label: t('sidebar_waiter_panel'), desc: t('module_waiter') },
    { id: 'enable_cashier', label: t('sidebar_cashier_panel'), desc: t('module_cashier') },
    { id: 'enable_courier', label: t('sidebar_courier_panel'), desc: t('module_courier') },
    { id: 'enable_reservations', label: t('sidebar_tables'), desc: t('module_reservations') },
    { id: 'enable_finance_z_reports', label: t('sidebar_z_reports'), desc: t('module_finance_z_reports') },
    { id: 'enable_finance_refunds', label: t('sidebar_refunds'), desc: t('module_finance_refunds') },
    { id: 'enable_finance_expenses', label: t('sidebar_expenses'), desc: t('module_finance_expenses') },
    { id: 'enable_hr_shifts', label: t('sidebar_shifts'), desc: t('module_hr_shifts') },
    { id: 'enable_hr_payroll', label: t('sidebar_payroll'), desc: t('module_hr_payroll') },
    { id: 'enable_hr_roles', label: t('sidebar_roles'), desc: t('module_hr_roles') },
    { id: 'enable_menu_items', label: t('sidebar_menu_items'), desc: t('module_menu_items') },
    { id: 'enable_inventory_ingredients', label: t('sidebar_ingredients'), desc: t('module_inventory_ingredients') },
    { id: 'enable_inventory_stock', label: t('sidebar_stock_inventory'), desc: t('module_inventory_stock') },
    { id: 'enable_inventory_predictions', label: t('sidebar_stock_predictions'), desc: t('module_inventory_predictions') },
    { id: 'enable_ai_reports', label: t('sidebar_ai_reports'), desc: t('module_ai_reports') },
    { id: 'enable_ai_assistant', label: t('sidebar_ai_assistant'), desc: t('module_ai_assistant') },
    { id: 'enable_marketing_campaigns', label: t('sidebar_campaigns'), desc: t('module_marketing_campaigns') },
    { id: 'enable_marketing_loyalty', label: t('sidebar_loyalty'), desc: t('module_marketing_loyalty') }
  ];

  if (!user?.is_super_admin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Yetkisiz Erişim</h2>
        <p className="text-gray-500 max-w-md mx-auto text-lg leading-relaxed">
          Modülleri aktifleştirme ve kapatma yetkisi yalnızca Sistem Yöneticisine aittir. Lütfen taleplerinizi yöneticiye iletin.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center mb-8">
        <div className="p-3 bg-indigo-600 text-white rounded-xl mr-4 shadow-lg shadow-indigo-600/20">
          <LayoutTemplate className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('sidebar_module_management')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('saas_modules_desc')}</p>
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {modules.map(mod => (
            <div key={mod.id} className="border border-gray-200 rounded-xl p-5 flex flex-col justify-between hover:border-indigo-300 transition-colors bg-white shadow-sm hover:shadow-md">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-black text-gray-800 text-sm">{mod.label}</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={data.settings?.[mod.id] ?? true}
                      onChange={() => handleToggle(mod.id)}
                    />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">{mod.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
