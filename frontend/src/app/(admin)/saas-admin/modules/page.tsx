"use client";
import React, { useState, useEffect } from "react";
import { LayoutTemplate, Loader2, Store } from "lucide-react";
import { api } from '@/lib/api';
import { useTranslation } from '@/components/LanguageProvider';

export default function SaaSModulesPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRestId, setSelectedRestId] = useState<string>('');
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/restaurants/restaurant/superadmin_stats/');
      setStats(response.data);
      if (response.data.restaurants && response.data.restaurants.length > 0 && !selectedRestId) {
        setSelectedRestId(response.data.restaurants[0].id.toString());
      }
    } catch (err: any) {
      alert('Restoranlar yüklenirken hata oluştu.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedRest = stats?.restaurants?.find((r: any) => r.id.toString() === selectedRestId);

  const handleToggle = async (field: string) => {
    if (!selectedRest || !selectedRest.settings) return;
    try {
      const newSettings = { ...selectedRest.settings, [field]: !selectedRest.settings[field] };
      
      // Optimizasyon için statsları hemen güncelleyelim
      const updatedRestaurants = stats.restaurants.map((r: any) => {
        if (r.id.toString() === selectedRestId) {
          return { ...r, settings: newSettings };
        }
        return r;
      });
      setStats({ ...stats, restaurants: updatedRestaurants });

      await api.patch(`/restaurants/restaurantsettings/${selectedRest.settings.id}/`, { [field]: newSettings[field] });
      alert(`${selectedRest.name} için modül ayarı güncellendi!`);
    } catch (err) {
      console.error('Failed to toggle module', err);
      alert('Ayar güncellenirken hata oluştu.');
      fetchData(); // Rollback on error
    }
  };

  if (isLoading && !stats) return <div className="p-8 text-center text-gray-500 flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

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
    { id: 'enable_marketing_loyalty', label: t('sidebar_loyalty'), desc: t('module_marketing_loyalty') },
    { id: 'enable_reviews', label: t('sidebar_reviews'), desc: t('module_reviews') },
    { id: 'enable_settings', label: t('sidebar_system_settings'), desc: t('module_settings') },
    { id: 'enable_branches', label: t('sidebar_branches'), desc: t('module_branches') }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center mb-8">
        <div className="p-3 bg-indigo-600 text-white rounded-xl mr-4 shadow-lg shadow-indigo-600/20">
          <LayoutTemplate className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('saas_modules_title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('saas_modules_desc')}</p>
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8">
        
        <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
              <Store className="w-4 h-4 mr-2" /> {t('saas_modules_select_rest')}
            </label>
            <select 
              value={selectedRestId}
              onChange={(e) => setSelectedRestId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-gray-900"
            >
              <option value="" disabled>Lütfen bir restoran seçin</option>
              {stats?.restaurants?.map((r: any) => (
                <option key={r.id} value={r.id.toString()}>{r.name} ({r.owner_email})</option>
              ))}
            </select>
          </div>
        </div>

        {selectedRest ? (
          <div>
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-4 mb-6 flex items-center">
              <LayoutTemplate className="w-5 h-5 mr-2 text-indigo-600" /> {selectedRest.name} Panelleri
            </h2>
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
                          checked={selectedRest.settings?.[mod.id] ?? true}
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
        ) : (
          <div className="text-center py-10 text-gray-500 font-bold">
            Lütfen bir restoran seçin.
          </div>
        )}
      </div>
    </div>
  );
}
