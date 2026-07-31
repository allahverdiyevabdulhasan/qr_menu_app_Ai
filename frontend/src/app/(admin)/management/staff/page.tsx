'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { UserCheck, Plus, Search, Filter, Mail, Phone, Calendar as CalendarIcon, Clock, Edit } from 'lucide-react';

export default function StaffPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/staff/shifts/');
      setData(response.data);
      setError('');
    } catch (err: any) {
      setError('Məlumatları yükləmək mümkün olmadı.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const staff = [
    { id: 1, name: 'Ali Yılmaz', role: 'Şef', shift: '08:00 - 17:00', status: 'Mesaide', salary: '25,000₺', img: '👨‍🍳' },
    { id: 2, name: 'Ayşe Kaya', role: 'Garson', shift: '10:00 - 19:00', status: 'İzinde', salary: '17,000₺', img: '👩‍💼' },
    { id: 3, name: 'Mehmet Öz', role: 'Kasiyer', shift: '08:00 - 17:00', status: 'Mesaide', salary: '18,500₺', img: '👨‍💻' },
    { id: 4, name: 'Zeynep Demir', role: 'Komi', shift: '15:00 - 23:00', status: 'Mesai Dışı', salary: '14,000₺', img: '👧' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personel & Maaş</h1>
          <p className="text-sm text-gray-500 mt-1">Çalışan vardiyaları, maaşlar ve izin durumları</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Personel Ara..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-transparent rounded-xl text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition-all">
            <Plus size={16} />
            Yeni Personel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {staff.map(person => (
          <div key={person.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative group hover:shadow-md transition-shadow">
            <button className="absolute top-4 right-4 p-2 bg-gray-50 text-gray-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:text-indigo-600 hover:bg-indigo-50">
              <Edit size={16} />
            </button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl border border-gray-100 shadow-inner">
                {person.img}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{person.name}</h3>
                <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-1">
                  {person.role}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6 border-t border-gray-100 pt-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock size={16} className="mr-2 text-gray-400" />
                Vardiya: <strong className="ml-1 text-gray-900">{person.shift}</strong>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon size={16} className="mr-2 text-gray-400" />
                Durum: 
                <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                  person.status === 'Mesaide' ? 'bg-green-100 text-green-700' :
                  person.status === 'İzinde' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {person.status}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
              <span className="text-xs font-semibold text-gray-500">Aylık Maaş</span>
              <span className="font-bold text-gray-900">{person.salary}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button className="flex justify-center items-center gap-2 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                <Phone size={14} />
                Ara
              </button>
              <button className="flex justify-center items-center gap-2 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                <Mail size={14} />
                Mesaj
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
