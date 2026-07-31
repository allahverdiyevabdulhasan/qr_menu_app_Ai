"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2, Plus, Building2, MapPin, Users, Phone, ExternalLink, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  manager: number | null;
  manager_name?: string;
  status: 'active' | 'inactive';
  daily_revenue?: number; // Optional, computed frontend side or fetched
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    status: 'active'
  });

  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/restaurants/branch/');
      setBranches(response.data);
    } catch (err: any) {
      toast.error('Şöbələri yükləmək mümkün olmadı.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/restaurants/branch/', formData);
      toast.success('Şöbə uğurla əlavə edildi!');
      setIsModalOpen(false);
      setFormData({
        name: '',
        address: '',
        phone: '',
        status: 'active'
      });
      fetchBranches();
    } catch (err: any) {
      toast.error('Şöbə əlavə edilərkən xəta baş verdi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center border border-teal-100 shadow-sm">
            <Building2 className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Şubeler (Branches)</h1>
            <p className="text-gray-500 font-medium text-sm mt-0.5">Çoklu restoran şubelerini ve alt domainleri yönetin.</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Yeni Şube Ekle
        </button>
      </div>

      {/* Branches Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : branches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[24px] border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Şöbə Tapılmadı</h2>
          <p className="text-gray-500 mt-2">Sistemdə heç bir şöbə qeydiyyatdan keçməyib.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map(branch => (
            <div key={branch.id} className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-bold text-lg text-gray-900 leading-tight pr-4">{branch.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${branch.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {branch.status === 'active' ? 'Açık' : 'Kapalı'}
                </span>
              </div>
              
              <div className="space-y-3 mb-6 flex-grow">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium text-gray-600">{branch.address || 'Ünvan qeyd edilməyib'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-gray-400 shrink-0" />
                  <p className="text-sm font-medium text-gray-600">
                    <span className="text-gray-400 mr-1">Müdür:</span> 
                    <span className="text-gray-900 font-bold">{branch.manager_name || 'Təyin Edilməyib'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <p className="text-sm font-medium text-gray-600">{branch.phone || 'Nömrə yoxdur'}</p>
                </div>
              </div>
              
              <div className="pt-5 border-t border-gray-100 flex items-end justify-between mt-auto">
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-1">Günlük Ciro</p>
                  <h4 className="text-xl font-black text-gray-900">₺{branch.daily_revenue || '0'}</h4>
                </div>
                <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Branch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                Yeni Şube Ekle
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-200 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateBranch} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Şöbə Adı <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Məs. Merkez Şube"
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Ünvan <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Şöbənin tam ünvanı..."
                  rows={2}
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Əlaqə Nömrəsi <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+90..."
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
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
                  className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors shadow-lg flex justify-center items-center"
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
