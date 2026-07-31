"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { Sparkles, Megaphone, Target, ArrowRight, Activity, Percent, Gift, Send } from 'lucide-react';

export default function CampaignsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/campaigns/campaigns/');
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

  const aiSuggestions = [
    {
      id: 1,
      title: "Öğle Arası Yoğunluk Kampanyası",
      target: "Beyaz Yakalı Müşteriler (12:00-14:00)",
      description: "Son 1 ayda öğle tatilinde gelen müşteri sayısında %15 düşüş var. 'Ana Yemek + İçecek %20 İndirim' kampanyası başlatarak bu kitleyi geri kazanabilirsiniz.",
      successRate: "%85 Başarı Beklentisi",
      icon: Target,
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50 text-blue-600",
    },
    {
      id: 2,
      title: "Tatlı Severleri Yakala",
      target: "Sadece Kahve İçenler",
      description: "Müşterilerinizin %40'ı kahvenin yanında tatlı almıyor. Kahve alanlara 'Tatlıda %30 İndirim' SMS/Push bildirimi gönderin.",
      successRate: "%92 Başarı Beklentisi",
      icon: Gift,
      color: "from-amber-500 to-orange-600",
      bg: "bg-amber-50 text-amber-600",
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">AI Kampanya Yöneticisi</h1>
          <p className="text-gray-500 mt-2 font-medium">NeyMenu AI, verilerinizi analiz ederek en yüksek dönüşümlü kampanyaları sizin için hazırlar.</p>
        </div>
        <button className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-gray-900/20 transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Manuel Kampanya Yarat
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Suggestions List */}
        {aiSuggestions.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-1 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 overflow-hidden relative group">
            
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${campaign.color} opacity-5 rounded-full blur-[40px] group-hover:opacity-20 transition-opacity`}></div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${campaign.bg}`}>
                  <campaign.icon className="w-6 h-6" />
                </div>
                <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase px-3 py-1.5 rounded-full flex items-center gap-1 border border-emerald-100">
                  <Activity className="w-3 h-3" /> {campaign.successRate}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-1">{campaign.title}</h3>
              <p className="text-xs font-bold text-indigo-600 mb-3 uppercase tracking-wider">{campaign.target}</p>
              
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {campaign.description}
              </p>
              
              <div className="flex gap-3">
                <button className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                  <Sparkles className="w-4 h-4" /> AI ile Başlat
                </button>
                <button className="bg-gray-50 hover:bg-gray-100 text-gray-600 p-3 rounded-xl transition-colors border border-gray-200">
                  <Megaphone className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Campaigns */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Percent className="w-5 h-5 text-indigo-600" /> Aktif Kampanyalar
        </h2>
        <div className="overflow-x-auto pb-10">
          <table className="w-full text-left text-sm whitespace-nowrap border-separate" style={{ borderSpacing: '0 12px' }}>
            <thead>
              <tr className="text-gray-400">
                <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">KAMPANYA ADI</th>
                <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">HEDEF KİTLE</th>
                <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">BİTİŞ TARİHİ</th>
                <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">DURUM</th>
                <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">DÖNÜŞÜM</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                <td className="px-6 py-5 rounded-l-[24px] font-black text-gray-900 relative">
                  <div className="absolute inset-y-0 left-0 w-1 bg-transparent group-hover:bg-[#7A5CFF] transition-colors rounded-l-[24px]"></div>
                  Hoş Geldin İndirimi %10
                </td>
                <td className="px-6 py-5 text-gray-500 font-bold">Tüm Yeni Müşteriler</td>
                <td className="px-6 py-5 text-gray-500 font-bold">Süresiz</td>
                <td className="px-6 py-5">
                  <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm border border-emerald-100">AKTİF</span>
                </td>
                <td className="px-6 py-5 font-black text-transparent bg-clip-text bg-gradient-to-r from-[#7A5CFF] to-blue-500 text-lg rounded-r-[24px]">
                  %24.5
                </td>
              </tr>
              <tr className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                <td className="px-6 py-5 rounded-l-[24px] font-black text-gray-900 relative">
                  <div className="absolute inset-y-0 left-0 w-1 bg-transparent group-hover:bg-[#7A5CFF] transition-colors rounded-l-[24px]"></div>
                  Sevgililer Günü Menüsü
                </td>
                <td className="px-6 py-5 text-gray-500 font-bold">QR Menü Ziyaretçileri</td>
                <td className="px-6 py-5 text-gray-500 font-bold">14 Şubat 2026</td>
                <td className="px-6 py-5">
                  <span className="bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm border border-amber-100">HAZIRLANIYOR</span>
                </td>
                <td className="px-6 py-5 font-black text-gray-400 text-lg rounded-r-[24px]">
                  -
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Needed because Plus was used but not imported from lucide-react initially. (fixed inline above but I should just define a small icon or add the import properly)
function Plus(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
}
