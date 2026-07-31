"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Send, Bot, User, Sparkles, Command, Loader2 } from 'lucide-react';

export default function AIAssistantPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/ai_engine/airecommendations/');
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

  const [input, setInput] = useState('');
  
  const [messages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Merhaba! Ben NeyMenu AI Asistanı. Restoranınızın verilerini analiz ediyor ve size yardımcı oluyorum. Bugün satışları artırmak veya maliyetleri düşürmek için ne yapabiliriz?'
    },
    {
      id: 2,
      role: 'user',
      content: 'Bugünkü genel durum nasıl? Hangi ürünlere odaklanmalıyım?'
    },
    {
      id: 3,
      role: 'assistant',
      content: 'Bugün Çarşamba. Geçmiş verilere göre öğleden sonraları kahve satışları yüksek oluyor ancak tatlı satışları düşük seyrediyor. \n\nÖnerim: **"Kahve + Tatlı"** menüsü oluşturarak kasa yanında tanıtım yapmanız. Mevcut tatlı stoğunuz (özellikle Cheesecake) 2 gün içinde tükenmezse israf olabilir.'
    }
  ]);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">AI Restoran Meneceri</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-gray-500">Sizin üçün hazırdır</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Günlük Rapor Al
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className={`p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-gray-900 text-white rounded-tr-sm shadow-md' 
                  : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm shadow-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
              
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors">
            <Command className="w-5 h-5" />
          </button>
          
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="AI Menecerə sual verin... (Məs: Bugün ən çox hansı masalar doludur?)"
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 text-gray-700 outline-none"
          />
          
          <button className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-colors shadow-md shadow-indigo-600/20">
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
        <div className="mt-2 text-center">
          <p className="text-[10px] text-gray-400 font-medium">NeyMenu AI biznes qərarlarınızda köməkçi olmaq üçün nəzərdə tutulub, maliyyə məsləhətçisi deyil.</p>
        </div>
      </div>
    </div>
  );
}
