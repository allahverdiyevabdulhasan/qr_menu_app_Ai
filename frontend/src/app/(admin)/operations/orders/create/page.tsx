"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { api } from '@/lib/api';
import { Loader2, Search, CreditCard, Plus, Minus, Trash2, ShoppingBag, MapPin, ArrowLeft, CheckCircle2, ClipboardList, Store } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  price: string | number;
  display_image: string;
  category: number;
}

interface Category {
  id: number;
  name: string;
}

interface CartItem extends Product {
  cart_id: string; // unique ID for cart item to allow same product with different prices
  quantity: number | string;
  unit_price: number | string;
  item_note?: string;
}

function POSContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingOrder, setExistingOrder] = useState<any>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const tableId = searchParams?.get('table_id');
  const orderId = searchParams?.get('order_id');
  const source = searchParams?.get('source');
  const [searchQuery, setSearchQuery] = useState('');

  // Table & Order Type States
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('TAKEAWAY');
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTableForOrder, setSelectedTableForOrder] = useState<number | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const promises: Promise<any>[] = [
          api.get('/menu/product/'),
          api.get('/menu/category/'),
          api.get('/tables/restauranttable/')
        ];
        
        if (orderId) {
          promises.push(api.get(`/orders/order/${orderId}/`));
        }

        const results = await Promise.all(promises);
        setProducts(results[0].data);
        setCategories(results[1].data);
        setTables(results[2].data);
        
        if (orderId && results[3]) {
          setExistingOrder(results[3].data);
        }
      } catch (err) {
        console.error("Menu/Order fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, [orderId]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.unit_price === Number(product.price));
      if (existing) {
        return prev.map(item => item.cart_id === existing.cart_id ? { ...item, quantity: Number(item.quantity) + 1 } : item);
      }
      return [...prev, { ...product, cart_id: Math.random().toString(36).substr(2, 9), quantity: 1, unit_price: Number(product.price) }];
    });
  };

  const updateQuantity = (cartId: string, value: number | string, isDelta: boolean = true) => {
    setCart(prev => {
      const newCart = [...prev];
      const index = newCart.findIndex(item => item.cart_id === cartId);
      if (index !== -1) {
        if (isDelta) {
          const current = Number(newCart[index].quantity) || 0;
          const newQ = current + Number(value);
          if (newQ <= 0) {
            return prev.filter(item => item.cart_id !== cartId);
          }
          newCart[index].quantity = Math.round(newQ * 10) / 10;
        } else {
          const parsed = parseFloat(value as string);
          if (!isNaN(parsed) && parsed <= 0) {
             return prev.filter(item => item.cart_id !== cartId);
          }
          newCart[index].quantity = value;
        }
      }
      return newCart;
    });
  };

  const updatePrice = (cartId: string, newPrice: number | string) => {
    setCart(prev => prev.map(item => {
      if (item.cart_id === cartId) {
        return { ...item, unit_price: newPrice };
      }
      return item;
    }));
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cart_id !== cartId));
  };

  const cartTotal = cart.reduce((total, item) => total + ((Number(item.unit_price) || 0) * (Number(item.quantity) || 0)), 0);

  const submitOrder = async () => {
    if (cart.length === 0) return;
    if (!orderId && !tableId && orderType === 'DINE_IN' && !selectedTableForOrder) {
      alert("Lütfen masa seçin.");
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsPayload = cart.map(item => ({
        product: item.id,
        quantity: Number(item.quantity) || 0,
        unit_price: Number(item.unit_price) || 0,
        total_price: (Number(item.unit_price) || 0) * (Number(item.quantity) || 0),
        note: item.item_note || ''
      }));

      if (orderId) {
        await api.post(`/orders/order/${orderId}/add_items/`, { items: itemsPayload });
        alert('Məhsullar sifarişə əlavə edildi!');
      } else {
        const orderPayload: any = {
          order_type: orderType,
          status: 'NEW',
          total_amount: cartTotal,
          items: itemsPayload
        };
        
        if (tableId) {
          orderPayload.table = parseInt(tableId);
        } else if (orderType === 'DINE_IN' && selectedTableForOrder) {
          orderPayload.table = selectedTableForOrder;
        }
        await api.post('/orders/order/', orderPayload);

        if (orderType === 'DINE_IN' && selectedTableForOrder) {
          await api.patch(`/tables/restauranttable/${selectedTableForOrder}/`, { status: 'OCCUPIED' });
        }

        alert('Yeni sifariş uğurla yaradıldı!');
      }
      
      setCart([]);
      if (source === 'cashier') {
        router.push('/operations/cashier');
      } else {
        router.push('/operations/waiter'); 
      }
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.traceback) {
        alert('Server xətası:\\n' + err.response.data.error + '\\n\\nBunu asistanınıza kopyalayın:\\n' + err.response.data.traceback);
      } else if (err.response && err.response.data) {
        alert('Xəta baş verdi: ' + JSON.stringify(err.response.data));
      } else {
        alert('Xəta baş verdi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeExistingItem = async (itemId: number) => {
    if (!orderId) return;
    if (!confirm('Bu məhsulu mövcud sifarişdən çıxarmaq istədiyinizə əminsiniz?')) return;
    
    try {
      await api.post(`/orders/order/${orderId}/remove_item/`, { item_id: itemId });
      // Refresh order details to update the UI
      const res = await api.get(`/orders/order/${orderId}/`);
      setExistingOrder(res.data);
    } catch (err: any) {
      alert('Xəta baş verdi: ' + err.message);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Menyu yüklənir...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6">
      
      {/* Left Column: Menu Items */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white shadow-sm relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 -z-10 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 z-10">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-3 bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.06)] border border-gray-100 hover:scale-105 transition-transform">
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                      {orderId ? 'Siparişe Ürün Ekle/Çıkar' : 'Sifariş Yarat'}
                    </h1>
                    <div className="flex gap-2 flex-wrap mt-1">
                      {existingOrder && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-lg border border-orange-100">
                          <ClipboardList className="w-3.5 h-3.5" /> Sipariş: {existingOrder.tracking_code || `#${existingOrder.id}`}
                        </span>
                      )}
                      {tableId && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                          <MapPin className="w-3.5 h-3.5" /> Masa {tableId}
                        </span>
                      )}
                      {existingOrder?.table && !tableId && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                          <MapPin className="w-3.5 h-3.5" /> {existingOrder.table}
                        </span>
                      )}
                    </div>
                </div>
            </div>
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Məhsul axtar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all shadow-sm"
              />
            </div>
        </div>

        {/* Categories Bar */}
        <div className="flex overflow-x-auto gap-3 pb-4 mb-2 no-scrollbar z-10 mask-fade-right">
          <button 
            onClick={() => setActiveCategory('all')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 flex items-center gap-2
              ${activeCategory === 'all' 
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 scale-105' 
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200 hover:text-gray-900 hover:scale-105'}`}
          >
            Hamısı
          </button>
          {categories.map(c => (
            <button 
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 flex items-center gap-2
                ${activeCategory === c.id 
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 scale-105' 
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200 hover:text-gray-900 hover:scale-105'}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto pr-2 pb-20 lg:pb-0 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 items-start z-10 custom-scrollbar">
          {filteredProducts.map(p => {
             const cartCount = cart.filter(item => item.id === p.id).reduce((sum, item) => sum + Number(item.quantity), 0);
             return (
              <div 
                key={p.id} 
                onClick={() => addToCart(p)}
                className="group relative bg-white p-3 rounded-[20px] border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col"
              >
                {cartCount > 0 && (
                  <div className="absolute top-1 right-1 z-20 w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-xs shadow-md border-2 border-white transform scale-in">
                    {cartCount}
                  </div>
                )}
                <div className="relative h-32 w-full rounded-2xl overflow-hidden bg-gray-50 mb-3">
                  <img src={p.display_image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                     <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg text-gray-900">
                        <Plus className="w-5 h-5" />
                     </div>
                  </div>
                </div>
                <div className="px-1 flex flex-col">
                  <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">{p.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <div className="font-black text-[17px] text-gray-900">₼{Number(p.price).toFixed(2)}</div>
                    <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                      <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                 <Search className="w-8 h-8 text-gray-300" />
               </div>
               <h3 className="text-lg font-bold text-gray-900 mb-1">Məhsul Tapılmadı</h3>
               <p className="text-gray-500 font-medium">Fərqli bir kateqoriya və ya axtarış sözü sınayın.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Cart */}
      <div className="w-full lg:w-[480px] bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col h-full mt-14 lg:mt-0 relative overflow-hidden">
        {/* Subtle top accent line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>

        <div className="p-7 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {orderId ? 'Sifariş Detayı' : 'Səbət'}
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              {orderId ? 'Siparişteki ürünleri yönetin' : 'Cari Sifariş Təfərrüatları'}
            </p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 relative">
            <ShoppingBag className="w-6 h-6" />
            {(cart.length > 0 || (existingOrder?.items?.length > 0)) && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                {cart.reduce((a, b) => a + Number(b.quantity), 0) + (existingOrder?.items?.length || 0)}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-7 space-y-5 custom-scrollbar">
          
          {/* Sipariş Tipi ve Masa Seçimi (Yalnızca Yeni Sipariş İçin) */}
          {!orderId && !tableId && (
            <div className="mb-6 space-y-4">
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Sipariş Tipi</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setOrderType('TAKEAWAY')}
                      className={`py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-1 border-2 transition-all ${orderType === 'TAKEAWAY' ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                    >
                      <ShoppingBag size={20} />
                      <span className="text-sm">Paket Servis</span>
                    </button>
                    <button 
                      onClick={() => setOrderType('DINE_IN')}
                      className={`py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-1 border-2 transition-all ${orderType === 'DINE_IN' ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                    >
                      <Store size={20} />
                      <span className="text-sm">Masa</span>
                    </button>
                  </div>
               </div>

               {orderType === 'DINE_IN' && (
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Boş Masalar</label>
                    <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
                      {tables.filter(t => t.status === 'AVAILABLE').map(table => (
                        <button 
                          key={table.id}
                          onClick={() => setSelectedTableForOrder(table.id)}
                          className={`py-2.5 rounded-lg font-black text-sm border-2 transition-all flex items-center justify-center gap-1 ${selectedTableForOrder === table.id ? 'bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20' : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'}`}
                        >
                          {table.table_number}
                        </button>
                      ))}
                      {tables.filter(t => t.status === 'AVAILABLE').length === 0 && (
                        <span className="text-xs text-rose-500 col-span-3 font-bold bg-rose-50 p-2 rounded-lg border border-rose-100">Uygun boş masa bulunamadı.</span>
                      )}
                    </div>
                  </div>
               )}
            </div>
          )}

          {/* MÖVCUD SİFARİŞİN MƏHSULLARI */}
          {existingOrder && existingOrder.items && existingOrder.items.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Mövcud Sifarişdəkilər</h3>
              <div className="space-y-4">
                {existingOrder.items.map((item: any, index: number) => (
                  <div key={item.id} className="flex gap-4 opacity-75 hover:opacity-100 transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                      <img src={item.product?.display_image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} alt={item.product_name_snapshot} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-gray-700 text-sm leading-tight pr-4 line-clamp-1">{item.product_name_snapshot}</h4>
                        <button onClick={() => removeExistingItem(item.id)} className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0 -mr-1" title="Sifarişdən çıxart">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {item.note && <p className="text-[11px] text-gray-500 mb-2 font-medium">{item.note}</p>}
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-0.5">
                          <span className="text-gray-400 font-bold text-xs">₼</span>
                          <span className="text-gray-700 font-black text-sm">{Number(item.unit_price).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-100/50 rounded-xl px-2 py-0.5 border border-gray-100">
                           <span className="text-xs font-bold text-gray-500">Miqdar: {Number(item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* YENİ ƏLAVƏ EDİLƏNLƏR SEPARATOR */}
          {cart.length > 0 && existingOrder && existingOrder.items && existingOrder.items.length > 0 && (
             <div className="w-full h-px border-t border-dashed border-gray-200 my-4"></div>
          )}
          {cart.length > 0 && existingOrder && (
             <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3">Yeni Əlavə Edilənlər</h3>
          )}

          {cart.length === 0 && (!existingOrder || !existingOrder.items || existingOrder.items.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                 <ShoppingBag className="w-10 h-10 opacity-30" />
              </div>
              <p className="font-bold text-gray-500 text-center">
                Səbətiniz hələ boşdur
              </p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={item.cart_id} className="flex gap-4 animate-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                  <img src={item.display_image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-900 text-sm leading-tight pr-4">{item.name}</h4>
                    <button onClick={() => removeFromCart(item.cart_id)} className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0 -mr-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Sipariş notu (örn: soğansız)..."
                    value={item.item_note || ''}
                    onChange={(e) => {
                      setCart(prev => prev.map(c => c.cart_id === item.cart_id ? { ...c, item_note: e.target.value } : c));
                    }}
                    className="w-full text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 mb-2 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-gray-400"
                  />

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-0.5">
                      <span className="text-gray-400 font-bold text-xs">₼</span>
                      <input 
                        type="number"
                        step="0.1"
                        className="w-12 bg-transparent text-gray-900 font-black text-sm outline-none border-b border-transparent hover:border-gray-300 focus:border-indigo-500 transition-colors"
                        value={item.unit_price}
                        onChange={(e) => updatePrice(item.cart_id, e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-100">
                      <button onClick={() => updateQuantity(item.cart_id, -1)} className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm text-gray-600 hover:text-rose-500 hover:shadow-md transition-all active:scale-95">
                        <Minus className="w-3 h-3" />
                      </button>
                      <input 
                        type="number"
                        step="any"
                        className="w-8 text-center font-black text-xs text-gray-900 bg-transparent outline-none"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.cart_id, e.target.value, false)}
                      />
                      <button onClick={() => updateQuantity(item.cart_id, 1)} className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm text-gray-600 hover:text-indigo-600 hover:shadow-md transition-all active:scale-95">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-7 bg-white border-t border-gray-100 rounded-b-[32px] shadow-[0_-10px_40px_rgb(0,0,0,0.03)] z-10">
          <div className="space-y-3 mb-6">
             <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                <span>Alt Cəm</span>
                <span>₼{cartTotal.toFixed(2)}</span>
             </div>
             {/* Additional breakdown can go here like tax/discount */}
             <div className="w-full h-px border-t border-dashed border-gray-200 my-2"></div>
             <div className="flex justify-between items-end">
                <span className="text-gray-900 font-bold">Ümumi Yekun</span>
                <span className="text-3xl font-black text-indigo-600">₼{cartTotal.toFixed(2)}</span>
             </div>
          </div>

          <button 
            onClick={submitOrder}
            disabled={cart.length === 0 || isSubmitting}
            className="group relative w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-2xl shadow-xl shadow-gray-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : orderId ? (
              <><CheckCircle2 className="w-5 h-5" /> Sifarişə Əlavə Et</>
            ) : (
              <><CreditCard className="w-5 h-5" /> Mətbəxə Göndər (₼{cartTotal.toFixed(2)})</>
            )}
          </button>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .mask-fade-right {
          mask-image: linear-gradient(to right, black 80%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, black 80%, transparent 100%);
        }
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}} />
    </div>
  );
}

export default function OperationsOrdersCreatePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>}>
      <POSContent />
    </Suspense>
  );
}
