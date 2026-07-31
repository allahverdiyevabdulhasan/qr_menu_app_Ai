"use client";
import React, { useState } from 'react';
import { CreditCard, ArrowLeft, User, Phone, CheckCircle2, Loader2, Gift } from 'lucide-react';

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call for QR Order Submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Sifarişiniz Qəbul Edildi!</h2>
          <p className="text-gray-500 font-medium mb-6">Mətbəx sifarişinizi hazırlamağa başladı. Nuş olsun!</p>
          
          <div className="bg-pink-50 rounded-2xl p-4 border border-pink-100 text-left mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-5 h-5 text-pink-500" />
              <h3 className="font-bold text-pink-900">Sadiqlik Bonusunuz</h3>
            </div>
            <p className="text-sm text-pink-700 font-medium">Bu sifariş tamamlandıqdan sonra hesabınıza xallar əlavə olunacaq!</p>
          </div>

          <button onClick={() => window.location.reload()} className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-bold transition-colors">
            Menyuya Qayıt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-4">
        <button className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-black text-gray-900">Ödəniş və Təsdiq</h1>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6 mt-4">
        
        {/* Order Summary Summary (Placeholder) */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 text-lg">Sifarişinizin Özəti</h2>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-gray-600">2x Cheeseburger</span>
              <span className="text-gray-900 font-bold">18.00 ₼</span>
            </div>
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-gray-600">1x Coca Cola</span>
              <span className="text-gray-900 font-bold">2.50 ₼</span>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
            <span className="font-bold text-gray-500">Cəmi:</span>
            <span className="text-xl font-black text-indigo-600">20.50 ₼</span>
          </div>
        </div>

        {/* Customer Details Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-gray-900 text-lg">Şəxsi Məlumatlar</h2>
          </div>
          <p className="text-xs font-medium text-gray-500 mb-4">
            Xal qazanmaq və xüsusi endirimlərdən faydalanmaq üçün məlumatlarınızı daxil edin.
          </p>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Adınız <span className="text-red-500">*</span></label>
            <input 
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Məsələn: Əli Məmmədov"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Mobil Nömrəniz <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="w-4 h-4 text-gray-400" />
              </div>
              <input 
                type="tel"
                required
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="+994 (00) 000 00 00"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Mətbəx üçün qeydiniz (İstəyə bağlı)</label>
            <textarea 
              value={formData.note}
              onChange={e => setFormData({...formData, note: e.target.value})}
              placeholder="Məsələn: Əlavə sous olsun..."
              rows={2}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-gray-900 resize-none"
            />
          </div>
          
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                İcra olunur...
              </>
            ) : (
              'Sifarişi Təsdiqlə (20.50 ₼)'
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
