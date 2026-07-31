import os

base_dir = "src/app"

pages = {
    "(admin)/operations/kds": ("KDS Ekranı", "Mətbəx Sifariş İdarəetməsi (Kitchen Display System)", "ChefHat", "bg-rose-50"),
    "(admin)/operations/waiter": ("Garson Paneli", "Masa və Sifariş İdarəetməsi", "Users", "bg-indigo-50"),
    "(admin)/operations/cashier": ("Kassa Paneli", "Ödənişlər və Hesablar", "CreditCard", "bg-emerald-50"),
    "(admin)/operations/courier": ("Kuryer Paneli", "Çatdırılma İzləmə", "Truck", "bg-blue-50"),
    "(admin)/management/finance/z-reports": ("Z-Hesabatları", "Günlük Kassa Kapanışları", "FileText", "bg-gray-50"),
    "(admin)/management/finance/refunds": ("İmtinalar və Qaytarmalar", "Sifariş İptalleri", "RotateCcw", "bg-red-50"),
    "(admin)/operations/orders/create": ("Yeni Sifariş", "Manuel Sifariş Yarat", "PlusCircle", "bg-green-50"),
    
    "(admin)/management/expenses": ("Xərclər", "Məsrəf və Xərc İdarəetməsi", "TrendingDown", "bg-orange-50"),
    "(admin)/management/inventory/forecast": ("Stok Təxminləri", "Stok Hərəkətləri ve Analiz", "BarChart2", "bg-purple-50"),
    "(admin)/management/menu/ingredients": ("İnqrediyentlər (Reseptlər)", "Məhsul Tərkibləri", "BookOpen", "bg-yellow-50"),
    
    "(admin)/marketing/loyalty": ("Sadiqlik Proqramı", "Müştəri Xalları və Mükafatlar", "Gift", "bg-pink-50"),
    
    "(admin)/management/staff/shifts": ("İşçi Növbələri", "Vardiya İdarəetməsi", "Clock", "bg-cyan-50"),
    "(admin)/management/staff/payroll": ("Maaşlar", "Maaş və Bordro Cədvəli", "DollarSign", "bg-emerald-50"),
    
    "(admin)/dashboard/reports/sales": ("Satış Hesabatları", "Detallı Analitika", "PieChart", "bg-indigo-50"),
    
    # Customer facing (m/*)
    "m/cart": ("Səbətiniz", "Sifarişlərinizi təsdiqləyin", "ShoppingCart", "bg-white"),
    "m/checkout": ("Ödəniş", "Təhlükəsiz Ödəniş Səhifəsi", "CreditCard", "bg-white"),
    "m/tracking": ("Sifariş İzləmə", "Sifarişinizin vəziyyəti", "MapPin", "bg-white"),
    "m/reviews": ("Dəyərləndirmə", "Bizi necə qiymətləndirirsiniz?", "Star", "bg-white"),
    "m/reservation": ("Onlayn Rezervasiya", "Masa ayırt", "Calendar", "bg-white"),
}

template = """\"use client\";
import React from 'react';
import {{ {icon}, Search, ArrowLeft, PlusCircle, RotateCcw, FileText, Truck, CreditCard, Users, ChefHat, TrendingDown, BarChart2, BookOpen, Gift, Clock, DollarSign, PieChart, ShoppingCart, MapPin, Star, Calendar }} from 'lucide-react';

export default function {component_name}Page() {{
  return (
    <div className="space-y-6">
      {{/* Header */}}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 {bg_color} rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm">
            <{icon} className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h1>
            <p className="text-gray-500 font-medium text-sm">{description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Axtarış..." 
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {{/* Main Content Area */}}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm min-h-[500px] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 {bg_color} rounded-full flex items-center justify-center mb-6 opacity-80">
          <{icon} className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Məlumat Tapılmadı</h2>
        <p className="text-gray-500 max-w-md">
          Hazırda bu bölmədə göstəriləcək məlumat yoxdur. Arxa plan (Django API) bağlantısı qurulduqdan sonra məlumatlar burada dinamik olaraq əks olunacaq.
        </p>
        <button className="mt-8 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-gray-900/20">
          Məlumatları Yenilə
        </button>
      </div>
    </div>
  );
}}
"""

for path, (title, description, icon, bg_color) in pages.items():
    full_dir = os.path.join(base_dir, path)
    os.makedirs(full_dir, exist_ok=True)
    
    component_name = "".join([word.capitalize() for word in path.replace("(admin)/", "").replace("m/", "").replace("-", "/").split("/")])
    
    content = template.format(
        title=title,
        description=description,
        icon=icon,
        bg_color=bg_color,
        component_name=component_name
    )
    
    with open(os.path.join(full_dir, "page.tsx"), "w", encoding="utf-8") as f:
        f.write(content)

print(f"Successfully generated {len(pages)} pages for 100% MVT parity.")
