'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import { useTranslation } from '@/components/LanguageProvider';

export default function PreferencesPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const accessToken = Cookies.get('access_token');
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<{dietary_preferences: string[], allergies: string[]}>({
    dietary_preferences: [],
    allergies: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push(`/m/${resolvedParams.slug}/login`);
      return;
    }

    const fetchPreferences = async () => {
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        const response = await api.get('http://127.0.0.1:8000/api/public/auth/me/preferences/');
        setPreferences({
          dietary_preferences: response.data.dietary_preferences || [],
          allergies: response.data.allergies || []
        });
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPreferences();
  }, [isAuthenticated, authLoading, router, resolvedParams.slug, accessToken]);

  const toggleItem = (listName: 'dietary_preferences' | 'allergies', item: string) => {
    setPreferences(prev => {
      const list = prev[listName];
      if (list.includes(item)) {
        return { ...prev, [listName]: list.filter(i => i !== item) };
      } else {
        return { ...prev, [listName]: [...list, item] };
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      await api.put('http://127.0.0.1:8000/api/public/auth/me/preferences/', preferences);
      alert(t('pref_success_save'));
      router.push(`/m/${resolvedParams.slug}/profile`);
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert(t('pref_err_save'));
    } finally {
      setSaving(false);
    }
  };

  const diets = [t('pref_diet_veg'), t('pref_diet_vegan'), t('pref_diet_gluten_free'), t('pref_diet_keto'), t('pref_diet_pescatarian'), t('pref_diet_low_cal')];
  const allergies = [t('pref_alrg_peanut'), t('pref_alrg_dairy'), t('pref_alrg_egg'), t('pref_alrg_soy'), t('pref_alrg_seafood'), t('pref_alrg_nuts'), t('pref_alrg_sesame')];

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA] flex flex-col font-sans text-zinc-900 pb-20 selection:bg-zinc-200">
      <div className="sticky top-0 z-50 bg-[#FAFAFA]/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="px-5 py-4 flex items-center justify-between">
           <button onClick={() => router.push(`/m/${resolvedParams.slug}/profile`)} className="w-10 h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-900 shadow-sm active:scale-95 transition-transform">
             <ChevronLeft size={20} strokeWidth={2.5}/>
           </button>
           <h1 className="font-bold text-[15px] tracking-tight">{t('pref_title')}</h1>
           <div className="w-10 h-10"></div>
        </div>
      </div>

      <div className="max-w-xl mx-auto w-full px-5 pt-8">
        
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold mb-1">{t('pref_diet_profile')}</h2>
              <p className="text-sm text-zinc-500 mb-4">{t('pref_diet_desc')}</p>
              <div className="flex flex-wrap gap-3">
                {diets.map(diet => {
                  const active = preferences.dietary_preferences.includes(diet);
                  return (
                    <button
                      key={diet}
                      onClick={() => toggleItem('dietary_preferences', diet)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${active ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-700 border-zinc-200'}`}
                    >
                      {diet}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-1">{t('pref_allergies')}</h2>
              <p className="text-sm text-zinc-500 mb-4">{t('pref_allergies_desc')}</p>
              <div className="flex flex-wrap gap-3">
                {allergies.map(allergy => {
                  const active = preferences.allergies.includes(allergy);
                  return (
                    <button
                      key={allergy}
                      onClick={() => toggleItem('allergies', allergy)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${active ? 'bg-red-500 text-white border-red-500' : 'bg-white text-zinc-700 border-zinc-200'}`}
                    >
                      {allergy}
                    </button>
                  );
                })}
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-8 bg-zinc-900 text-white font-bold py-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
              {saving ? t('pref_saving') : t('pref_save')}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
