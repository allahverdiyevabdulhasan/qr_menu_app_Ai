"use client";
import React, { useState, useEffect } from "react";
import { api } from '@/lib/api';
import { Receipt, FileDown, Eye, Search, Calendar, ChevronDown } from "lucide-react";

export default function InvoicesPage() {
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

  const invoices = [
    { id: "INV-2026-081", date: "19 Tem 2026", customer: "Ahmet Yılmaz", amount: "₺845.00", status: "Ödendi" },
    { id: "INV-2026-082", date: "19 Tem 2026", customer: "Kurumsal Ltd. Şti.", amount: "₺4,250.00", status: "Bekliyor" },
    { id: "INV-2026-083", date: "18 Tem 2026", customer: "Ayşe Kaya", amount: "₺320.00", status: "Ödendi" },
    { id: "INV-2026-084", date: "17 Tem 2026", customer: "Yemeksepeti A.Ş.", amount: "₺12,400.00", status: "Gecikti" },
    { id: "INV-2026-085", date: "16 Tem 2026", customer: "Mehmet Demir", amount: "₺180.00", status: "İptal Edildi" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ödendi": return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "Bekliyor": return "bg-amber-50 text-amber-600 border-amber-200";
      case "Gecikti": return "bg-red-50 text-red-600 border-red-200";
      case "İptal Edildi": return "bg-gray-100 text-gray-500 border-gray-200";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mr-4">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Faturalar</h1>
            <p className="text-sm text-gray-500 mt-1">E-Fatura, fiş ve kurumsal fatura kayıtları.</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4 mr-2" />
            Bu Ay
            <ChevronDown className="w-4 h-4 ml-2" />
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md shadow-blue-200">
            Yeni Fatura Kes
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Fatura No veya Müşteri Ara..." className="pl-12 pr-4 py-3 bg-white border border-gray-100 shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-full md:w-96 transition-all font-medium" />
        </div>
      </div>

      <div className="overflow-x-auto pb-10">
        <table className="w-full text-left text-sm whitespace-nowrap border-separate" style={{ borderSpacing: '0 12px' }}>
          <thead>
            <tr className="text-gray-400">
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">FATURA NO</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">TARİH</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">MÜŞTERİ/CARİ</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">TUTAR</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">DURUM</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest text-right">İŞLEMLER</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                <td className="px-6 py-5 rounded-l-[24px] font-black text-gray-900 relative">
                  <div className="absolute inset-y-0 left-0 w-1 bg-transparent group-hover:bg-[#7A5CFF] transition-colors rounded-l-[24px]"></div>
                  {inv.id}
                </td>
                <td className="px-6 py-5 text-gray-500 font-bold">{inv.date}</td>
                <td className="px-6 py-5 font-black text-gray-700">{inv.customer}</td>
                <td className="px-6 py-5 font-black text-transparent bg-clip-text bg-gradient-to-r from-[#7A5CFF] to-blue-500 text-lg">
                  {inv.amount}
                </td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(inv.status)}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right rounded-r-[24px]">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[#7A5CFF] bg-white hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-xl transition-all shadow-sm">
                      <Eye size={16} />
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-emerald-600 bg-white hover:bg-emerald-50 border border-transparent hover:border-emerald-100 rounded-xl transition-all shadow-sm">
                      <FileDown size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
