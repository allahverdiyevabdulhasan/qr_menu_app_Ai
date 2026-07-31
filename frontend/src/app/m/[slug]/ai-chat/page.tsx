"use client";
import React, { use, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, ChevronLeft, Search, Send } from 'lucide-react';

export default function AIChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Merhaba Ahmet Bey! 👋 Bugün acı soslu bir şeyler mi arıyorsunuz yoksa hafif tatlar mı tercih edersiniz?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let response = "Harika bir tercih! Sizin için menümüzden lezzetli bir öneri buluyorum...";
      const lower = text.toLowerCase();
      if (lower.includes('protein') || lower.includes('et') || lower.includes('tavuk')) {
         response = "Protein ağırlıklı beslenmek istiyorsanız kesinlikle Izgara Antrikot veya Fırında Tavuk Kanat önerebilirim. Yanında taze salata ile mükemmel gider.";
      } else if (lower.includes('tatlı') || lower.includes('pasta')) {
         response = "Tatlı kriziniz varsa fırın sütlaç veya yoğun çikolatalı suflemiz tam size göre!";
      } else if (lower.includes('bütçe') || lower.includes('ucuz')) {
         response = "Bütçenize uygun doyurucu menüler isterseniz Bütçe Filtresi sayfamıza göz atabilirsiniz. Şu an kampanyalı burger menümüz var.";
      }
      
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <button onClick={() => router.push(`/m/${resolvedParams.slug}`)} className="p-2 bg-gray-100 rounded-full active:scale-95 transition-transform">
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-black flex items-center gap-2 text-gray-900">
          <Bot className="text-[#aa4dff]" fill="currentColor" size={20} /> Yapay Zeka Garson
        </h1>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="p-5 flex-1 flex flex-col max-h-[calc(100dvh-70px)]">
        <div ref={scrollRef} className="flex-1 bg-white border border-gray-100 rounded-3xl p-5 flex flex-col gap-4 overflow-y-auto mb-4 shadow-sm scroll-smooth">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'ai' && (
                <div className="w-10 h-10 rounded-full bg-[#aa4dff] flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot size={20} fill="currentColor" />
                </div>
              )}
              <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed max-w-[85%] font-medium ${msg.role === 'user' ? 'bg-[#aa4dff] text-white rounded-tr-none' : 'bg-gray-50 text-gray-700 rounded-tl-none border border-gray-100'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-[#aa4dff] flex items-center justify-center text-white shrink-0 shadow-md">
                <Bot size={20} fill="currentColor" />
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none shadow-sm text-gray-500 border border-gray-100 flex gap-1 items-center h-12 w-16 justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}

          {/* Quick Replies */}
          {messages.length === 1 && !isTyping && (
            <div className="flex flex-wrap gap-2 mt-auto pt-4 animate-in fade-in slide-in-from-bottom-4">
              <button onClick={() => handleSend("Protein ağırlıklı menüleriniz neler?")} className="px-5 py-2.5 bg-purple-50 text-purple-600 rounded-full text-[13px] font-bold border border-purple-100 shadow-sm active:scale-95 transition-transform">
                Protein ağırlıklı
              </button>
              <button onClick={() => handleSend("Tatlı krizim tuttu, ne önerirsin?")} className="px-5 py-2.5 bg-purple-50 text-purple-600 rounded-full text-[13px] font-bold border border-purple-100 shadow-sm active:scale-95 transition-transform">
                Tatlı krizim tuttu
              </button>
            </div>
          )}
        </div>

        <div className="relative mb-safe pb-2">
          <input 
            type="text" 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend(inputText)}
            placeholder="Ne yemek istersiniz? Yazın..." 
            className="w-full bg-white shadow-sm border border-gray-100 rounded-full py-4 pl-6 pr-14 text-sm font-medium focus:ring-2 focus:ring-purple-200 outline-none" 
          />
          <button 
            onClick={() => handleSend(inputText)}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-[#aa4dff] text-white rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-md"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
