"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2, Plus, Gift, Search, Settings2, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface LoyaltyRule {
  id: number;
  points_per_amount: number;
  amount_step: string;
  is_active: boolean;
  restaurant: number;
}

export default function LoyaltyPage() {
  const [rules, setRules] = useState<LoyaltyRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    points_per_amount: '1',
    amount_step: '10.00',
    is_active: true
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/loyalty/loyaltyrule/');
      setRules(response.data);
    } catch (err: any) {
      toast.error('Məlumatları yükləmək mümkün olmadı.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        points_per_amount: parseInt(formData.points_per_amount),
        amount_step: parseFloat(formData.amount_step).toFixed(2),
        // Normally restaurant is assigned from the backend via the authenticated user
        restaurant: 1 // Fallback just in case, but backend should handle this
      };

      if (editingId) {
        await api.put(`/loyalty/loyaltyrule/${editingId}/`, payload);
        toast.success('Qayda uğurla yeniləndi!');
      } else {
        await api.post('/loyalty/loyaltyrule/', payload);
        toast.success('Sadiqlik Qaydası uğurla yaradıldı!');
      }
      setIsModalOpen(false);
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      toast.error('Xəta baş verdi. Zəhmət olmasa məlumatları düzgün daxil edin.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu sadiqlik qaydasını silmək istədiyinizə əminsiniz?')) return;
    try {
      await api.delete(`/loyalty/loyaltyrule/${id}/`);
      toast.success('Qayda silindi!');
      fetchData();
    } catch (err) {
      toast.error('Silinmə zamanı xəta baş verdi.');
    }
  };

  const toggleStatus = async (rule: LoyaltyRule) => {
    try {
      await api.patch(`/loyalty/loyaltyrule/${rule.id}/`, {
        is_active: !rule.is_active
      });
      toast.success('Status yeniləndi!');
      fetchData();
    } catch (err) {
      toast.error('Statusu dəyişmək mümkün olmadı.');
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setFormData({ points_per_amount: '1', amount_step: '10.00', is_active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (rule: LoyaltyRule) => {
    setEditingId(rule.id);
    setFormData({
      points_per_amount: rule.points_per_amount.toString(),
      amount_step: rule.amount_step.toString(),
      is_active: rule.is_active
    });
    setIsModalOpen(true);
  };

  const filteredRules = rules.filter(r => 
    r.amount_step.toString().includes(searchQuery) || 
    r.points_per_amount.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm">
            <Gift className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Sadiqlik Proqramı</h1>
            <p className="text-gray-500 font-medium text-sm">Müştərilərə xallar qazandırın</p>
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
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={openNewModal}
            className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Yeni Qayda Yarat
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-pink-600 mb-4" />
            <p className="text-gray-500 font-medium">Məlumatlar yüklənir...</p>
          </div>
        ) : filteredRules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-gray-500">Məbləğ Həddi (Xərclənən)</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-gray-500">Veriləcək Xal</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-gray-500">Status</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-gray-500 text-right">İşləmlər</th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                          <span className="font-black">₼</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{rule.amount_step} ₼</p>
                          <p className="text-xs text-gray-500 font-medium">Hər dəfə bu məbləğə çatdıqda</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-pink-500" />
                        <span className="font-black text-pink-600 text-lg">+{rule.points_per_amount} Xal</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <button 
                        onClick={() => toggleStatus(rule)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${
                          rule.is_active 
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {rule.is_active ? 'Aktiv' : 'Passiv'}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(rule)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                        >
                          <Settings2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(rule.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-6">
              <Gift className="w-10 h-10 text-pink-300" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Heç bir qayda tapılmadı</h2>
            <p className="text-gray-500 font-medium mb-6 max-w-sm">
              Sadiqlik proqramı hazırda boşdur. Müştərilərinizə xal qazandırmaq üçün yeni qayda yaradın.
            </p>
            <button 
              onClick={openNewModal}
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-pink-600/20"
            >
              İlk Qaydanı Yarat
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Gift className="text-pink-500" />
                {editingId ? 'Qaydanı Yenilə' : 'Yeni Sadiqlik Qaydası'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs font-medium text-blue-700 leading-relaxed">
                Müştəri <strong className="font-black text-blue-900">{formData.amount_step} ₼</strong> xərclədikdə, 
                balansına avtomatik <strong className="font-black text-blue-900">{formData.points_per_amount} Xal</strong> əlavə olunacaq.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Xərclənməli Məbləğ (₼) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-bold">₼</span>
                  </div>
                  <input 
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={formData.amount_step}
                    onChange={(e) => setFormData({...formData, amount_step: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                    placeholder="Məsələn: 10.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Veriləcək Xal (Bonus) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Gift className="w-4 h-4 text-gray-400" />
                  </div>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={formData.points_per_amount}
                    onChange={(e) => setFormData({...formData, points_per_amount: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                    placeholder="Məsələn: 1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <input 
                  type="checkbox"
                  id="isActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-5 h-5 rounded text-pink-600 focus:ring-pink-500 border-gray-300"
                />
                <div>
                  <label htmlFor="isActive" className="text-sm font-bold text-gray-900 block cursor-pointer">Aktivdir</label>
                  <p className="text-xs text-gray-500 font-medium">Bu qayda hazırda istifadə edilsin?</p>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  Ləğv Et
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] px-4 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-600/20 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Yenilə' : 'Yarat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
