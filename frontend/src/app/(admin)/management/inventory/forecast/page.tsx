"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2, TrendingUp, AlertCircle, Sparkles, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';

interface Prediction {
  id: number;
  item_name: string;
  current_stock: number;
  unit: string;
  predicted_depletion_days: number;
  recommended_reorder: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence_score: number;
}

export default function StockPredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // We'll generate dummy predictions based on inventory items for demonstration
  // In a real scenario, this would call an AI/ML endpoint like /api/analytics/stock-predictions/
  const fetchPredictions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/inventory/inventoryitem/');
      const items = response.data;
      
      const generatedPredictions = items.map((item: any) => {
        // Mock prediction logic
        const depletionDays = Math.floor(Math.random() * 14) + 1;
        const trend = depletionDays < 5 ? 'increasing' : (depletionDays > 10 ? 'decreasing' : 'stable');
        return {
          id: item.id,
          item_name: item.name,
          current_stock: parseFloat(item.current_quantity || 0),
          unit: item.unit,
          predicted_depletion_days: depletionDays,
          recommended_reorder: Math.floor(parseFloat(item.minimum_quantity || 10) * 1.5),
          trend: trend,
          confidence_score: Math.floor(Math.random() * 20) + 80 // 80-99%
        };
      }).sort((a: any, b: any) => a.predicted_depletion_days - b.predicted_depletion_days);
      
      setPredictions(generatedPredictions);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const filteredPredictions = predictions.filter(p => p.item_name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Sparkles className="w-32 h-32 text-indigo-600" />
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">AI Stok Təxminləri</h1>
            <p className="text-gray-500 font-medium text-sm mt-0.5">Süni intellekt əsaslı tükənmə proqnozları</p>
          </div>
        </div>
        
        <div className="relative w-full sm:w-64 z-10">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Məhsul axtar..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
           <div className="col-span-full flex justify-center py-10">
             <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
           </div>
        ) : filteredPredictions.map(pred => (
          <div key={pred.id} className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className={`absolute top-0 left-0 w-1 h-full ${pred.predicted_depletion_days <= 3 ? 'bg-red-500' : pred.predicted_depletion_days <= 7 ? 'bg-orange-400' : 'bg-emerald-400'}`}></div>
            
            <div className="flex justify-between items-start mb-4 pl-2">
              <h3 className="font-bold text-gray-900 text-lg leading-tight">{pred.item_name}</h3>
              <div className="bg-indigo-50 text-indigo-700 text-xs font-black px-2 py-1 rounded-lg">
                %{pred.confidence_score}
              </div>
            </div>

            <div className="pl-2 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Mövcud Stok</span>
                <span className="font-bold text-gray-900">{pred.current_stock} {pred.unit}</span>
              </div>
              
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-400 block mb-1">Təxmini Tükənmə</span>
                  <div className="flex items-center gap-1.5">
                    {pred.predicted_depletion_days <= 3 ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    )}
                    <span className={`font-black ${pred.predicted_depletion_days <= 3 ? 'text-red-600' : 'text-gray-900'}`}>
                      {pred.predicted_depletion_days} gün
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 block mb-1">Tələbat</span>
                  {pred.trend === 'increasing' ? (
                    <span className="flex items-center justify-end text-red-500 font-bold text-sm"><ArrowUpRight className="w-4 h-4 mr-0.5"/> Artır</span>
                  ) : pred.trend === 'decreasing' ? (
                    <span className="flex items-center justify-end text-emerald-500 font-bold text-sm"><ArrowDownRight className="w-4 h-4 mr-0.5"/> Azalır</span>
                  ) : (
                    <span className="text-gray-500 font-bold text-sm">Sabit</span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Tövsiyə olunan sifariş:</span>
                <span className="font-black text-indigo-600">{pred.recommended_reorder} {pred.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
