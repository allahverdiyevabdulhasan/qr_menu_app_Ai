"use client";
import React, { useState, useEffect } from "react";
import { api } from '@/lib/api';
import { Users, Star, Award, Gift, Search, MoreVertical } from "lucide-react";

export default function CRMPage() {
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

  const customers = [
    { name: "Cemil Özkan", phone: "+90 555 123 4567", visits: 24, spent: "₺8,450", level: "Gold", points: 1250 },
    { name: "Selin Yılmaz", phone: "+90 532 987 6543", visits: 12, spent: "₺3,200", level: "Silver", points: 450 },
    { name: "Hakan Demir", phone: "+90 544 567 8901", visits: 45, spent: "₺15,800", level: "Platinum", points: 3400 },
    { name: "Zeynep Çelik", phone: "+90 505 345 6789", visits: 3, spent: "₺850", level: "Bronze", points: 120 },
  ];

  const getLevelColor = (level: string) => {
    switch(level) {
      case "Platinum": return "from-slate-700 to-slate-900 text-white shadow-slate-300";
      case "Gold": return "from-yellow-400 to-amber-600 text-white shadow-amber-200";
      case "Silver": return "from-gray-300 to-gray-500 text-white shadow-gray-200";
      case "Bronze": return "from-orange-300 to-orange-500 text-white shadow-orange-200";
      default: return "from-gray-100 to-gray-200 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Toplam Müştəri", value: "2,450", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Aktiv (Son 30 gün)", value: "845", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
          { title: "Sadiq Müştərilər", value: "320", icon: Award, color: "text-purple-600", bg: "bg-purple-50" },
          { title: "Verilən Hədiyyələr", value: "1,240", icon: Gift, color: "text-emerald-500", bg: "bg-emerald-50" },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-black text-gray-800">{stat.value}</h3>
              </div>
              <div className={`p-4 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 px-2 mt-8">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tight mb-4 md:mb-0">
          <div className="w-10 h-10 bg-white rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.06)] flex items-center justify-center">
             <Users className="w-5 h-5 text-indigo-600" />
          </div>
          Müştəri Verilənlər Bazası (CRM)
        </h2>
        <div className="relative w-full md:w-auto">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Ad və ya telefon..." className="pl-12 pr-4 py-3 bg-white border border-gray-100 shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-full md:w-80 transition-all font-medium" />
        </div>
      </div>

      <div className="overflow-x-auto pb-10">
        <table className="w-full text-left text-sm whitespace-nowrap border-separate" style={{ borderSpacing: '0 12px' }}>
          <thead>
            <tr className="text-gray-400">
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">MÜŞTƏRİ ADI</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">ƏLAQƏ</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest text-center">ZİYARƏT SAYI</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest text-right">XƏRCLƏYİB</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest text-center">SƏVİYYƏ (LOYALTY)</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest text-right">BALLAR</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest text-right">İŞLƏMLƏR</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, idx) => (
              <tr key={idx} className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                <td className="px-6 py-5 rounded-l-[24px] font-black text-gray-900 relative">
                  <div className="absolute inset-y-0 left-0 w-1 bg-transparent group-hover:bg-[#7A5CFF] transition-colors rounded-l-[24px]"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 font-black flex items-center justify-center text-lg border border-indigo-100 shadow-sm">
                      {c.name.charAt(0)}
                    </div>
                    <span className="font-black text-gray-900 text-base">{c.name}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-gray-500 font-bold">{c.phone}</td>
                <td className="px-6 py-5 text-center font-black text-gray-700">{c.visits}</td>
                <td className="px-6 py-5 text-right font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 text-lg">{c.spent}</td>
                <td className="px-6 py-5 text-center">
                  <span className={`px-4 py-2 rounded-xl text-xs font-black shadow-md bg-gradient-to-r ${getLevelColor(c.level)} uppercase tracking-widest`}>
                    {c.level}
                  </span>
                </td>
                <td className="px-6 py-5 text-right font-black text-[#7A5CFF] text-lg">{c.points} <span className="text-xs text-indigo-400">pts</span></td>
                <td className="px-6 py-5 text-right rounded-r-[24px]">
                  <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-xl transition-all shadow-sm ml-auto opacity-0 group-hover:opacity-100">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
