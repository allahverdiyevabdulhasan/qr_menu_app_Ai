"use client";
import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Filter, LayoutGrid } from "lucide-react";
import { api } from '@/lib/api';
import { useTranslation } from '@/components/LanguageProvider';

export default function CategoriesPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/restaurants/restaurant/');
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

  const categories = [
    { id: 1, name: "Ana Yemekler", count: 24, status: "Aktiv", color: "bg-orange-500" },
    { id: 2, name: "İçecekler", count: 18, status: "Aktiv", color: "bg-blue-500" },
    { id: 3, name: "Tatlılar", count: 12, status: "Aktiv", color: "bg-pink-500" },
    { id: 4, name: "Başlangıçlar", count: 9, status: "Aktiv", color: "bg-green-500" },
    { id: 5, name: "Salatalar", count: 15, status: "Deaktiv", color: "bg-gray-400" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('admin_categories_title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('admin_categories_desc')}</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-200 flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          {t('admin_categories_new')}
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder={t('admin_categories_search')} className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-64 transition-all" />
          </div>
          <button className="p-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="group border border-gray-100 rounded-2xl p-5 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/0 to-gray-50/50 rounded-bl-full -z-10 transition-transform group-hover:scale-150"></div>
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl ${cat.color} bg-opacity-10 flex items-center justify-center`}>
                  <LayoutGrid className={`w-6 h-6 text-${cat.color.split('-')[1]}-600`} />
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-gray-400 hover:text-indigo-600 bg-white rounded-lg shadow-sm border border-gray-100 transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button className="p-1.5 text-gray-400 hover:text-red-600 bg-white rounded-lg shadow-sm border border-gray-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800">{cat.name}</h3>
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">{cat.count} {t('admin_categories_product')}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cat.status === 'Aktiv' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                  {cat.status === 'Aktiv' ? t('admin_status_active') : t('admin_status_inactive')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
