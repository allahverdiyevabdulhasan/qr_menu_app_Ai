'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Shield, Plus, Edit2, Trash2, Check, X, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface CustomRole {
  id: number;
  name: string;
  description: string;
  [key: string]: any; // For all the boolean permissions
}

const permissionsList = [
  { key: 'can_view_daily_revenue', label: 'Gündəlik Gəlir', category: 'Maliyyə' },
  { key: 'can_view_monthly_revenue', label: 'Aylıq Gəlir', category: 'Maliyyə' },
  { key: 'can_view_yearly_revenue', label: 'İllik Gəlir', category: 'Maliyyə' },
  { key: 'can_view_net_profit', label: 'Xalis Mənfəət', category: 'Maliyyə' },
  { key: 'can_view_expenses', label: 'Xərclər', category: 'Maliyyə' },
  { key: 'can_view_payroll', label: 'Maaşlar', category: 'Maliyyə' },
  { key: 'can_view_analytics', label: 'Analitika', category: 'Maliyyə' },
  
  { key: 'can_view_kitchen_screen', label: 'Mətbəx Ekranı', category: 'Əməliyyatlar' },
  { key: 'can_view_waiter_panel', label: 'Qarson Paneli', category: 'Əməliyyatlar' },
  { key: 'can_view_cashier_panel', label: 'Kasiyer Paneli', category: 'Əməliyyatlar' },
  
  { key: 'can_manage_menu', label: 'Menyu İdarəetməsi', category: 'Sistem' },
  { key: 'can_manage_inventory', label: 'İnventar', category: 'Sistem' },
  { key: 'can_manage_customers', label: 'Müştərilər', category: 'Sistem' },
  { key: 'can_view_ai_reports', label: 'Süni İntellekt', category: 'Sistem' },
  { key: 'can_manage_campaigns', label: 'Kampaniyalar', category: 'Sistem' },
  { key: 'can_view_reviews', label: 'Rəylər', category: 'Sistem' },
  { key: 'can_manage_settings', label: 'Tənzimləmələr', category: 'Sistem' },
  { key: 'can_manage_branches', label: 'Filiallar', category: 'Sistem' },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState<Partial<CustomRole>>({
    name: '',
    description: '',
  });

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/accounts/customrole/');
      setRoles(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenModal = (role?: CustomRole) => {
    if (role) {
      setEditingRole(role);
      setFormData(role);
    } else {
      setEditingRole(null);
      const defaultFormData: any = { name: '', description: '' };
      permissionsList.forEach(p => defaultFormData[p.key] = false);
      setFormData(defaultFormData);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        restaurant: user?.restaurant_slug // Fallback, backend handles this via RestaurantFilterMixin usually
      };

      if (editingRole) {
        await api.patch(`/accounts/customrole/${editingRole.id}/`, payload);
      } else {
        await api.post('/accounts/customrole/', payload);
      }
      setIsModalOpen(false);
      fetchRoles();
    } catch (err) {
      console.error('Error saving role:', err);
      alert('Rütbə yadda saxlanılarkən xəta baş verdi');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bu rütbəni silmək istədiyinizə əminsiniz?')) {
      try {
        await api.delete(`/accounts/customrole/${id}/`);
        fetchRoles();
      } catch (err) {
        console.error(err);
        alert('Silinmə xətası');
      }
    }
  };

  const togglePermission = (key: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  const groupedPermissions = permissionsList.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {} as Record<string, typeof permissionsList>);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            Dinamik Rütbələr və İcazələr
          </h1>
          <p className="text-gray-500 mt-1 text-sm">İşçiləriniz üçün xüsusi vəzifələr yaradın və modullara girişlərini məhdudlaşdırın.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Yeni Rütbə Əlavə Et
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map(role => (
          <div key={role.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{role.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{role.description || 'Açıqlama yoxdur'}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleOpenModal(role)} className="p-2 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-lg">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(role.id)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Aktiv İcazələr</p>
              <div className="flex flex-wrap gap-2">
                {permissionsList.filter(p => role[p.key]).slice(0, 5).map(p => (
                  <span key={p.key} className="px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium border border-green-100 flex items-center gap-1">
                    <Check className="w-3 h-3" /> {p.label}
                  </span>
                ))}
                {permissionsList.filter(p => role[p.key]).length > 5 && (
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium border border-gray-200">
                    +{permissionsList.filter(p => role[p.key]).length - 5} daha
                  </span>
                )}
                {permissionsList.filter(p => role[p.key]).length === 0 && (
                  <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-md border border-red-100">Heç bir icazə yoxdur</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">
                {editingRole ? 'Rütbəni Yenilə' : 'Yeni Rütbə Yarat'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="roleForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Rütbənin Adı</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name || ''}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      placeholder="Məsələn: Təcrübəçi Qarson"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Qısa Açıqlama</label>
                    <input 
                      type="text" 
                      value={formData.description || ''}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      placeholder="Bu rütbə kimlər üçündür?"
                    />
                  </div>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-500" />
                    Sistem İcazələri (RBAC)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {Object.entries(groupedPermissions).map(([category, perms]) => (
                      <div key={category} className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                        <h4 className="font-semibold text-gray-800 text-sm mb-4 border-b border-gray-200 pb-2">{category}</h4>
                        <div className="space-y-3">
                          {perms.map(p => (
                            <label key={p.key} className="flex items-center gap-3 cursor-pointer group">
                              <div className="relative flex items-center justify-center">
                                <input 
                                  type="checkbox"
                                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded hover:border-indigo-500 checked:bg-indigo-600 checked:border-indigo-600 transition-colors cursor-pointer"
                                  checked={!!formData[p.key]}
                                  onChange={() => togglePermission(p.key)}
                                />
                                <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={3} />
                              </div>
                              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 select-none">
                                {p.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200 transition-colors text-sm"
              >
                Ləğv et
              </button>
              <button 
                type="submit" 
                form="roleForm"
                className="px-6 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors text-sm flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Yadda Saxla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
