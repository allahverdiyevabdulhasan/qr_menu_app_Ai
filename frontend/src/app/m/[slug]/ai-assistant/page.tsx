'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Send, Sparkles, User, Bot, Loader2, Info } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  recommendations?: any[];
}

export default function AIAssistantPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Merhaba! Ben restoranınızın yapay zeka asistanıyım. Ne tarz bir yemek arıyorsunuz? (Örn: Acı bir şeyler, hafif bir tatlı veya serinletici bir içecek...)'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('http://127.0.0.1:8000/api/public/ai/chat/', {
        restaurant_slug: resolvedParams.slug,
        message: userMessage.text
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.data.reply,
        recommendations: response.data.recommendations
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA] flex flex-col font-sans text-zinc-900 selection:bg-zinc-200">
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-[#FAFAFA]/80 backdrop-blur-xl border-b border-zinc-100 px-5 py-4 flex items-center justify-between">
         <button onClick={() => router.back()} className="w-10 h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-900 shadow-sm active:scale-95 transition-transform">
           <ChevronLeft size={20} strokeWidth={2.5}/>
         </button>
         <div className="flex flex-col items-center">
            <h1 className="font-bold text-[15px] tracking-tight flex items-center gap-1.5">
               <Sparkles size={16} className="text-emerald-500" /> Gurme Asistan
            </h1>
            <span className="text-[10px] text-emerald-500 font-bold tracking-widest uppercase">Çevrimiçi</span>
         </div>
         <div className="w-10 h-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-32">
         <div className="max-w-xl mx-auto space-y-6">
           
           <div className="flex justify-center mb-8">
              <div className="bg-zinc-100 text-zinc-500 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-2">
                 <Info size={14} /> Yapay Zeka Destekli Sohbet
              </div>
           </div>

           {messages.map((msg) => (
             <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
               
               <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                 
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-zinc-200 text-zinc-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                 </div>

                 <div>
                   <div className={`p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-zinc-900 text-white rounded-tr-sm' : 'bg-white border border-zinc-100 shadow-sm rounded-tl-sm text-zinc-800'}`}>
                     <p className="text-sm leading-relaxed">{msg.text}</p>
                   </div>
                   
                   {/* RECOMMENDATIONS */}
                   {msg.recommendations && msg.recommendations.length > 0 && (
                     <div className="mt-3 space-y-3">
                       {msg.recommendations.map((product: any) => (
                         <Link key={product.id} href={`/m/${resolvedParams.slug}/product/${product.id}`} className="flex gap-3 bg-white p-3 rounded-2xl border border-zinc-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all active:scale-[0.98]">
                            {product.image && (
                              <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover" />
                            )}
                            <div className="flex-1 flex flex-col justify-center">
                               <div className="font-bold text-sm text-zinc-900 line-clamp-1">{product.name}</div>
                               <div className="text-xs text-zinc-500 line-clamp-1 mb-1">{product.description || 'Lezzetli bir seçenek'}</div>
                               <div className="font-black text-sm text-emerald-600">{Number(product.price).toFixed(2)} ₺</div>
                            </div>
                         </Link>
                       ))}
                     </div>
                   )}
                 </div>

               </div>
             </div>
           ))}
           
           {isLoading && (
             <div className="flex justify-start animate-in fade-in">
               <div className="flex gap-3 max-w-[85%]">
                 <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} />
                 </div>
                 <div className="p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm rounded-tl-sm">
                   <Loader2 size={18} className="animate-spin text-emerald-500" />
                 </div>
               </div>
             </div>
           )}
           
           <div ref={messagesEndRef} />
         </div>
      </div>

      {/* INPUT AREA */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-zinc-100 p-4">
         <form onSubmit={handleSend} className="max-w-xl mx-auto flex gap-3 relative">
            <input 
              type="text" 
              placeholder="Asistana bir şey sorun..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl pl-5 pr-14 py-4 text-sm font-medium outline-none focus:border-emerald-400 focus:bg-white transition-all shadow-sm"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 bottom-2 w-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 shadow-sm"
            >
              <Send size={18} />
            </button>
         </form>
      </div>
    </div>
  );
}
