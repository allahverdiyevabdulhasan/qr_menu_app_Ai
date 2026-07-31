'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';
import { 
  ChevronLeft, MapPin, Plus, Trash2, CheckCircle2, Loader2, Home, Building2
} from 'lucide-react';
import { useTranslation } from '@/components/LanguageProvider';

export default function AddressesPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const accessToken = Cookies.get('access_token');
  const { t } = useTranslation();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newAddress, setNewAddress] = useState({ title: '', full_address: '', notes: '', is_default: false });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push(`/m/${resolvedParams.slug}/login`);
      return;
    }

    fetchAddresses();
  }, [isAuthenticated, authLoading, router, resolvedParams.slug, accessToken]);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      const response = await api.get('http://127.0.0.1:8000/api/public/auth/addresses/');
      setAddresses(response.data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      await api.post('http://127.0.0.1:8000/api/public/auth/addresses/', newAddress);
      setNewAddress({ title: '', full_address: '', notes: '', is_default: false });
      setIsAdding(false);
      fetchAddresses();
    } catch (error) {
      console.error('Error adding address:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('address_delete_confirm'))) return;
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      await api.delete(`http://127.0.0.1:8000/api/public/auth/addresses/${id}/`);
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };
  
  const handleSetDefault = async (id: number) => {
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      await api.put(`http://127.0.0.1:8000/api/public/auth/addresses/${id}/`, { is_default: true });
      fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA] flex flex-col font-sans text-zinc-900 pb-20 selection:bg-zinc-200">
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-[#FAFAFA]/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="px-5 py-4 flex items-center justify-between">
           <button onClick={() => router.push(`/m/${resolvedParams.slug}/profile`)} className="w-10 h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-900 shadow-sm active:scale-95 transition-transform">
             <ChevronLeft size={20} strokeWidth={2.5}/>
           </button>
           <h1 className="font-bold text-[15px] tracking-tight">{t('address_title')}</h1>
           <div className="w-10 h-10"></div>
        </div>
      </div>

      <div className="max-w-xl mx-auto w-full px-5 pt-6">
        
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full mb-6 bg-zinc-900 text-white font-bold py-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Plus size={20} strokeWidth={2.5} />
            {t('address_add_new')}
          </button>
        )}

        {isAdding && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 mb-8">
            <h3 className="font-bold text-lg mb-4">{t('address_new')}</h3>
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">{t('address_label_title')}</label>
                <input 
                  required
                  placeholder={t('address_ph_title')}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                  value={newAddress.title}
                  onChange={e => setNewAddress({...newAddress, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">{t('address_label_full')}</label>
                <textarea 
                  required
                  placeholder={t('address_ph_full')}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-zinc-400 focus:bg-white transition-colors resize-none h-24"
                  value={newAddress.full_address}
                  onChange={e => setNewAddress({...newAddress, full_address: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">{t('address_label_note')}</label>
                <input 
                  placeholder={t('address_ph_note')}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                  value={newAddress.notes}
                  onChange={e => setNewAddress({...newAddress, notes: e.target.value})}
                />
              </div>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded accent-zinc-900"
                  checked={newAddress.is_default}
                  onChange={e => setNewAddress({...newAddress, is_default: e.target.checked})}
                />
                <span className="font-medium text-zinc-700">{t('address_set_default')}</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 bg-zinc-100 text-zinc-700 font-bold py-3.5 rounded-xl active:bg-zinc-200 transition-colors"
                >
                  {t('address_cancel')}
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] bg-zinc-900 text-white font-bold py-3.5 rounded-xl active:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  {submitting ? t('address_saving') : t('address_save')}
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address.id} className="bg-white rounded-3xl border border-zinc-100 p-5 shadow-sm relative overflow-hidden group">
                {address.is_default && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider">
                    {t('address_default_badge')}
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 shrink-0 border border-zinc-100">
                    {address.title.toLowerCase().includes('iş') || address.title.toLowerCase().includes('work') 
                      ? <Building2 size={24} /> 
                      : <Home size={24} />
                    }
                  </div>
                  <div className="flex-1 pr-6">
                    <h3 className="font-bold text-lg text-zinc-900 mb-1">{address.title}</h3>
                    <p className="text-sm text-zinc-500 font-medium leading-relaxed mb-3">{address.full_address}</p>
                    {address.notes && (
                      <p className="text-xs text-zinc-400 bg-zinc-50 p-2 rounded-lg mb-3">
                        <span className="font-bold text-zinc-500 mr-1">{t('address_note_prefix')}</span>{address.notes}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2">
                      {!address.is_default && (
                         <button onClick={() => handleSetDefault(address.id)} className="text-xs font-bold text-emerald-600 flex items-center gap-1 active:opacity-70">
                           <CheckCircle2 size={14} /> {t('address_make_default')}
                         </button>
                      )}
                      <button onClick={() => handleDelete(address.id)} className="text-xs font-bold text-red-500 flex items-center gap-1 active:opacity-70 ml-auto">
                        <Trash2 size={14} /> {t('address_delete')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {addresses.length === 0 && !isAdding && (
               <div className="text-center py-10">
                 <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-300 mx-auto mb-4">
                   <MapPin size={32} />
                 </div>
                 <p className="text-zinc-500 font-medium">{t('address_empty')}</p>
               </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
