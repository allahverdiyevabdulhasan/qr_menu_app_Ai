"use client";
import React, { useState, useEffect } from "react";
import { Building2, MapPin, Users, Phone, Plus, ExternalLink, ShieldAlert } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function BranchesPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/restaurants/branch/');
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

  const displayBranches = data || [];

  const canManageBranches = user?.is_super_admin || user?.restaurant_settings?.enable_branches;

  if (!canManageBranches) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Yetkisiz Erişim</h2>
        <p className="text-gray-500 max-w-md mx-auto text-lg leading-relaxed">
          Bu sayfayı görüntülemek için yetkiniz bulunmamaktadır. Şubelerinizi yönetmek için lütfen sistem yöneticisiyle iletişime geçin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl mr-4">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Şubeler (Branches)</h1>
            <p className="text-sm text-gray-500 mt-1">Çoklu restoran şubelerini ve alt domainleri yönetin.</p>
          </div>
        </div>
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md shadow-teal-200 flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Şube Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayBranches.length === 0 && !isLoading && (
          <div className="col-span-full p-10 text-center text-gray-500 font-medium bg-white rounded-3xl border border-gray-100">
            Kayıtlı şube bulunmamaktadır.
          </div>
        )}
        {displayBranches.map((branch: any, idx: number) => (
          <div key={branch.id || idx} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-teal-100 transition-all group relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-50/0 to-teal-100/50 rounded-bl-full -z-10 group-hover:scale-125 transition-transform"></div>
            
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800 pr-4">{branch.name}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${branch.status === 'active' || branch.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {branch.status === 'active' || branch.is_active ? 'Açık' : 'Kapalı'}
              </span>
            </div>
            
            <div className="space-y-3 mb-6 flex-1">
              <div className="flex items-start text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-3 mt-0.5 text-gray-400 shrink-0" />
                <span>{branch.address || 'Adres belirtilmemiş'}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-3 text-gray-400 shrink-0" />
                <span>Müdür: <strong className="text-gray-800">{branch.manager_name || branch.manager || 'Atanmadı'}</strong></span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-3 text-gray-400 shrink-0" />
                <span>{branch.phone || 'Telefon belirtilmemiş'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-auto">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Günlük Ciro</p>
                <p className="text-lg font-black text-gray-900">₺{branch.revenue || branch.daily_revenue || '0'}</p>
              </div>
              <button className="flex items-center justify-center w-10 h-10 bg-gray-50 text-gray-600 hover:bg-teal-600 hover:text-white rounded-xl transition-colors shrink-0">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
