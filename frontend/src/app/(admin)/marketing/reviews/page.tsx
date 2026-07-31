"use client";
import React, { useState, useEffect } from "react";
import { Star, MessageCircle, Utensils, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

export default function ReviewsPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: [
      { stars: 5, pct: 0, color: "bg-emerald-500" },
      { stars: 4, pct: 0, color: "bg-emerald-400" },
      { stars: 3, pct: 0, color: "bg-yellow-400" },
      { stars: 2, pct: 0, color: "bg-orange-400" },
      { stars: 1, pct: 0, color: "bg-red-500" },
    ]
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Product Reviews as requested by user
      const response = await api.get('/reviews/productreviews/');
      const reviews = response.data || [];
      setData(reviews);
      
      if (reviews.length > 0) {
        let totalSum = 0;
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        
        reviews.forEach((r: any) => {
          const rating = r.rating || 5;
          totalSum += rating;
          if (counts[rating as keyof typeof counts] !== undefined) {
            counts[rating as keyof typeof counts]++;
          }
        });
        
        const total = reviews.length;
        const average = (totalSum / total).toFixed(1);
        
        setStats({
          average: parseFloat(average),
          total: total,
          distribution: [
            { stars: 5, pct: Math.round((counts[5] / total) * 100) || 0, color: "bg-emerald-500" },
            { stars: 4, pct: Math.round((counts[4] / total) * 100) || 0, color: "bg-emerald-400" },
            { stars: 3, pct: Math.round((counts[3] / total) * 100) || 0, color: "bg-yellow-400" },
            { stars: 2, pct: Math.round((counts[2] / total) * 100) || 0, color: "bg-orange-400" },
            { stars: 1, pct: Math.round((counts[1] / total) * 100) || 0, color: "bg-red-500" },
          ]
        });
      }
      
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

  const handleDelete = async (id: number) => {
    if (!confirm('Bu yorumu kalıcı olarak silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/reviews/productreviews/${id}/`);
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert('Yorum silinirken bir hata oluştu.');
    }
  };

  const displayData = data || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg shadow-orange-200 md:col-span-1 flex flex-col justify-center items-center text-center">
          <h2 className="text-lg font-bold text-orange-100 mb-2">Ortalama Puan</h2>
          <div className="text-6xl font-black mb-2">{stats.average > 0 ? stats.average : '0.0'}</div>
          <div className="flex space-x-1 mb-2">
            {[1,2,3,4,5].map(i => <Star key={i} className={`w-6 h-6 ${i <= Math.round(stats.average) ? 'fill-white text-white' : 'fill-orange-400/50 text-orange-300'}`} />)}
          </div>
          <p className="text-sm font-medium text-orange-100 mt-2">Toplam {stats.total} Değerlendirme</p>
        </div>
        
        <div className="md:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center">
          {/* Progress Bars for Ratings */}
          <div className="w-full max-w-md space-y-3">
            {(stats.total > 0 ? stats.distribution : [
              { stars: 5, pct: 0, color: "bg-emerald-500" },
              { stars: 4, pct: 0, color: "bg-emerald-400" },
              { stars: 3, pct: 0, color: "bg-yellow-400" },
              { stars: 2, pct: 0, color: "bg-orange-400" },
              { stars: 1, pct: 0, color: "bg-red-500" },
            ]).map((r) => (
              <div key={r.stars} className="flex items-center text-sm font-bold text-gray-600">
                <span className="w-12 flex items-center">{r.stars} <Star className="w-4 h-4 ml-1 fill-gray-400 text-gray-400" /></span>
                <div className="flex-1 h-3 mx-4 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${r.color} rounded-full transition-all duration-1000`} style={{ width: `${r.pct}%` }}></div>
                </div>
                <span className="w-10 text-right">% {r.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center">
          <MessageCircle className="w-6 h-6 text-gray-400 mr-3" />
          <h2 className="text-xl font-bold text-gray-800">Ürün Yorumları (Son Yorumlar)</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {displayData.map((review: any) => {
            const customerName = review.customer_name || (typeof review.customer === 'string' ? review.customer : `Müşteri #${review.customer || review.id}`);
            const initial = typeof customerName === 'string' && customerName.length > 0 ? customerName.charAt(0).toUpperCase() : 'M';
            const productName = review.product_name || 'Bilinməyən Məhsul';
            
            return (
              <div key={review.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center mr-3 flex-shrink-0">
                      {initial}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{customerName}</h4>
                      <div className="flex items-center mt-1 text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-md inline-flex">
                        <Utensils className="w-3 h-3 mr-1" />
                        {productName}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex space-x-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= (review.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />)}
                    </div>
                    <span className="text-xs text-gray-400 mt-1 mb-2">
                      {review.created_at ? new Date(review.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Bilinmiyor'}
                    </span>
                    <button 
                      onClick={() => handleDelete(review.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1 opacity-60 hover:opacity-100"
                      title="Yorumu Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-3 leading-relaxed ml-13 md:ml-14 pl-0">
                  "{review.comment}"
                </p>
              </div>
            );
          })}
          
          {displayData.length === 0 && !isLoading && (
            <div className="p-10 text-center text-gray-500 font-medium">
              Henüz ürün yorumu bulunmamaktadır.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
