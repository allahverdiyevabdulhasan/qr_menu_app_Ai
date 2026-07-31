"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2, FileText, Search, Printer, Calendar, ArrowRight, DollarSign, CreditCard, Banknote, Clock } from 'lucide-react';

export default function ManagementFinanceZReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/payments/zreport/');
      setReports(response.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredReports = reports.filter(r => 
    r.z_number?.toString().includes(searchQuery) ||
    new Date(r.created_at).toLocaleDateString('tr-TR').includes(searchQuery)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-[#121621] rounded-[20px] p-6 flex justify-between items-center relative overflow-hidden shadow-lg shadow-gray-900/5 mb-5 print:hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/20 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <FileText className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight mb-1">Geçmiş Z Raporları (Arşiv)</h1>
            <p className="text-gray-400 font-medium text-xs">Eski kasa kapanış raporlarınızı inceleyin veya yazdırın.</p>
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Z No veya Tarih Ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden print:hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Z No</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Tarih</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Vardiya Saatleri</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Sipariş (B/İ)</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Net Ciro</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.map(report => (
                  <tr key={report.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                        Z-{report.z_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 font-bold text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(report.created_at).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <Clock className="w-4 h-4 text-orange-400" />
                        {new Date(report.start_time).toLocaleString('tr-TR', {hour: '2-digit', minute:'2-digit'})} 
                        <ArrowRight className="w-3 h-3 text-gray-300" />
                        {new Date(report.end_time).toLocaleString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {report.completed_orders_count}
                        </span>
                        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                          {report.cancelled_orders_count}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-gray-900 text-lg">
                        ₼{Number(report.net_sales).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedReport(report)}
                        className="text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-colors border border-orange-100 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" /> Görüntüle
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">
                      Kayıt bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rapor Detay Modal */}
      {selectedReport && (
        <>
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #z-report-printable, #z-report-printable * {
                visibility: visible;
              }
              #z-report-printable {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 20px;
              }
            }
          `}</style>
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:bg-white print:p-0">
            <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:w-full print:max-w-full">
              <div className="bg-gray-900 p-6 flex justify-between items-start text-white print:hidden">
                <div>
                  <p className="text-sm font-bold text-white/60 uppercase tracking-wider">Z Raporu Arşivi</p>
                  <h2 className="text-2xl font-black mt-1">Z-{selectedReport.z_number}</h2>
                </div>
                <button onClick={() => setSelectedReport(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  X
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 print:bg-white print:border-none print:p-0" id="z-report-printable">
                  <div className="text-center border-b border-dashed border-gray-300 pb-4 mb-4">
                    <h3 className="font-black text-2xl text-gray-900">GÜN SONU (Z) RAPORU</h3>
                    <p className="font-bold text-gray-600 mt-1">Z No: {selectedReport.z_number}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(selectedReport.start_time).toLocaleString('tr-TR')} - {new Date(selectedReport.end_time).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Tamamlanan Sipariş:</span>
                      <span className="font-bold text-gray-900">{selectedReport.completed_orders_count} Adet</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">İptal Edilen Sipariş:</span>
                      <span className="font-bold text-gray-900">{selectedReport.cancelled_orders_count} Adet</span>
                    </div>
                    
                    <div className="border-t border-dashed border-gray-300 my-4 pt-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600 font-medium">Nakit:</span>
                        <span className="font-bold text-gray-900">₼{Number(selectedReport.cash_total).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600 font-medium">Kredi/Banka Kartı:</span>
                        <span className="font-bold text-gray-900">₼{Number(selectedReport.card_total).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600 font-medium">Yemek Kartı:</span>
                        <span className="font-bold text-gray-900">₼{Number(selectedReport.meal_card_total).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Online Ödeme:</span>
                        <span className="font-bold text-gray-900">₼{Number(selectedReport.online_total).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="border-t border-solid border-gray-900 my-4 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 font-black text-lg">TOPLAM CİRO:</span>
                        <span className="font-black text-2xl text-gray-900">₼{Number(selectedReport.net_sales).toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="text-center mt-8 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                      Oluşturulma: {new Date(selectedReport.created_at).toLocaleString('tr-TR')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 print:hidden flex gap-3">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" /> Yazdır / PDF İndir
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
