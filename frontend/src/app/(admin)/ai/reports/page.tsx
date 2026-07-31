"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { BrainCircuit, TrendingUp, AlertTriangle, Users, Target, Activity, ChevronRight, Zap } from 'lucide-react';

export default function AIReportsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/ai_engine/airecommendations/');
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

  const insights = [
    {
      id: 1,
      type: "SALES",
      title: "Haftasonu Satış Tahmini: Yoğun",
      description: "Geçmiş verilere ve yaklaşan hava durumuna göre bu haftasonu normalden %25 daha fazla ciro bekleniyor. Cuma gününden ekstra hazırlık yapmanız önerilir.",
      priority: "HIGH",
      status: "NEW",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      id: 2,
      type: "STOCK",
      title: "Kritik Stok: Filtre Kahve",
      description: "Mevcut kahve çekirdeği stoğunuz mevcut tüketim hızıyla sadece 2 gün yetecek. Acil sipariş geçmeniz tavsiye edilir.",
      priority: "HIGH",
      status: "NEW",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      id: 3,
      type: "CUSTOMER",
      title: "Yeni Müşteri Sadakati Artıyor",
      description: "Son 1 ayda ilk kez gelen müşterilerin %40'ı ikinci kez ziyaret etti. Bu oranı artırmak için ilk ziyarette kahve ikramı kampanyası başlatabilirsiniz.",
      priority: "MEDIUM",
      status: "READ",
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
    {
      id: 4,
      type: "CAMPAIGN",
      title: "Tatlı Satışları Düşük",
      description: "Ana yemek alan müşterilerin sadece %12'si tatlı sipariş ediyor. Menüde 'Ana Yemek + Tatlı' kombo menüleri öne çıkararak bu oranı %30'a çekebilirsiniz.",
      priority: "MEDIUM",
      status: "NEW",
      icon: Target,
      color: "text-amber-600",
      bg: "bg-amber-100",
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-indigo-900 to-purple-900 rounded-[32px] p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
              <BrainCircuit className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">AI Analizler & Raporlar</h1>
              <p className="text-indigo-200 mt-1 font-medium">NeyMenu AI işletmenizin verilerini işleyerek sizin için en akıllı kararları üretir.</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 flex flex-col items-end">
              <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Okunmamış</span>
              <span className="text-2xl font-black text-white">3 <span className="text-sm font-medium text-white/70">Yeni Bilgi</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Insights List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
            <Zap className="w-5 h-5 text-indigo-600 mr-2" /> İşletme Analizleri
          </h2>
          
          {insights.map(insight => (
            <div key={insight.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 group relative overflow-hidden">
              {insight.status === "NEW" && (
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                  <div className="absolute transform rotate-45 bg-indigo-500 text-white text-[9px] font-black py-1 right-[-35px] top-[10px] w-[110px] text-center shadow-sm">YENİ</div>
                </div>
              )}
              
              <div className="flex gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${insight.bg}`}>
                  <insight.icon className={`w-6 h-6 ${insight.color}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{insight.title}</h3>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
                      insight.priority === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {insight.priority === 'HIGH' ? 'Acil' : 'Normal'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{insight.description}</p>
                  
                  <div className="mt-4 flex gap-3">
                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center bg-indigo-50 px-4 py-2 rounded-xl">
                      Aksiyon Al <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                    <button className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors px-4 py-2">
                      Gizle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI System Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <Activity className="w-5 h-5 text-emerald-500 mr-2" /> AI Motoru Durumu
            </h3>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-600">Veri Analizi</span>
                  <span className="font-bold text-emerald-600">Aktif</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full animate-pulse"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-600">Müşteri Segmentasyonu</span>
                  <span className="font-bold text-indigo-600">%92 Uyum</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[92%]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-600">Stok Optimizasyonu</span>
                  <span className="font-bold text-amber-500">Öğreniyor</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[60%]"></div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                NeyMenu AI, restoranınızın günlük işlemlerini anonim olarak işleyerek size büyümeniz için gerekli stratejik tavsiyeleri verir.
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
