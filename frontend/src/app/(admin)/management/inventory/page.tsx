'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { PackageSearch, AlertTriangle, Plus, Search, Filter, RefreshCcw } from 'lucide-react';

export default function InventoryPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/inventory/inventoryitem/');
      setData(response.data);
      setError('');
    } catch (err: any) {
      setError('Məlumatları yükləmək mümkün olmadı.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    unit: 'KG',
    current_quantity: '0',
    minimum_quantity: '0',
    cost_per_unit: '0'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/inventory/inventoryitem/${editingId}/`, formData);
      } else {
        await api.post('/inventory/inventoryitem/', formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        name: '',
        unit: 'KG',
        current_quantity: '0',
        minimum_quantity: '0',
        cost_per_unit: '0'
      });
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert('Stok əməliyyatı zamanı xəta baş verdi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const inventoryItems = [
    { id: 1, name: 'Domates (KG)', category: 'Sebze', currentStock: 12, minStock: 20, status: 'Kritik', unit: 'KG' },
    { id: 2, name: 'Kahve Çekirdeği (KG)', category: 'İçecek', currentStock: 45, minStock: 15, status: 'Yeterli', unit: 'KG' },
    { id: 3, name: 'Kutu Kola', category: 'İçecek', currentStock: 120, minStock: 50, status: 'Yeterli', unit: 'Adet' },
    { id: 4, name: 'Un (Çuval)', category: 'Kuru Gıda', currentStock: 2, minStock: 5, status: 'Kritik', unit: 'Çuval' },
    { id: 5, name: 'Zeytinyağı (LT)', category: 'Mutfak', currentStock: 0, minStock: 10, status: 'Tükendi', unit: 'LT' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stok & Envanter</h1>
          <p className="text-sm text-gray-500 mt-1">Depo ürünleri ve otomatik eksilen stok takibi</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Ürün Ara..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
            <Filter size={16} />
            Kritikler
          </button>
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({
                name: '',
                unit: 'KG',
                current_quantity: '0',
                minimum_quantity: '0',
                cost_per_unit: '0'
              });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-transparent rounded-xl text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition-all"
          >
            <Plus size={16} />
            Stok Girişi
          </button>
        </div>
      </div>

      {/* Critical Stock Alerts */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(data ? data : []).filter((i: any) => i.status !== 'Yeterli' && i.status !== 'IN_STOCK').map((item: any) => (
          <div key={item.id} className={`p-4 rounded-xl border flex gap-4 items-start ${
            item.status === 'Tükendi' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
          }`}>
            <AlertTriangle className={`mt-0.5 ${item.status === 'Tükendi' ? 'text-red-500' : 'text-orange-500'}`} size={20} />
            <div>
              <h4 className={`font-bold ${item.status === 'Tükendi' || item.status === 'OUT_OF_STOCK' ? 'text-red-800' : 'text-orange-800'}`}>
                {item.name} {(item.status === 'Tükendi' || item.status === 'OUT_OF_STOCK') && 'Tükendi!'}
              </h4>
              <p className={`text-sm mt-1 ${item.status === 'Tükendi' || item.status === 'OUT_OF_STOCK' ? 'text-red-600' : 'text-orange-700'}`}>
                Mevcut: <strong>{item.currentStock || item.current_quantity || 0} {item.unit}</strong> (Minimum: {item.minStock || item.minimum_quantity || 0} {item.unit})
              </p>
              <button className={`mt-3 text-sm font-bold flex items-center gap-1 ${
                (item.status === 'Tükendi' || item.status === 'OUT_OF_STOCK') ? 'text-red-700 hover:text-red-900' : 'text-orange-700 hover:text-orange-900'
              }`}>
                <RefreshCcw size={14} /> Sipariş Ver
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Main Inventory Table */}
      <div className="overflow-x-auto pb-10">
        <table className="w-full text-left text-sm whitespace-nowrap border-separate" style={{ borderSpacing: '0 12px' }}>
          <thead>
            <tr className="text-gray-400">
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">ÜRÜN ADI</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">KATEGORİ</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">MEVCUT STOK</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">MİN. STOK SINIRI</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest">DURUM</th>
              <th className="px-6 pb-2 font-black uppercase text-[10px] tracking-widest text-right">İŞLEMLER</th>
            </tr>
          </thead>
          <tbody>
            {(data ? data : []).map((item: any, idx: number) => (
              <tr key={idx} className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                <td className="px-6 py-5 rounded-l-[24px] font-black text-gray-900 flex items-center gap-4 relative">
                  <div className="absolute inset-y-0 left-0 w-1 bg-transparent group-hover:bg-[#7A5CFF] transition-colors rounded-l-[24px]"></div>
                  <div className="p-3 bg-gray-50 rounded-xl text-gray-400 shadow-sm border border-gray-100 group-hover:bg-[#7A5CFF] group-hover:text-white transition-colors"><PackageSearch size={18} /></div>
                  {item.name}
                </td>
                <td className="px-6 py-5">
                  <span className="text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest border border-gray-100">
                    {item.category || 'GENEL'}
                  </span>
                </td>
                <td className="px-6 py-5 font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 text-lg">{item.currentStock ?? item.current_quantity ?? 0} {item.unit}</td>
                <td className="px-6 py-5 font-bold text-gray-400">{item.minStock ?? item.minimum_quantity ?? 0} {item.unit}</td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                    (item.status === 'Yeterli' || item.status === 'IN_STOCK') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    (item.status === 'Kritik' || item.status === 'LOW_STOCK') ? 'bg-orange-50 text-orange-600 border-orange-100' :
                    'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {item.status === 'IN_STOCK' ? 'Yeterli' : 
                     item.status === 'LOW_STOCK' ? 'Kritik' : 
                     item.status === 'OUT_OF_STOCK' ? 'Tükendi' : 
                     item.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right rounded-r-[24px]">
                  <button 
                    onClick={() => {
                      setEditingId(item.id);
                      setFormData({
                        name: item.name || '',
                        unit: item.unit || 'KG',
                        current_quantity: item.currentStock?.toString() ?? item.current_quantity?.toString() ?? '0',
                        minimum_quantity: item.minStock?.toString() ?? item.minimum_quantity?.toString() ?? '0',
                        cost_per_unit: item.cost_per_unit?.toString() ?? '0'
                      });
                      setIsModalOpen(true);
                    }}
                    className="px-4 py-2 bg-white hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 font-bold text-sm rounded-xl border border-transparent hover:border-indigo-100 transition-colors shadow-sm"
                  >
                    Düzenle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-gray-900">{editingId ? 'Stoku Düzenle' : 'Yeni Stok Girişi'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-700">X</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Məhsul Adı</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1">Vahid</label>
                  <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="KG">KG</option>
                    <option value="GR">GR</option>
                    <option value="LITER">Litr</option>
                    <option value="ML">ML</option>
                    <option value="PIECE">Ədəd</option>
                    <option value="PACKAGE">Paket</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1">Cari Miqdar</label>
                  <input required value={formData.current_quantity} onChange={e => setFormData({...formData, current_quantity: e.target.value})} type="number" step="0.01" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1">Min. Miqdar</label>
                  <input required value={formData.minimum_quantity} onChange={e => setFormData({...formData, minimum_quantity: e.target.value})} type="number" step="0.01" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1">Vahid Qiyməti (₺)</label>
                  <input required value={formData.cost_per_unit} onChange={e => setFormData({...formData, cost_per_unit: e.target.value})} type="number" step="0.01" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full mt-4 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors">
                {isSubmitting ? 'Saxlanılır...' : 'Yadda Saxla'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
