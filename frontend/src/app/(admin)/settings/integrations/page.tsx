"use client";
import React, { useState, useEffect } from "react";
import { api } from '@/lib/api';
import { Link2, CheckCircle2, AlertCircle } from "lucide-react";

export default function IntegrationsPage() {
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

  const integrations = [
    { id: 1, name: "Yemeksepeti", desc: "Sipariş entegrasyonu", status: "Bağlı", color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
    { id: 2, name: "GetirYemek", desc: "Sipariş entegrasyonu", status: "Bağlantı Bekliyor", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
    { id: 3, name: "Trendyol Yemek", desc: "Sipariş entegrasyonu", status: "Bağlı Değil", color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
    { id: 4, name: "Stripe", desc: "Online Ödeme", status: "Bağlı", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
    { id: 5, name: "Iyzico", desc: "Sanal POS", status: "Bağlı Değil", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center mb-8">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl mr-4">
          <Link2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Uygulama İnteqrasiyaları</h1>
          <p className="text-sm text-gray-500 mt-1">3. parti platformları sisteminize bağlayarak süreçleri otomatikleştirin.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((intg) => (
          <div key={intg.id} className={`bg-white p-6 rounded-3xl shadow-sm border ${intg.status === 'Bağlı' ? 'border-emerald-100' : 'border-gray-100'} hover:shadow-md transition-all`}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${intg.bg} ${intg.color} ${intg.border} border`}>
                  {intg.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-800">{intg.name}</h3>
                  <p className="text-sm text-gray-500">{intg.desc}</p>
                </div>
              </div>
              <div>
                {intg.status === "Bağlı" ? (
                  <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Bağlı
                  </span>
                ) : intg.status === "Bağlantı Bekliyor" ? (
                  <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                    <AlertCircle className="w-3 h-3 mr-1" /> Bekliyor
                  </span>
                ) : (
                   <span className="flex items-center text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Pasif
                  </span>
                )}
              </div>
            </div>
            
            {intg.status === "Bağlı" ? (
              <button className="w-full py-3 bg-gray-50 text-red-600 font-bold rounded-xl text-sm hover:bg-red-50 transition-colors border border-gray-100 hover:border-red-100">
                Bağlantıyı Kes
              </button>
            ) : (
              <button className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl text-sm hover:bg-black transition-colors shadow-md">
                Entegrasyonu Başlat
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
