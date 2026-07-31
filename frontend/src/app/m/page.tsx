"use client";
import React, { useState } from "react";
import { Search, Plus, Minus, Star, Heart, Flame, Utensils, Coffee, ShoppingBag, ChevronRight, Sparkles } from "lucide-react";

export default function CoolQRMenu() {
  const [activeCategory, setActiveCategory] = useState("Soğuk İçecekler");
  const [cart, setCart] = useState<{id: number, quantity: number}[]>([]);
  const [liked, setLiked] = useState<number[]>([]);

  const categories = [
    { name: "Özel", icon: Flame },
    { name: "Sıcak İçecekler", icon: Coffee },
    { name: "Soğuk İçecekler", icon: Utensils },
    { name: "Tatlılar", icon: Star },
  ];

  const products = [
    { id: 1, name: "Iced Americano", price: 70, category: "Soğuk İçecekler", desc: "100% Arabica çekirdeklerinden buz gibi taze çekilmiş espresso.", img: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=600&auto=format&fit=crop", rating: 4.5, isPopular: true },
    { id: 2, name: "Ev Yapımı Limonata", price: 65, category: "Soğuk İçecekler", desc: "Taze sıkılmış limon, nane yaprakları ve hafif şekerli ferahlatıcı lezzet.", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop", rating: 4.8 },
    { id: 3, name: "Karamel Macchiato", price: 85, category: "Sıcak İçecekler", desc: "Zengin espresso, kadifemsi süt ve pürüzsüz karamel sosu.", img: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=600&auto=format&fit=crop", rating: 4.9, isPopular: true },
    { id: 4, name: "San Sebastian", price: 160, category: "Tatlılar", desc: "Orijinal tarifiyle yanık üstü ve kremamsı nefis akışkan cheesecake.", img: "https://images.unsplash.com/photo-1615837197154-2e801f413c77?q=80&w=600&auto=format&fit=crop", rating: 5.0, isPopular: true },
    { id: 5, name: "Truffle Burger", price: 280, category: "Özel", desc: "180gr dana köfte, cheddar, karamelize soğan, trüf mantarı mayonezi.", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop", rating: 4.9 },
  ];

  const addToCart = (id: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) return prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { id, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing && existing.quantity > 1) return prev.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item);
      return prev.filter(item => item.id !== id);
    });
  };

  const toggleLike = (id: number) => {
    setLiked(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  }

  const getQuantity = (id: number) => cart.find(item => item.id === id)?.quantity || 0;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const filteredProducts = products.filter(p => p.category === activeCategory);

  return (
    <div className="flex-1 flex flex-col bg-[#F4F6F9] min-h-screen pb-32 font-sans selection:bg-[#FF004D] selection:text-white">
      {/* Sleek Dark Header */}
      <header className="bg-gradient-to-b from-[#0A0D14] to-[#121621] px-6 pt-12 pb-10 rounded-b-[40px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] relative overflow-hidden z-10">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF004D]/10 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-1 mb-1 opacity-90">
              <Sparkles className="w-3 h-3 text-[#FF004D]" />
              <p className="text-[#FF004D] text-[9px] font-black tracking-[0.2em] uppercase">Hoş Geldiniz</p>
            </div>
            <div className="flex items-center mt-1">
              <span className="bg-[#FF004D] text-white px-2.5 py-1 text-xl font-black rounded-lg tracking-tight leading-none shadow-[0_4px_15px_rgba(255,0,77,0.4)]">
                NeyMenu
              </span>
              <span className="text-white text-2xl font-black ml-2 tracking-tight leading-none drop-shadow-sm">
                Bistro
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-center bg-white/5 backdrop-blur-xl rounded-2xl w-14 h-14 justify-center relative shadow-inner border border-white/10 group">
            <span className="text-white font-black text-xl leading-none">12</span>
            <div className="bg-[#FF004D] text-white text-[7px] font-black px-3 py-1 rounded-full absolute -bottom-2.5 tracking-[0.2em] shadow-lg">
              MASA
            </div>
          </div>
        </div>
        
        {/* Cool Search Bar */}
        <div className="relative z-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Ne yemek istersiniz?" 
            className="w-full pl-11 pr-4 py-4 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl text-sm focus:ring-1 focus:ring-[#FF004D] focus:bg-white/[0.06] focus:border-[#FF004D]/50 outline-none text-white placeholder-gray-500 font-medium transition-all shadow-inner"
          />
        </div>
      </header>

      {/* Modern Categories */}
      <div className="px-2 pt-8 relative z-0">
        <div className="flex overflow-x-auto gap-3 px-4 pb-4 scrollbar-hide snap-x">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`snap-center flex flex-col items-center justify-center min-w-[95px] h-[105px] rounded-[28px] transition-all duration-400 border ${
                  isActive 
                    ? 'bg-[#121621] text-white border-[#121621] shadow-[0_12px_25px_rgba(18,22,33,0.25)] transform -translate-y-1' 
                    : 'bg-white text-gray-400 border-white shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]'
                }`}
              >
                <div className={`mb-3 p-3 rounded-full transition-colors ${isActive ? 'bg-white/10' : 'bg-gray-50'}`}>
                  <Icon className={`w-5 h-5 stroke-[2] ${isActive ? 'text-[#FF004D]' : 'text-gray-400'}`} />
                </div>
                <span className={`text-[11px] font-bold text-center leading-tight px-2 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  {cat.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Minimalist Title Section */}
      <div className="flex justify-between items-end px-6 mt-4 mb-4">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{activeCategory}</h2>
        <span className="text-xs font-bold text-gray-400 bg-gray-200/50 px-2.5 py-1 rounded-full">{filteredProducts.length} Ürün</span>
      </div>

      {/* Elegant Product Cards */}
      <div className="flex-1 px-6 space-y-5">
        {filteredProducts.map((product, idx) => {
          const quantity = getQuantity(product.id);
          const isLiked = liked.includes(product.id);
          return (
            <div 
              key={product.id} 
              className="bg-white rounded-[28px] p-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex gap-4 transition-all duration-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              
              {/* Image Container */}
              <div className="w-[120px] h-[135px] rounded-[22px] overflow-hidden flex-shrink-0 relative group">
                <img src={product.img} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
                
                {product.isPopular && (
                  <span className="absolute bottom-2 left-2 bg-[#FF004D] text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                    Popüler
                  </span>
                )}
                
                <button 
                  onClick={() => toggleLike(product.id)}
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white transition-all duration-300 border border-white/20 hover:bg-white hover:text-[#FF004D]"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#FF004D] text-[#FF004D]' : ''}`} />
                </button>
              </div>
              
              {/* Info Container */}
              <div className="flex-1 flex flex-col justify-between py-2 pr-2">
                <div>
                  <h3 className="text-[16px] font-bold text-gray-900 leading-tight mb-1">{product.name}</h3>
                  <p className="text-[11px] font-medium text-gray-400 leading-relaxed line-clamp-2">{product.desc}</p>
                </div>
                
                <div className="flex flex-col mt-3 gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center text-[11px] font-bold text-gray-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" /> {product.rating}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xl font-black text-gray-900 tracking-tight">₺{product.price}</span>
                    
                    {quantity > 0 ? (
                      <div className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-100 shadow-inner">
                        <button onClick={() => removeFromCart(product.id)} className="w-8 h-8 flex items-center justify-center text-gray-600 bg-white shadow-sm rounded-full active:scale-90 transition-all"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="w-8 text-center font-bold text-gray-900 text-sm">{quantity}</span>
                        <button onClick={() => addToCart(product.id)} className="w-8 h-8 flex items-center justify-center text-white bg-[#121621] shadow-md shadow-[#121621]/30 rounded-full active:scale-90 transition-all"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(product.id)} className="w-10 h-10 bg-[#F4F6F9] text-gray-900 rounded-full flex items-center justify-center hover:bg-[#121621] hover:text-white transition-all duration-300 active:scale-90">
                        <Plus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Cart */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[400px] px-6 z-50 animate-in slide-in-from-bottom-8 fade-in duration-500">
          <button className="w-full bg-[#121621] text-white rounded-[24px] p-3 pl-4 flex justify-between items-center shadow-[0_20px_40px_rgba(18,22,33,0.3)] active:scale-[0.98] transition-all group overflow-hidden relative border border-white/5">
            {/* Subtle glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF004D]/20 rounded-full blur-[40px] pointer-events-none transition-all group-hover:bg-[#FF004D]/30"></div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="bg-[#FF004D] p-3 rounded-[16px] shadow-lg relative">
                <ShoppingBag className="w-5 h-5 text-white" />
                <span className="absolute -top-2 -right-2 bg-white text-[#121621] text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                  {totalItems}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Siparişiniz</p>
                <p className="text-xl font-black leading-none tracking-tight">₺{totalPrice}</p>
              </div>
            </div>
            
            <div className="flex items-center text-sm font-bold bg-white/10 px-5 py-3.5 rounded-xl group-hover:bg-white/20 transition-colors relative z-10 backdrop-blur-sm">
              Tamamla <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
