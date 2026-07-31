'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { Calendar, Clock, Users, Plus, Phone, CheckCircle, XCircle } from 'lucide-react';

export default function ReservationsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/tables/tables/');
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

  const reservations = [
    { id: 1, name: 'Ahmet Demir', date: 'Bugün', time: '19:30', guests: 4, table: 'Masa 12', status: 'Onaylandı', phone: '0532 123 4567' },
    { id: 2, name: 'Ayşe Yıldız', date: 'Bugün', time: '20:00', guests: 2, table: 'Masa 8', status: 'Bekliyor', phone: '0555 987 6543' },
    { id: 3, name: 'VİP Şirket Yemeği', date: 'Yarın', time: '18:00', guests: 15, table: 'Özel Oda', status: 'Onaylandı', phone: '0530 456 7890' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rezervasyonlar</h1>
          <p className="text-sm text-gray-500 mt-1">Gelecek masa rezervasyonları ve doluluk durumu</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-transparent rounded-xl text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition-all">
          <Plus size={16} />
          Yeni Rezervasyon
        </button>
      </div>

      <div className="flex gap-6 flex-1">
        {/* Left: Mini Calendar / Stats */}
        <div className="w-80 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Takvim Özeti</h3>
            <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
              <span className="text-gray-500 text-sm font-medium">Bugün</span>
              <h4 className="text-3xl font-bold text-indigo-600 mt-1">19 Ekim</h4>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Bugünkü Rezervasyonlar</span>
                <span className="font-bold text-gray-900">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Gelecek 7 Gün</span>
                <span className="font-bold text-gray-900">14</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Reservations List */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
            <button className="px-4 py-1.5 bg-indigo-50 text-indigo-600 font-bold text-sm rounded-lg border border-indigo-100">
              Bugün
            </button>
            <button className="px-4 py-1.5 text-gray-600 font-medium text-sm rounded-lg hover:bg-gray-100">
              Yarın
            </button>
            <button className="px-4 py-1.5 text-gray-600 font-medium text-sm rounded-lg hover:bg-gray-100">
              Tümü
            </button>
          </div>

          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {reservations.map(res => (
              <div key={res.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center justify-center w-16 h-16 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
                    <Clock size={20} className="mb-1" />
                    <span className="font-bold text-sm">{res.time}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{res.name}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center"><Users size={14} className="mr-1" /> {res.guests} Kişi</span>
                      <span className="flex items-center"><Calendar size={14} className="mr-1" /> {res.table}</span>
                      <span className="flex items-center"><Phone size={14} className="mr-1" /> {res.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    res.status === 'Onaylandı' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {res.status}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Onayla">
                      <CheckCircle size={20} />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="İptal Et">
                      <XCircle size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
