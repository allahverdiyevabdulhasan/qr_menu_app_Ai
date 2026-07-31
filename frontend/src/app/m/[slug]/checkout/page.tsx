'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, CreditCard, Banknote, MapPin, Store, ReceiptText, CheckCircle2, Gift, Clock, Heart, Sparkles, Plus, Package, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useTranslation } from '@/components/LanguageProvider';

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuthStore();
  const { t } = useTranslation();
  
  const [cart, setCart] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [requireLogin, setRequireLogin] = useState(false);
  const [enableOnlinePayment, setEnableOnlinePayment] = useState(false);
  
  // Order Type & Payment
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'>('DINE_IN');
  const [tableNumber, setTableNumber] = useState('');
  const [isTableScanned, setIsTableScanned] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CREDIT_CARD' | 'ONLINE_PAYMENT'>('CREDIT_CARD');
  const [note, setNote] = useState('');
  
  // Faz 1 & Faz 2 Features
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  
  const [tipAmount, setTipAmount] = useState<number>(0);
  
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  
  const [isGift, setIsGift] = useState(false);
  const [giftRecipientName, setGiftRecipientName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  
  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderId, setOrderId] = useState<number | null>(null);

  // AI Upselling
  const [upsellData, setUpsellData] = useState<{message: string, recommendations: any[]} | null>(null);
  const [isUpsellLoading, setIsUpsellLoading] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem(`cart_${resolvedParams.slug}`);
    if (storedCart) {
      const parsed = JSON.parse(storedCart);
      setCart(parsed);
      const total = parsed.reduce((sum: number, item: any) => sum + ((Number(item.product.price) + (item.options_price_total || 0)) * item.quantity), 0);
      setCartTotal(total);
      
      // Fetch AI Upsell
      if (parsed.length > 0) {
        fetchUpsell(parsed);
      }
    }
    const storedSettings = localStorage.getItem(`settings_${resolvedParams.slug}`);
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings);
      setRequireLogin(parsedSettings.require_login_for_orders || false);
      setEnableOnlinePayment(parsedSettings.enable_online_payment || false);
    }
    
    const storedTable = localStorage.getItem(`table_${resolvedParams.slug}`);
    if (storedTable) {
      setOrderType('DINE_IN');
      setTableNumber(storedTable);
      setIsTableScanned(true);
    } else {
      setOrderType('TAKEAWAY');
      setIsTableScanned(false);
    }

    if (isAuthenticated && accessToken) {
      fetchAddresses();
    }
  }, [resolvedParams.slug, isAuthenticated, accessToken]);

  const fetchAddresses = async () => {
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      const response = await api.get('http://127.0.0.1:8000/api/public/auth/addresses/');
      setAddresses(response.data);
      const defaultAddr = response.data.find((a: any) => a.is_default);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (response.data.length > 0) setSelectedAddressId(response.data[0].id);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const fetchUpsell = async (currentCart: any[]) => {
    setIsUpsellLoading(true);
    try {
      const itemNames = currentCart.map(item => item.product.name);
      const res = await api.post(`http://127.0.0.1:8000/api/public/ai/upsell/${resolvedParams.slug}/`, {
        cart_items: itemNames
      });
      if (res.data.success && res.data.recommendations.length > 0) {
        setUpsellData(res.data);
      }
    } catch (e) {
      console.error('AI Upsell error', e);
    } finally {
      setIsUpsellLoading(false);
    }
  };

  const handleAddUpsell = (product: any) => {
    const newItem = { product, quantity: 1, selections: {}, selections_text: [], options_price_total: 0 };
    const updatedCart = [...cart, newItem];
    setCart(updatedCart);
    localStorage.setItem(`cart_${resolvedParams.slug}`, JSON.stringify(updatedCart));
    const total = updatedCart.reduce((sum: number, item: any) => sum + ((Number(item.product.price) + (item.options_price_total || 0)) * item.quantity), 0);
    setCartTotal(total);
    setUpsellData(null); // Hide upsell after adding
  };

  const removeItem = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    localStorage.setItem(`cart_${resolvedParams.slug}`, JSON.stringify(newCart));
    const total = newCart.reduce((sum: number, item: any) => sum + ((Number(item.product.price) + (item.options_price_total||0)) * item.quantity), 0);
    setCartTotal(total);
  };

  const updateItemNote = (index: number, note: string) => {
    const newCart = [...cart];
    newCart[index].note = note;
    setCart(newCart);
    localStorage.setItem(`cart_${resolvedParams.slug}`, JSON.stringify(newCart));
  };

  if (cart.length === 0 && !isSuccess) {
    return (
      <div className="min-h-[100dvh] bg-[#FAFAFA] flex flex-col items-center justify-center p-5">
        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 mb-4">
          <ReceiptText size={32} />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 mb-2">{t('checkout_empty_cart')}</h2>
        <p className="text-zinc-500 text-center mb-6 text-sm">{t('checkout_empty_cart_desc')}</p>
        <button onClick={() => router.push(`/m/${resolvedParams.slug}`)} className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-medium">
          {t('checkout_back_to_menu')}
        </button>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (orderType === 'DINE_IN' && !tableNumber.trim()) {
      setErrorMessage(t('checkout_err_table'));
      return;
    }

    if (orderType === 'DELIVERY' && !selectedAddressId) {
      setErrorMessage(t('checkout_err_address'));
      return;
    }
    
    if (orderType === 'DINE_IN' && requireLogin && !isAuthenticated) {
      router.push(`/m/${resolvedParams.slug}/login`);
      return;
    }
    
    setErrorMessage('');
    setIsSubmitting(true);
    
    try {
      if (isAuthenticated && accessToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      } else {
        delete api.defaults.headers.common['Authorization'];
      }
      
      const payload = {
        restaurant_slug: resolvedParams.slug,
        table_number: tableNumber,
        order_type: orderType,
        payment_method: paymentMethod === 'CASH' ? 'UNPAID' : 'UNPAID', // Backend uses UNPAID for all right now
        note: note,
        delivery_address_id: orderType === 'DELIVERY' ? selectedAddressId : null,
        tip_amount: tipAmount,
        is_gift: isGift,
        gift_recipient_name: giftRecipientName,
        gift_message: giftMessage,
        scheduled_time: isScheduled && scheduledTime ? scheduledTime : null,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          selected_options: {
            text: item.selections_text?.join(', ') || '',
            extra_price: item.options_price_total || 0
          }
        }))
      };
      
      const res = await api.post('http://127.0.0.1:8000/api/public/order/', payload);
      
      localStorage.removeItem(`cart_${resolvedParams.slug}`);
      setCart([]);
      
      setOrderId(res.data.order_id);
      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.error || t('checkout_err_general'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[100dvh] bg-emerald-500 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
          <CheckCircle2 size={48} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2 tracking-tight">{t('checkout_success_title')}</h1>
        <p className="text-emerald-50 text-base mb-8 opacity-90 leading-relaxed">
          {orderType === 'DINE_IN' ? t('checkout_success_desc_dine_in').replace('{tableNumber}', tableNumber) : t('checkout_success_desc_other')}
        </p>
        
        <div className="bg-white/10 rounded-2xl p-4 w-full max-w-sm mb-8 backdrop-blur-sm border border-white/20">
           <div className="text-xs uppercase tracking-widest text-emerald-100 font-bold mb-1">{t('checkout_order_code')}</div>
           <div className="text-2xl font-bold">#ORD-{orderId}</div>
        </div>

        <Link href={`/m/${resolvedParams.slug}`} className="bg-white text-emerald-600 px-8 py-3.5 rounded-xl font-bold w-full max-w-sm shadow-xl shadow-emerald-900/20 active:scale-95 transition-transform">
          {t('checkout_back_to_menu')}
        </Link>
        
        {isAuthenticated && (
          <Link href={`/m/${resolvedParams.slug}/profile`} className="mt-4 text-emerald-100 text-sm font-medium hover:text-white transition-colors">
            {t('checkout_track_orders')}
          </Link>
        )}
      </div>
    );
  }

  const finalTotal = cartTotal + tipAmount;

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA] text-zinc-900 font-sans">
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-[#FAFAFA]/80 backdrop-blur-xl border-b border-zinc-100 px-5 py-4 flex items-center">
         <button onClick={() => router.back()} className="w-10 h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-900 shadow-sm active:scale-95 transition-transform mr-4">
           <ChevronLeft size={20} strokeWidth={2.5}/>
         </button>
         <h1 className="font-bold text-[15px] tracking-tight flex-1">{t('checkout_title')}</h1>
      </div>

      <div className="max-w-xl mx-auto w-full px-5 pt-6 space-y-6 pb-32">
        
        {/* ORDER SUMMARY */}
        <div className="bg-white rounded-3xl border border-zinc-100 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 mb-4 tracking-tight flex items-center gap-2">
            <ReceiptText size={18} className="text-zinc-400" /> {t('checkout_summary')}
          </h2>
          <div className="space-y-4">
            {cart.map((item, idx) => (
              <div key={idx} className="flex flex-col border-b border-zinc-50 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                <div className="flex justify-between items-start text-sm mb-2">
                  <div className="flex-1 pr-4">
                    <div className="font-semibold text-zinc-800"><span className="text-zinc-400 mr-1">{item.quantity}x</span> {item.product.name}</div>
                    {item.selections_text && item.selections_text.length > 0 && (
                      <div className="text-xs text-zinc-500 mt-1 line-clamp-1">{item.selections_text.join(', ')}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-zinc-900 whitespace-nowrap">
                      {((Number(item.product.price) + (item.options_price_total||0)) * item.quantity).toFixed(2)} ₺
                    </div>
                    <button onClick={() => removeItem(idx)} className="text-zinc-400 hover:text-red-500 active:scale-95 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <input 
                  type="text" 
                  placeholder={t('checkout_order_note_ph')}
                  value={item.note || ''}
                  onChange={e => updateItemNote(idx, e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2 text-xs font-medium text-zinc-700 outline-none focus:border-zinc-300 transition-colors placeholder:text-zinc-400"
                />
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100 flex justify-between items-end">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t('checkout_total')}</span>
            <span className="text-2xl font-bold text-zinc-900 tracking-tight">{cartTotal.toFixed(2)} ₺</span>
          </div>
        </div>

        {/* AI UPSELL WIDGET */}
        {upsellData && !isUpsellLoading && (
          <div className="bg-emerald-50 rounded-3xl border border-emerald-100 p-5 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-sm font-bold text-emerald-800 mb-3 tracking-tight flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-500" /> {t('checkout_ai_upsell')}
            </h2>
            <p className="text-xs text-emerald-700 font-medium mb-4">{upsellData.message}</p>
            
            <div className="space-y-3">
              {upsellData.recommendations.map((prod: any) => (
                <div key={prod.id} className="bg-white rounded-2xl p-3 flex items-center justify-between shadow-sm border border-emerald-100/50">
                   <div className="flex items-center gap-3">
                      {prod.image && <img src={prod.image} alt={prod.name} className="w-12 h-12 rounded-xl object-cover" />}
                      <div>
                        <div className="font-bold text-sm text-zinc-900 line-clamp-1">{prod.name}</div>
                        <div className="font-bold text-emerald-600 text-xs">{Number(prod.price).toFixed(2)} ₺</div>
                      </div>
                   </div>
                   <button 
                     onClick={() => handleAddUpsell(prod)}
                     className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center active:scale-95 transition-transform"
                   >
                     <Plus size={18} strokeWidth={2.5} />
                   </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDER TYPE */}
        <div className="bg-white rounded-3xl border border-zinc-100 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 mb-4 tracking-tight">{t('checkout_delivery_method')}</h2>
          <div className="grid grid-cols-3 gap-3 mb-5">
             <button 
               onClick={() => {
                 if (isTableScanned) setOrderType('DINE_IN');
                 else setErrorMessage(t('checkout_err_scan_qr', { defaultValue: 'Masaya sipariş vermek için masanızdaki QR kodu okutmalısınız.' }));
               }}
               className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${orderType === 'DINE_IN' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-100 bg-white'} ${!isTableScanned ? 'opacity-50' : ''}`}
             >
                <Store size={22} className={`mb-2 ${orderType === 'DINE_IN' ? 'text-zinc-900' : 'text-zinc-400'}`} />
                <span className={`text-[11px] text-center font-bold ${orderType === 'DINE_IN' ? 'text-zinc-900' : 'text-zinc-500'}`}>{t('checkout_method_dine_in')}<br/>{t('checkout_method_dine_in_sub')}</span>
             </button>
             <button 
               onClick={() => setOrderType('TAKEAWAY')}
               className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${orderType === 'TAKEAWAY' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-100 bg-white'}`}
             >
                <Package size={22} className={`mb-2 ${orderType === 'TAKEAWAY' ? 'text-zinc-900' : 'text-zinc-400'}`} />
                <span className={`text-[11px] text-center font-bold ${orderType === 'TAKEAWAY' ? 'text-zinc-900' : 'text-zinc-500'}`}>{t('checkout_method_takeaway')}<br/>{t('checkout_method_takeaway_sub')}</span>
             </button>
             <button 
               onClick={() => setOrderType('DELIVERY')}
               className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${orderType === 'DELIVERY' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-100 bg-white'}`}
             >
                <MapPin size={22} className={`mb-2 ${orderType === 'DELIVERY' ? 'text-zinc-900' : 'text-zinc-400'}`} />
                <span className={`text-[11px] text-center font-bold ${orderType === 'DELIVERY' ? 'text-zinc-900' : 'text-zinc-500'}`}>{t('checkout_method_delivery')}<br/>{t('checkout_method_delivery_sub')}</span>
             </button>
          </div>

          {orderType === 'DINE_IN' && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">{t('checkout_table_number')}</label>
              <input 
                type="text" 
                value={tableNumber} 
                onChange={e => setTableNumber(e.target.value)}
                readOnly
                placeholder={t('checkout_table_placeholder')} 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-400 opacity-70 cursor-not-allowed"
              />
            </div>
          )}

          {orderType === 'DELIVERY' && (
            <div className="animate-in slide-in-from-top-2 duration-200 mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{t('checkout_delivery_address')}</label>
                <Link href={`/m/${resolvedParams.slug}/profile/addresses`} className="text-[11px] font-bold text-emerald-600 underline">{t('checkout_manage_addresses')}</Link>
              </div>
              
              {!isAuthenticated ? (
                 <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-orange-800 text-sm font-medium">
                   {t('checkout_req_login_delivery')}
                 </div>
              ) : addresses.length === 0 ? (
                 <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-600 text-sm font-medium text-center">
                   {t('checkout_no_address')} <br/> <Link href={`/m/${resolvedParams.slug}/profile/addresses`} className="text-emerald-600 underline">{t('checkout_add_new_address')}</Link>
                 </div>
              ) : (
                <div className="space-y-2">
                  {addresses.map(addr => (
                    <label key={addr.id} className={`flex items-start gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-100 bg-white'}`}>
                      <input 
                        type="radio" 
                        name="address" 
                        className="mt-1"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)} 
                      />
                      <div>
                        <div className="font-bold text-sm text-zinc-900">{addr.title}</div>
                        <div className="text-xs text-zinc-500 font-medium mt-0.5 line-clamp-2">{addr.full_address}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>



        {/* PAYMENT METHOD */}
        <div className="bg-white rounded-3xl border border-zinc-100 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 mb-4 tracking-tight">{t('checkout_payment_method')}</h2>
          <div className="space-y-3">
             {enableOnlinePayment && (
               <div className={`rounded-2xl border-2 transition-colors ${paymentMethod === 'ONLINE_PAYMENT' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-100 bg-white'}`}>
                 <label className="flex items-center gap-4 p-4 cursor-pointer">
                    <input type="radio" name="payment" checked={paymentMethod === 'ONLINE_PAYMENT'} onChange={() => setPaymentMethod('ONLINE_PAYMENT')} className="hidden" />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'ONLINE_PAYMENT' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                      <CreditCard size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm text-zinc-900">Online Ödeme</div>
                      <div className="text-xs text-zinc-500 font-medium mt-0.5">Kredi veya Banka kartı ile güvenli ödeme</div>
                    </div>
                 </label>

                 {paymentMethod === 'ONLINE_PAYMENT' && (
                    <div className="px-4 pb-4 pl-[4.5rem] animate-in slide-in-from-top-2 duration-200">
                      <div className="p-4 bg-white border border-zinc-200 rounded-xl space-y-3">
                        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Kart Bilgileri</div>
                        <input type="text" placeholder="Kart Üzerindeki İsim" className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-zinc-400" />
                        <input type="text" placeholder="Kart Numarası" className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-zinc-400" />
                        <div className="flex gap-3">
                          <input type="text" placeholder="AA/YY" className="w-1/2 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-zinc-400" />
                          <input type="text" placeholder="CVV" className="w-1/2 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-zinc-400" />
                        </div>
                      </div>
                    </div>
                 )}
               </div>
             )}

             <div className={`rounded-2xl border-2 transition-colors ${paymentMethod === 'CREDIT_CARD' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-100 bg-white'}`}>
               <label className="flex items-center gap-4 p-4 cursor-pointer">
                  <input type="radio" name="payment" checked={paymentMethod === 'CREDIT_CARD'} onChange={() => setPaymentMethod('CREDIT_CARD')} className="hidden" />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'CREDIT_CARD' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                    <CreditCard size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-zinc-900">
                      {orderType === 'DINE_IN' && 'Masada Kredi / Banka Kartı'}
                      {orderType === 'TAKEAWAY' && 'Kasada Kredi / Banka Kartı'}
                      {orderType === 'DELIVERY' && 'Kapıda Kredi / Banka Kartı'}
                    </div>
                    <div className="text-xs text-zinc-500 font-medium mt-0.5">
                      {orderType === 'DINE_IN' && 'Garson pos cihazı ile masanıza gelecektir'}
                      {orderType === 'TAKEAWAY' && 'Teslim alırken kasada pos cihazı ile ödeme'}
                      {orderType === 'DELIVERY' && 'Kurye pos cihazı ile adresinize gelecektir'}
                    </div>
                  </div>
               </label>
             </div>

             <div className={`rounded-2xl border-2 transition-colors ${paymentMethod === 'CASH' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-100 bg-white'}`}>
               <label className="flex items-center gap-4 p-4 cursor-pointer">
                  <input type="radio" name="payment" checked={paymentMethod === 'CASH'} onChange={() => setPaymentMethod('CASH')} className="hidden" />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'CASH' ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                    <Banknote size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-zinc-900">{t('checkout_pm_cash')}</div>
                    <div className="text-xs text-zinc-500 font-medium mt-0.5">
                      {orderType === 'DINE_IN' && 'Masada nakit ödeme'}
                      {orderType === 'TAKEAWAY' && 'Kasada nakit ödeme'}
                      {orderType === 'DELIVERY' && 'Kapıda nakit ödeme'}
                    </div>
                  </div>
               </label>
             </div>
          </div>
        </div>



        {/* ORDER NOTE */}
        <div className="bg-white rounded-3xl border border-zinc-100 p-5 shadow-sm">
          <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">{t('checkout_order_note')}</label>
          <textarea 
            value={note} 
            onChange={e => setNote(e.target.value)} 
            placeholder={t('checkout_order_note_ph')} 
            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-400 resize-none h-24"
          />
        </div>
        
        {errorMessage && (
           <div className="bg-red-50 text-red-600 text-sm font-medium p-4 rounded-2xl border border-red-100">
             {errorMessage}
           </div>
        )}

      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-zinc-100 p-4 pb-6 z-40">
         <div className="max-w-xl mx-auto flex items-center gap-4">
           <div className="flex-shrink-0">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">{t('checkout_to_pay')}</div>
              <div className="text-xl font-bold text-zinc-900 tracking-tight">{finalTotal.toFixed(2)} ₺</div>
           </div>
           <button 
             onClick={handleCheckout} 
             disabled={isSubmitting} 
             className="flex-1 bg-zinc-900 text-white h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-xl shadow-zinc-900/20 disabled:opacity-70"
           >
             {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : t('checkout_complete_order')}
           </button>
         </div>
      </div>
    </div>
  );
}
