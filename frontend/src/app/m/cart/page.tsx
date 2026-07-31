"use client";
import React from 'react';
import { ShoppingCart, Search, ArrowLeft, PlusCircle, RotateCcw, FileText, Truck, CreditCard, Users, ChefHat, TrendingDown, BarChart2, BookOpen, Gift, Clock, DollarSign, PieChart, MapPin, Star, Calendar } from 'lucide-react';

export default function CartPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm">
            <ShoppingCart className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Səbətiniz</h1>
            <p className="text-gray-500 font-medium text-sm">Sifarişlərinizi təsdiqləyin</p>
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

      {/* Main Content Area */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm min-h-[500px] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 opacity-80">
          <ShoppingCart className="w-10 h-10 text-gray-400" />
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
}
