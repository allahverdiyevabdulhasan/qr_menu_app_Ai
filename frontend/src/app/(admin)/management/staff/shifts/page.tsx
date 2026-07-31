"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2, Clock, Search, PlusCircle, X, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface StaffProfile {
  id: number;
  user_details: {
    first_name: string;
    last_name: string;
    username: string;
  };
}

interface StaffShift {
  id: number;
  staff: number;
  staff_details?: StaffProfile; // Assuming the backend returns some nested details or we can fetch them
  date: string;
  check_in: string;
  check_out: string | null;
  hourly_rate: string;
  calculated_earnings: string;
  is_paid: boolean;
}

export default function ManagementStaffShiftsPage() {
  const [shifts, setShifts] = useState<StaffShift[]>([]);
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    staff: '',
    date: new Date().toISOString().split('T')[0],
    check_in: '',
    check_out: '',
    hourly_rate: '0.00'
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [shiftsRes, staffRes] = await Promise.all([
        api.get('/staff/staffshift/'),
        api.get('/staff/staffprofile/')
      ]);
      setShifts(shiftsRes.data);
      setStaffList(staffRes.data);
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

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Format datetimes correctly for backend
      const checkInDateTime = `${formData.date}T${formData.check_in}:00`;
      const checkOutDateTime = formData.check_out ? `${formData.date}T${formData.check_out}:00` : null;

      await api.post('/staff/staffshift/', {
        ...formData,
        check_in: checkInDateTime,
        check_out: checkOutDateTime,
      });
      toast.success('Növbə uğurla əlavə edildi!');
      setIsModalOpen(false);
      setFormData({
        staff: '',
        date: new Date().toISOString().split('T')[0],
        check_in: '',
        check_out: '',
        hourly_rate: '0.00'
      });
      fetchData();
    } catch (err: any) {
      toast.error('Növbə əlavə edilərkən xəta baş verdi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredShifts = shifts.filter(shift => {
    // If backend doesn't send staff details, we have to find it manually
    const staff = staffList.find(s => s.id === shift.staff);
    const fullName = staff ? `${staff.user_details?.first_name || ''} ${staff.user_details?.last_name || staff.user_details?.username}`.toLowerCase() : '';
    return fullName.includes(searchQuery.toLowerCase()) || shift.date.includes(searchQuery);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center border border-cyan-100 shadow-sm">
            <Clock className="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">İşçi Növbələri</h1>
            <p className="text-gray-500 font-medium text-sm mt-0.5">Vardiya İdarəetməsi</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="İşçi axtar..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Yeni Növbə
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm min-h-[400px] overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
            <p className="text-gray-500 font-medium">Məlumatlar yüklənir...</p>
          </div>
        ) : filteredShifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-8">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
              <Clock className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Məlumat Tapılmadı</h2>
            <p className="text-gray-500 max-w-sm">Axtarışa uyğun və ya qeydiyyata alınmış heç bir növbə (vardiya) yoxdur.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">İşçi</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Tarix</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Giriş / Çıxış</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Saatlıq (₺)</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Qazanc (₺)</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredShifts.map((shift) => {
                  const staff = staffList.find(s => s.id === shift.staff);
                  return (
                    <tr key={shift.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-900">
                        {staff ? `${staff.user_details?.first_name || ''} ${staff.user_details?.last_name || staff.user_details?.username}` : 'Bilinməyən'}
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-600">
                        {shift.date}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        <span className="font-semibold text-green-600">{new Date(shift.check_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        {' - '}
                        <span className="font-semibold text-red-600">{shift.check_out ? new Date(shift.check_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Davam edir'}</span>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-600">
                        {shift.hourly_rate}
                      </td>
                      <td className="py-4 px-6 font-black text-gray-900">
                        {shift.calculated_earnings}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {shift.is_paid ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Ödənilib
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full">
                            Gözləyir
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Shift Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-cyan-600" />
                Yeni Növbə
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-200 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateShift} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">İşçi <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={formData.staff}
                  onChange={(e) => setFormData({...formData, staff: e.target.value})}
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all bg-white font-medium text-gray-700"
                >
                  <option value="" disabled>İşçi seçin</option>
                  {staffList.map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {staff.user_details?.first_name || ''} {staff.user_details?.last_name || staff.user_details?.username}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Tarix <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Giriş Saatı <span className="text-red-500">*</span></label>
                  <input 
                    type="time" 
                    required
                    value={formData.check_in}
                    onChange={(e) => setFormData({...formData, check_in: e.target.value})}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Çıxış Saatı</label>
                  <input 
                    type="time"
                    value={formData.check_out}
                    onChange={(e) => setFormData({...formData, check_out: e.target.value})}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Saatlıq Ödəniş (₺)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>
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
                  className="flex-1 px-4 py-2.5 bg-cyan-600 text-white rounded-xl font-bold text-sm hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
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
