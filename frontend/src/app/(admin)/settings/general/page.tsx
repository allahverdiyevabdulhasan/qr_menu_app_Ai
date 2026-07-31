"use client";
import React, { useState, useEffect, useRef } from "react";
import { Settings, Save, Store, Banknote, Image as ImageIcon, Link as LinkIcon, Upload } from "lucide-react";
import { api } from '@/lib/api';
import { useTranslation } from '@/components/LanguageProvider';

export default function GeneralSettingsPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/restaurants/restaurant/');
      if (response.data.length > 0) {
        setData(response.data[0]);
        if (response.data[0].logo) {
          setPreviewImage(response.data[0].logo);
        }
      }
      setError('');
    } catch (err: any) {
      setError(t('admin_err_load'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('name', data.name || '');
      formData.append('phone', data.phone || '');
      formData.append('address', data.address || '');
      formData.append('email', data.email || '');
      formData.append('description', data.description || '');
      formData.append('slug', data.slug || '');
      formData.append('default_language', data.default_language || 'tr');
      formData.append('currency', data.currency || 'TRY');
      
      const parsedHours = typeof data.opening_hours === 'string' 
        ? data.opening_hours 
        : JSON.stringify(data.opening_hours || {});
      formData.append('opening_hours', parsedHours);
      
      if (selectedImage) {
        formData.append('logo', selectedImage);
      }

      await api.patch(`/restaurants/restaurant/${data.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(t('admin_success_save'));
    } catch (err: any) {
      console.error(err);
      setError(t('admin_err_save'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">{t('admin_loading')}</div>;
  if (!data) return <div className="p-8 text-center text-red-500">{t('admin_err_not_found')}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="p-3 bg-gray-900 text-white rounded-xl mr-4">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t('admin_settings_title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('admin_settings_desc')}</p>
          </div>
        </div>
        {data.slug && (
          <a href={`/m/${data.slug}`} target="_blank" rel="noreferrer" className="flex items-center text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors">
            <LinkIcon className="w-4 h-4 mr-2" />
            {t('admin_settings_view_qr')}
          </a>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">{error}</div>}
      {success && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-medium border border-emerald-100">{success}</div>}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        
        {/* LOGO SECTION */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div 
            className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group cursor-pointer" 
            onClick={() => fileInputRef.current?.click()}
          >
            {previewImage ? (
              <img src={previewImage} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-300" />
            )}
            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
              <Upload className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{t('admin_settings_logo')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('admin_settings_logo_desc')}</p>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="mt-3 text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              {t('admin_settings_upload')}
            </button>
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-4 mb-6 flex items-center">
          <Store className="w-5 h-5 mr-2 text-indigo-600" /> {t('admin_settings_rest_info')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('admin_settings_name')}</label>
            <input type="text" name="name" value={data.name || ''} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('admin_settings_slug')}</label>
            <input type="text" name="slug" value={data.slug || ''} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('admin_settings_phone')}</label>
            <input type="text" name="phone" value={data.phone || ''} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('admin_settings_email')}</label>
            <input type="email" name="email" value={data.email || ''} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('admin_settings_address')}</label>
            <textarea name="address" value={data.address || ''} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none h-24 resize-none"></textarea>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('admin_settings_description')}</label>
            <textarea name="description" value={data.description || ''} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none h-24 resize-none"></textarea>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('admin_settings_hours')}</label>
            <textarea name="opening_hours" value={typeof data.opening_hours === 'string' ? data.opening_hours : JSON.stringify(data.opening_hours || {}, null, 2)} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none h-24 resize-none font-mono text-sm"></textarea>
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-4 mb-6 mt-12 flex items-center">
          <Banknote className="w-5 h-5 mr-2 text-emerald-600" /> {t('admin_settings_financial')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('admin_settings_currency')}</label>
            <select name="currency" value={data.currency || 'TRY'} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none appearance-none">
              <option value="TRY">₺ Türk Lirası (TRY)</option>
              <option value="USD">$ US Dollar (USD)</option>
              <option value="EUR">€ Euro (EUR)</option>
              <option value="AZN">₼ Azərbaycan Manatı (AZN)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('admin_settings_lang')}</label>
            <select name="default_language" value={data.default_language || 'tr'} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none appearance-none">
              <option value="tr">Türkçe (tr)</option>
              <option value="en">English (en)</option>
              <option value="az">Azərbaycan (az)</option>
            </select>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 flex items-center ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <Save className="w-5 h-5 mr-2" />
            {isSaving ? t('admin_settings_saving') : t('admin_settings_save')}
          </button>
        </div>
      </div>
    </div>
  );
}

