import os

BASE_DIR = r"C:\Users\amira\OneDrive - Yalova Üniversitesi\Desktop\Startup project\Qr_menu APP\QR_\frontend\src\app\(admin)"

pages = {
    r"management\categories\page.tsx": '''"use client";
import React from "react";
import { Plus, Edit2, Trash2, Search, Filter, LayoutGrid } from "lucide-react";

export default function CategoriesPage() {
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
          <h1 className="text-2xl font-bold text-gray-800">Kategoriler</h1>
          <p className="text-sm text-gray-500 mt-1">Menü kategorilerini ve içerik sayılarını yönetin.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-200 flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Kategori
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Kategori ara..." className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-64 transition-all" />
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
                <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">{cat.count} Ürün</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cat.status === 'Aktiv' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                  {cat.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
''',
    r"operations\waiter\page.tsx": '''"use client";
import React, { useState } from "react";
import { Coffee, UtensilsCrossed, Wine, Search, Plus, Minus, Send } from "lucide-react";

export default function WaiterPanel() {
  const [activeTab, setActiveTab] = useState("Tümü");
  
  const menuItems = [
    { id: 1, name: "Karışık Pizza", price: "240.00", category: "Yemek", icon: UtensilsCrossed, color: "text-orange-500", bg: "bg-orange-50" },
    { id: 2, name: "Latte Macchiato", price: "85.00", category: "İçecek", icon: Coffee, color: "text-amber-700", bg: "bg-amber-50" },
    { id: 3, name: "Sezar Salata", price: "180.00", category: "Yemek", icon: UtensilsCrossed, color: "text-green-500", bg: "bg-green-50" },
    { id: 4, name: "Ev Yapımı Limonata", price: "65.00", category: "İçecek", icon: Wine, color: "text-yellow-500", bg: "bg-yellow-50" },
    { id: 5, name: "Tiramisu", price: "120.00", category: "Tatlı", icon: Coffee, color: "text-pink-500", bg: "bg-pink-50" },
    { id: 6, name: "Izgara Somon", price: "450.00", category: "Yemek", icon: UtensilsCrossed, color: "text-blue-500", bg: "bg-blue-50" },
  ];

  const categories = ["Tümü", "Yemek", "İçecek", "Tatlı"];

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 animate-in fade-in duration-500">
      {/* Menü Alanı */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Sipariş Ekranı</h2>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Ürün ara..." className="pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 w-64 transition-all" />
          </div>
        </div>
        
        {/* Kategoriler */}
        <div className="flex px-6 py-4 gap-3 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === cat 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 transform scale-105' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Ürünler Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {menuItems.filter(i => activeTab === "Tümü" || i.category === activeTab).map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="group relative border border-gray-100 rounded-3xl p-4 cursor-pointer hover:border-indigo-200 hover:shadow-xl transition-all duration-300 bg-white">
                <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <h3 className="font-bold text-gray-800 line-clamp-2 min-h-[40px] leading-tight mb-2">{item.name}</h3>
                <p className="text-indigo-600 font-black text-lg">₺{item.price}</p>
                <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 rounded-3xl transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-white text-indigo-600 p-2 rounded-xl shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all">
                    <Plus className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Adisyon / Sepet Alanı */}
      <div className="w-96 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -z-0"></div>
        <div className="p-6 border-b border-gray-50 relative z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Adisyon</h2>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">Masa 12</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl group hover:bg-white hover:shadow-md hover:border-indigo-100 border border-transparent transition-all">
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 text-sm">Karışık Pizza</h4>
              <p className="text-xs text-gray-500 mt-1">₺240.00</p>
            </div>
            <div className="flex items-center bg-white rounded-xl p-1 shadow-sm border border-gray-100">
              <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Minus className="w-4 h-4" /></button>
              <span className="w-8 text-center font-bold text-sm">2</span>
              <button className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl group hover:bg-white hover:shadow-md hover:border-indigo-100 border border-transparent transition-all">
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 text-sm">Ev Yapımı Limonata</h4>
              <p className="text-xs text-gray-500 mt-1">₺65.00</p>
            </div>
            <div className="flex items-center bg-white rounded-xl p-1 shadow-sm border border-gray-100">
              <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Minus className="w-4 h-4" /></button>
              <span className="w-8 text-center font-bold text-sm">1</span>
              <button className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 relative z-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 text-sm">Ara Toplam</span>
            <span className="font-semibold text-gray-800">₺545.00</span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-500 text-sm">KDV (10%)</span>
            <span className="font-semibold text-gray-800">₺54.50</span>
          </div>
          <div className="flex justify-between items-center mb-6 py-4 border-t border-dashed border-gray-300">
            <span className="font-bold text-lg text-gray-800">Toplam</span>
            <span className="font-black text-2xl text-indigo-600">₺599.50</span>
          </div>
          <button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-indigo-200 flex justify-center items-center group">
            Mutfak Onayı Gönder
            <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
''',
    r"management\roles\page.tsx": '''"use client";
import React from "react";
import { Shield, Check, X, Plus } from "lucide-react";

export default function RolesPage() {
  const roles = [
    { id: 1, name: "Sistem Yöneticisi", users: 2, badge: "bg-purple-100 text-purple-700" },
    { id: 2, name: "Restoran Müdürü", users: 4, badge: "bg-blue-100 text-blue-700" },
    { id: 3, name: "Kasiyer", users: 8, badge: "bg-emerald-100 text-emerald-700" },
    { id: 4, name: "Garson", users: 15, badge: "bg-orange-100 text-orange-700" },
    { id: 5, name: "Mutfak Şefi", users: 3, badge: "bg-red-100 text-red-700" },
  ];

  const permissions = [
    "Siparişleri Görüntüleme", "Sipariş İptali", "Menü Düzenleme", 
    "Fiyat Değiştirme", "Raporları Görüntüleme", "Kullanıcı Yönetimi", "Ayarları Değiştirme"
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl mr-4">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Roller ve İzinler</h1>
            <p className="text-sm text-gray-500 mt-1">Personel yetkilendirmelerini ve sistem erişim seviyelerini yönetin.</p>
          </div>
        </div>
        <button className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Rol Ekle
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-5 border-b border-gray-100 bg-gray-50/50 font-bold text-gray-600 text-sm">Yetki Adı</th>
                {roles.map(r => (
                  <th key={r.id} className="p-5 border-b border-gray-100 bg-gray-50/50 font-bold text-center text-sm">
                    <div className="flex flex-col items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold mb-2 ${r.badge}`}>{r.name}</span>
                      <span className="text-xs text-gray-400 font-normal">{r.users} Kullanıcı</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-5 border-b border-gray-50 font-medium text-gray-800 text-sm">{perm}</td>
                  {roles.map(r => {
                    const hasAccess = Math.random() > 0.3 || r.id === 1; // Admin always has access, others random for demo
                    return (
                      <td key={r.id} className="p-5 border-b border-gray-50 text-center">
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${hasAccess ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-400'}`}>
                          {hasAccess ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
''',
    r"management\invoices\page.tsx": '''"use client";
import React from "react";
import { Receipt, FileDown, Eye, Search, Calendar, ChevronDown } from "lucide-react";

export default function InvoicesPage() {
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex justify-between">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Fatura No veya Müşteri Ara..." className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 w-80 transition-all" />
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="p-5 text-sm font-bold text-gray-600">Fatura No</th>
              <th className="p-5 text-sm font-bold text-gray-600">Tarih</th>
              <th className="p-5 text-sm font-bold text-gray-600">Müşteri/Cari</th>
              <th className="p-5 text-sm font-bold text-gray-600">Tutar</th>
              <th className="p-5 text-sm font-bold text-gray-600">Durum</th>
              <th className="p-5 text-sm font-bold text-gray-600 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="p-5 font-medium text-gray-800">{inv.id}</td>
                <td className="p-5 text-gray-500 text-sm">{inv.date}</td>
                <td className="p-5 font-semibold text-gray-700">{inv.customer}</td>
                <td className="p-5 font-black text-gray-900">{inv.amount}</td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(inv.status)}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-blue-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-all">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-emerald-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-all">
                      <FileDown className="w-4 h-4" />
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
''',
    r"management\crm\page.tsx": '''"use client";
import React from "react";
import { Users, Star, Award, Gift, Search, MoreVertical } from "lucide-react";

export default function CRMPage() {
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Müştəri Verilənlər Bazası (CRM)</h2>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Ad və ya telefon..." className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-64 transition-all" />
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="p-5 text-sm font-bold text-gray-600">Müştəri Adı</th>
              <th className="p-5 text-sm font-bold text-gray-600">Əlaqə</th>
              <th className="p-5 text-sm font-bold text-gray-600 text-center">Ziyarət Sayı</th>
              <th className="p-5 text-sm font-bold text-gray-600 text-right">Xərcləyib</th>
              <th className="p-5 text-sm font-bold text-gray-600 text-center">Səviyyə (Loyalty)</th>
              <th className="p-5 text-sm font-bold text-gray-600 text-right">Ballar</th>
              <th className="p-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers.map((c, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-5">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center mr-3">
                      {c.name.charAt(0)}
                    </div>
                    <span className="font-bold text-gray-800">{c.name}</span>
                  </div>
                </td>
                <td className="p-5 text-sm text-gray-500">{c.phone}</td>
                <td className="p-5 text-center font-semibold text-gray-700">{c.visits}</td>
                <td className="p-5 text-right font-black text-gray-900">{c.spent}</td>
                <td className="p-5 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r ${getLevelColor(c.level)}`}>
                    {c.level}
                  </span>
                </td>
                <td className="p-5 text-right font-bold text-indigo-600">{c.points} pts</td>
                <td className="p-5 text-right">
                  <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
''',
    r"branches\page.tsx": '''"use client";
import React from "react";
import { Building2, MapPin, Users, Phone, Plus, ExternalLink } from "lucide-react";

export default function BranchesPage() {
  const branches = [
    { name: "Merkez Şube - Nişantaşı", address: "Valikonağı Cad. No:45 Şişli/İstanbul", manager: "Ali Veli", phone: "0212 555 1234", status: "Açık", revenue: "₺125K" },
    { name: "Kadıköy Şube", address: "Moda Cad. No:12 Kadıköy/İstanbul", manager: "Ayşe Yılmaz", phone: "0216 555 9876", status: "Açık", revenue: "₺98K" },
    { name: "Bodrum Şube (Yazlık)", address: "Marina Karşısı, Bodrum/Muğla", manager: "Cemil Özkan", phone: "0252 555 4567", status: "Kapalı", revenue: "₺0" },
  ];

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
        {branches.map((branch, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-teal-100 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-50/0 to-teal-100/50 rounded-bl-full -z-10 group-hover:scale-125 transition-transform"></div>
            
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800 pr-4">{branch.name}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${branch.status === 'Açık' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {branch.status}
              </span>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-start text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-3 mt-0.5 text-gray-400" />
                <span>{branch.address}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-3 text-gray-400" />
                <span>Müdür: <strong className="text-gray-800">{branch.manager}</strong></span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-3 text-gray-400" />
                <span>{branch.phone}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Günlük Ciro</p>
                <p className="text-lg font-black text-gray-900">{branch.revenue}</p>
              </div>
              <button className="flex items-center justify-center w-10 h-10 bg-gray-50 text-gray-600 hover:bg-teal-600 hover:text-white rounded-xl transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
''',
    r"ai\reports\page.tsx": '''"use client";
import React from "react";
import { BrainCircuit, TrendingUp, AlertTriangle, Lightbulb, BarChart3 } from "lucide-react";

export default function AIReportsPage() {
  const insights = [
    { type: "opportunity", title: "Hafta Sonu Yoğunluğu", desc: "Cumartesi akşamları %40 kapasite artışı bekleniyor. Ekstra 2 personel planlaması önerilir.", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
    { type: "warning", title: "Stok Uyarısı", desc: "Kahve çekirdeği tüketimi anormal arttı. 3 gün içinde stok tükenebilir, sipariş verin.", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
    { type: "idea", title: "Menü Optimizasyonu", desc: '\"Karamelli Macchiato\" satışları düştü. Fiyatını ₺5 indirerek satışları %15 artırabilirsiniz.', icon: Lightbulb, color: "text-blue-500", bg: "bg-blue-50" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10">
          <BrainCircuit className="w-64 h-64 -mt-10 -mr-10" />
        </div>
        <div className="relative z-10 flex items-center mb-4">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md mr-4">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black">NeyMenu AI Asistanı</h1>
            <p className="text-indigo-100 mt-1">Yapay Zeka destekli restoran analizi ve öngörüleri.</p>
          </div>
        </div>
        <p className="text-white/80 max-w-2xl text-sm leading-relaxed">
          Sisteminizdeki binlerce sipariş verisini analiz ederek size en doğru kararları almanıza yardımcı olacak stratejik öneriler sunuyoruz.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-6">
              <BarChart3 className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-bold text-gray-800">Yapay Zeka Öngörüleri (Gelecek 7 Gün)</h2>
            </div>
            {/* Dummy Chart Area */}
            <div className="h-64 w-full bg-gray-50 rounded-2xl flex items-center justify-center border border-dashed border-gray-200">
              <div className="flex items-end space-x-4 h-40">
                {[40, 60, 45, 80, 100, 90, 55].map((h, i) => (
                  <div key={i} className="w-12 bg-gradient-to-t from-indigo-600 to-violet-400 rounded-t-lg relative group transition-all duration-500 hover:opacity-80 cursor-pointer" style={{ height: `${h}%` }}>
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">%{h}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-4 font-medium">Beklenen Satış Hacmi Projeksiyonu</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 px-2">Akıllı Öneriler</h2>
          {insights.map((insight, idx) => {
            const Icon = insight.icon;
            return (
              <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-violet-100 transition-all group cursor-pointer">
                <div className="flex items-start">
                  <div className={`p-3 rounded-xl ${insight.bg} mr-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${insight.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm mb-1">{insight.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{insight.desc}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
''',
    r"marketing\campaigns\page.tsx": '''"use client";
import React from "react";
import { Megaphone, Ticket, Clock, Users, Plus, Percent } from "lucide-react";

export default function CampaignsPage() {
  const campaigns = [
    { id: 1, name: "Öğle Yemeği Fırsatı", code: "LUNCH20", discount: "%20", used: 145, status: "Aktif", expiry: "30.08.2026", color: "bg-blue-500" },
    { id: 2, name: "İlk Sipariş Hediyesi", code: "HOSGELDIN", discount: "₺50", used: 842, status: "Aktif", expiry: "Süresiz", color: "bg-emerald-500" },
    { id: 3, name: "Hafta Sonu Tatlısı", code: "WEEKENDSWT", discount: "%15", used: 56, status: "Süresi Doldu", expiry: "15.07.2026", color: "bg-gray-400" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center">
          <div className="p-3 bg-pink-50 text-pink-600 rounded-xl mr-4">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Kampanyalar & Kuponlar</h1>
            <p className="text-sm text-gray-500 mt-1">Müşteri sadakatini artıracak promosyonlar düzenleyin.</p>
          </div>
        </div>
        <button className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md shadow-pink-200 flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Kampanya
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((camp) => (
          <div key={camp.id} className="bg-white rounded-3xl p-1 shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow group">
            <div className="p-6 relative">
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${camp.status === 'Aktif' ? 'bg-emerald-500' : 'bg-gray-400'}`}>
                  {camp.status}
                </span>
              </div>
              <div className={`w-14 h-14 rounded-2xl ${camp.color} bg-opacity-10 flex items-center justify-center mb-4`}>
                <Percent className={`w-7 h-7 text-${camp.color.split('-')[1]}-600`} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">{camp.name}</h2>
              <div className="inline-block border-2 border-dashed border-gray-300 rounded-lg px-3 py-1.5 mt-2 bg-gray-50 mb-6">
                <code className="text-sm font-black text-gray-700 tracking-wider">{camp.code}</code>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-500"><Ticket className="w-4 h-4 mr-2" /> İndirim</span>
                  <span className="font-bold text-gray-800">{camp.discount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-500"><Users className="w-4 h-4 mr-2" /> Kullanım</span>
                  <span className="font-bold text-gray-800">{camp.used} Kişi</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-500"><Clock className="w-4 h-4 mr-2" /> Bitiş</span>
                  <span className="font-bold text-gray-800">{camp.expiry}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
''',
    r"marketing\reviews\page.tsx": '''"use client";
import React from "react";
import { Star, MessageCircle, ThumbsUp, ThumbsDown } from "lucide-react";

export default function ReviewsPage() {
  const reviews = [
    { id: 1, customer: "Ali V.", rating: 5, text: "Yemekler harikaydı, servis çok hızlıydı. Kesinlikle tekrar geleceğiz!", date: "2 saat önce", source: "QR Menü" },
    { id: 2, customer: "Sema K.", rating: 4, text: "Pizza çok güzeldi ama biraz soğuk geldi.", date: "1 gün önce", source: "Google" },
    { id: 3, customer: "Murat T.", rating: 2, text: "Garsonlar çok ilgisizdi. Beklentimi karşılamadı.", date: "3 gün önce", source: "Yemeksepeti" },
    { id: 4, customer: "Elif B.", rating: 5, text: "Tiramisu bir efsane! Şiddetle tavsiye ederim.", date: "1 hafta önce", source: "QR Menü" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg shadow-orange-200 md:col-span-1 flex flex-col justify-center items-center text-center">
          <h2 className="text-lg font-bold text-orange-100 mb-2">Ortalama Puan</h2>
          <div className="text-6xl font-black mb-2">4.6</div>
          <div className="flex space-x-1 mb-2">
            {[1,2,3,4,5].map(i => <Star key={i} className={`w-6 h-6 ${i <= 4 ? 'fill-white text-white' : 'fill-orange-400/50 text-orange-300'}`} />)}
          </div>
          <p className="text-sm font-medium text-orange-100 mt-2">Toplam 1,284 Değerlendirme</p>
        </div>
        
        <div className="md:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center">
          {/* Progress Bars for Ratings */}
          <div className="w-full max-w-md space-y-3">
            {[
              { stars: 5, pct: 70, color: "bg-emerald-500" },
              { stars: 4, pct: 20, color: "bg-emerald-400" },
              { stars: 3, pct: 6, color: "bg-yellow-400" },
              { stars: 2, pct: 3, color: "bg-orange-400" },
              { stars: 1, pct: 1, color: "bg-red-500" },
            ].map(r => (
              <div key={r.stars} className="flex items-center text-sm font-bold text-gray-600">
                <span className="w-12 flex items-center">{r.stars} <Star className="w-4 h-4 ml-1 fill-gray-400 text-gray-400" /></span>
                <div className="flex-1 h-3 mx-4 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.pct}%` }}></div>
                </div>
                <span className="w-10 text-right">% {r.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center">
          <MessageCircle className="w-6 h-6 text-gray-400 mr-3" />
          <h2 className="text-xl font-bold text-gray-800">Son Yorumlar</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {reviews.map(review => (
            <div key={review.id} className="p-6 hover:bg-gray-50/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center mr-3">
                    {review.customer.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{review.customer}</h4>
                    <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-md mt-1 inline-block">{review.source}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex space-x-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />)}
                  </div>
                  <span className="text-xs text-gray-400 mt-1">{review.date}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-3 leading-relaxed ml-13 pl-13">"{review.text}"</p>
              <div className="mt-4 flex space-x-3 ml-13 pl-13">
                <button className="flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                  Yanıtla
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
''',
    r"settings\general\page.tsx": '''"use client";
import React from "react";
import { Settings, Save, Store, Globe, Banknote, Percent } from "lucide-react";

export default function GeneralSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center mb-8">
        <div className="p-3 bg-gray-900 text-white rounded-xl mr-4">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Genel Ayarlar</h1>
          <p className="text-sm text-gray-500 mt-1">Sistem, restoran bilgileri ve finansal ayarlar.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-4 mb-6 flex items-center">
          <Store className="w-5 h-5 mr-2 text-indigo-600" /> Restoran Bilgileri
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Restoran Adı</label>
            <input type="text" defaultValue="NeyMenu Cafe & Bistro" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Telefon Numarası</label>
            <input type="text" defaultValue="+90 212 555 1234" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Adres</label>
            <textarea defaultValue="Valikonağı Cad. No:45 Şişli/İstanbul" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none h-24 resize-none"></textarea>
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-4 mb-6 mt-12 flex items-center">
          <Banknote className="w-5 h-5 mr-2 text-emerald-600" /> Bölgesel ve Finansal
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Para Birimi</label>
            <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none appearance-none">
              <option>₺ Türk Lirası (TRY)</option>
              <option>$ US Dollar (USD)</option>
              <option>€ Euro (EUR)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Saat Dilimi</label>
            <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none appearance-none">
              <option>Europe/Istanbul (UTC+3)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">Varsayılan KDV Oranı <Percent className="w-4 h-4 ml-1 text-gray-400"/></label>
            <input type="number" defaultValue="10" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" />
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 flex items-center">
            <Save className="w-5 h-5 mr-2" />
            Değişiklikleri Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
''',
    r"settings\integrations\page.tsx": '''"use client";
import React from "react";
import { Link2, CheckCircle2, AlertCircle } from "lucide-react";

export default function IntegrationsPage() {
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
'''
}

for rel_path, content in pages.items():
    full_path = os.path.join(BASE_DIR, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Created: {rel_path}")
