"use client";
import React, { useState } from 'react';
import { Sparkles, Bot, Wallet, MessageCircle, ChevronLeft, Send, X, Users } from 'lucide-react';
import { useTranslation } from '@/components/LanguageProvider';
import { useParams, useRouter } from 'next/navigation';

export default function AIPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [activeView, setActiveView] = useState<'main' | 'chat' | 'budget'>('main');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [peopleCount, setPeopleCount] = useState(1);
  
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Merhaba! Ben NeyMenu AI. Size nasıl yardımcı olabilirim? Menüyle ilgili soru sorabilir veya bütçenizi söyleyebilirsiniz.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: chatInput }]);
    const userText = chatInput;
    setChatInput('');
    
    // Fake AI response delay
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: `Harika! "${userText}" talebinizi anladım. Şu anda demo modunda olduğum için gerçek menü verisini işleyemiyorum, ancak yakında size özel enfes öneriler sunacağım!` 
      }]);
    }, 1000);
  };

  const handleBudgetSubmit = () => {
    if (!budgetAmount) return;
    setActiveView('chat');
    setMessages([
      { sender: 'ai', text: `Harika! ${peopleCount} kişi için toplam ${budgetAmount} ₺ bütçeniz var. Size en uygun menü kombinasyonunu hazırlıyorum...` }
    ]);
  };
  
  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500">
      {activeView === 'main' && (
        <div className="px-5 pt-8 pb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-b-3xl shadow-md flex-shrink-0 relative">
          <button onClick={() => router.push(`/m/${slug}`)} className="absolute top-4 left-4 w-8 h-8 bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center mt-6">
            <Sparkles className="mr-2" size={24} />
            {t('nav_ai', { defaultValue: 'NeyMenu AI' })}
          </h1>
          <p className="text-indigo-100 text-sm mt-1 font-medium">Size nasıl yardımcı olabilirim?</p>
        </div>
      )}

      {activeView === 'main' && (
        <div className="flex-1 p-5 flex flex-col space-y-6 overflow-y-auto">
        
        {/* Ana Bilgi Kartı */}
        <div className="bg-zinc-50 border border-zinc-100 rounded-[24px] p-5">
          <div className="flex gap-4">
            <div className="w-12 h-12 shrink-0 bg-white shadow-sm border border-zinc-100 rounded-full flex items-center justify-center">
              <Bot size={24} className="text-zinc-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 flex items-center">
                Yapay Zeka Asistanı <Sparkles size={16} className="ml-1.5 text-zinc-400" />
              </h2>
              <p className="text-[13px] text-zinc-500 font-medium leading-relaxed mt-1.5 pr-2">
                Sizin için size özel öneriler alabilir, bütçenize göre en iyi menüyü saniyeler içinde oluşturabilirsiniz.
              </p>
            </div>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button onClick={() => setActiveView('budget')} className="flex-1 bg-white border border-zinc-200 hover:border-zinc-300 transition-colors rounded-2xl py-3.5 px-4 flex justify-center items-center gap-2 shadow-sm text-sm font-bold text-zinc-700 active:scale-95">
              <Wallet size={18} />
              Bütçe Planla
            </button>
            <button onClick={() => setActiveView('chat')} className="flex-1 bg-zinc-900 hover:bg-zinc-800 transition-colors rounded-2xl py-3.5 px-4 flex justify-center items-center gap-2 shadow-sm text-sm font-bold text-white active:scale-95">
              <MessageCircle size={18} />
              Asistanla Görüş
            </button>
          </div>
          <button onClick={() => router.push(`/m/${slug}`)} className="w-full bg-white border border-zinc-200 hover:border-zinc-300 transition-colors rounded-2xl py-3.5 px-4 flex justify-center items-center gap-2 shadow-sm text-sm font-bold text-zinc-700 active:scale-95">
            <Sparkles size={18} className="text-zinc-500" />
            Sadece Bana Özel Önerileri Göster
          </button>
        </div>

      </div>
      )}

      {/* CHAT VIEW */}
      {activeView === 'chat' && (
        <div className="flex-1 flex flex-col h-full bg-zinc-50 animate-in slide-in-from-right duration-300">
          <div className="bg-white px-5 pt-8 pb-4 flex items-center gap-4 shadow-sm z-10">
            <button onClick={() => setActiveView('main')} className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center active:scale-95 text-zinc-700">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="font-bold text-zinc-900 flex items-center">
                NeyMenu AI <Sparkles size={14} className="text-indigo-500 ml-1.5" />
              </h2>
              <p className="text-[11px] text-emerald-600 font-bold tracking-wide">ÇEVRİMİÇİ</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 text-[13px] font-medium leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-zinc-700 border border-zinc-100 rounded-bl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white border-t border-zinc-100 flex gap-2">
            <input 
              type="text" 
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Asistana mesaj yazın..." 
              className="flex-1 bg-zinc-100 border-none rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button onClick={handleSendMessage} className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white active:scale-95 shadow-md shadow-indigo-200">
              <Send size={18} className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* BUDGET MODAL */}
      {activeView === 'budget' && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full rounded-t-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-300 p-6 pb-12">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-zinc-900 flex items-center">
                <Wallet size={20} className="mr-2 text-indigo-600" /> Bütçe Planla
              </h3>
              <button onClick={() => setActiveView('main')} className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 active:scale-95">
                <X size={18} />
              </button>
            </div>
            
            <p className="text-sm text-zinc-500 mb-6 font-medium">
              Bütçenizi girin, size ve arkadaşlarınıza en uygun menü kombinasyonlarını saniyeler içinde hazırlayalım.
            </p>
            
            <div className="relative mb-4">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-zinc-400 text-lg">₺</span>
              <input 
                type="number" 
                value={budgetAmount}
                onChange={e => setBudgetAmount(e.target.value)}
                placeholder="0.00" 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-10 pr-4 py-4 text-lg font-bold text-zinc-900 outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="mb-6 flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
              <span className="font-bold text-zinc-700 flex items-center text-sm">
                <Users size={18} className="mr-2 text-zinc-400" /> Kişi Sayısı
              </span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}
                  className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 active:scale-95 shadow-sm"
                >
                  -
                </button>
                <span className="font-bold text-lg w-4 text-center">{peopleCount}</span>
                <button 
                  onClick={() => setPeopleCount(peopleCount + 1)}
                  className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 active:scale-95 shadow-sm"
                >
                  +
                </button>
              </div>
            </div>
            
            <button onClick={handleBudgetSubmit} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl active:scale-95 transition-transform flex justify-center items-center shadow-lg shadow-indigo-200">
              <Sparkles size={18} className="mr-2" />
              Menü Oluştur
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
