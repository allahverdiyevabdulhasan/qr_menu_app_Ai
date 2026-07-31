"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2, TrendingDown, Search, PlusCircle, Trash2, X, Calendar, DollarSign, Tag, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface Expense {
  id: number;
  title: string;
  category: string;
  amount: string | number;
  date: string;
  note: string;
}

const CATEGORY_MAP: Record<string, { label: string, color: string }> = {
  'INGREDIENT': { label: 'Xammal və İnqrediyent', color: 'bg-orange-100 text-orange-800' },
  'SALARY': { label: 'Əmək Haqqı', color: 'bg-blue-100 text-blue-800' },
  'RENT': { label: 'İcarə', color: 'bg-purple-100 text-purple-800' },
  'UTILITY': { label: 'Kommunal Xərclər', color: 'bg-cyan-100 text-cyan-800' },
  'PACKAGING': { label: 'Qablaşdırma', color: 'bg-yellow-100 text-yellow-800' },
  'TAX': { label: 'Vergi və Rüsumlar', color: 'bg-red-100 text-red-800' },
  'MARKETING': { label: 'Marketinq', color: 'bg-pink-100 text-pink-800' },
  'MAINTENANCE': { label: 'Təmir və Baxım', color: 'bg-stone-100 text-stone-800' },
  'OTHER': { label: 'Digər', color: 'bg-gray-100 text-gray-800' },
};

export default function ManagementExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'INGREDIENT',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const fetchExpensesAndOrders = async () => {
    setIsLoading(true);
    try {
      const [expRes, ordRes] = await Promise.all([
        api.get('/expenses/expense/'),
        api.get('/orders/order/')
      ]);
      setExpenses(expRes.data);
      setOrders(ordRes.data);
    } catch (err: any) {
      toast.error('Məlumatları yükləmək mümkün olmadı.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesAndOrders();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/expenses/expense/', formData);
      toast.success('Xərc uğurla əlavə edildi!');
      setIsModalOpen(false);
      setFormData({
        title: '',
        category: 'INGREDIENT',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        note: ''
      });
      fetchExpensesAndOrders();
    } catch (err: any) {
      toast.error('Xərc əlavə edilərkən xəta baş verdi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!confirm('Bu xərci silmək istədiyinizə əminsiniz?')) return;
    try {
      await api.delete(`/expenses/expense/${id}/`);
      toast.success('Xərc silindi!');
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } catch (err) {
      toast.error('Silinmə zamanı xəta baş verdi.');
    }
  };

  const filteredExpenses = expenses.filter(exp => 
    exp.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalExpense = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount as string), 0);
  
  // Calculate Revenue (Ciro) from completed orders
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
  
  // Calculate Net Profit
  const netProfit = totalRevenue - totalExpense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 shadow-sm">
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Xərclər</h1>
            <p className="text-gray-500 font-medium text-sm">Məsrəf və Xərc İdarəetməsi</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Axtarış..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-gray-900/20 flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Yeni Xərc
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center border border-green-100">
            <TrendingDown className="w-7 h-7 text-green-600 rotate-180" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 mb-1">Ciro (Gəlir)</p>
            <h3 className="text-2xl font-black text-gray-900">{totalRevenue.toFixed(2)} ₺</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100">
            <DollarSign className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 mb-1">Ümumi Xərclər</p>
            <h3 className="text-2xl font-black text-gray-900">{totalExpense.toFixed(2)} ₺</h3>
          </div>
        </div>

        <div className={`bg-white rounded-2xl p-6 border shadow-sm flex items-center gap-5 ${netProfit >= 0 ? 'border-green-100' : 'border-red-100'}`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${netProfit >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
            <DollarSign className={`w-7 h-7 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 mb-1">Net Kar (Qazanc)</p>
            <h3 className={`text-2xl font-black ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{netProfit.toFixed(2)} ₺</h3>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            <p className="text-gray-500 font-medium">Məlumatlar yüklənir...</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-8">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
              <TrendingDown className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Xərc Tapılmadı</h2>
            <p className="text-gray-500 max-w-sm">Hələ heç bir xərc əlavə edilməyib və ya axtarışa uyğun nəticə yoxdur.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Xərc Adı</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Kateqoriya</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Tarix</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Məbləğ</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Əməliyyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{exp.title}</div>
                      {exp.note && <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">{exp.note}</div>}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${CATEGORY_MAP[exp.category]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {CATEGORY_MAP[exp.category]?.label || exp.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-600">
                      {exp.date}
                    </td>
                    <td className="py-4 px-6 font-black text-gray-900">
                      {Number(exp.amount).toFixed(2)} ₺
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                        title="Sil"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-red-500" />
                Yeni Xərc Əlavə Et
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-200 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Xərcin Adı <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Məs. Elektrik faturası"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Kateqoriya <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all appearance-none bg-white font-medium text-gray-700"
                >
                  {Object.entries(CATEGORY_MAP).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Məbləğ (₺) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      placeholder="0.00"
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Tarix <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                      type="date" 
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Qeyd (İstəyə bağlı)</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <FileText className="h-4 w-4 text-gray-400" />
                  </div>
                  <textarea 
                    value={formData.note}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                    placeholder="Əlavə məlumat..."
                    rows={3}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  Ləğv Et
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yadda Saxla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
