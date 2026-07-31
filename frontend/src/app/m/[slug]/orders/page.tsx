'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';
import { 
  ChevronLeft, Package, Clock, 
  MapPin, Loader2, ChefHat, CheckCircle2, Utensils,
  BellRing, ReceiptText, RefreshCw, Star, MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useTranslation } from '@/components/LanguageProvider';

export default function OrdersPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  const accessToken = Cookies.get('access_token');
  const { t } = useTranslation();
  const { addItem, clearCart } = useCartStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Tab durumu: Masada veya Paket/Eve
  const [activeTab, setActiveTab] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push(`/m/${resolvedParams.slug}/login`);
      return;
    }

    const fetchOrders = async () => {
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        const response = await api.get('http://127.0.0.1:8000/api/public/auth/orders/');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
    
    // Canlı takip için her 30 saniyede bir güncelle
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, authLoading, accessToken, router, resolvedParams.slug]);

  const handleWaiterCall = async (tableNumber: string, callType: 'waiter' | 'bill') => {
    try {
      await api.post('http://127.0.0.1:8000/api/public/tables/call/', {
        restaurant_slug: resolvedParams.slug,
        table_number: tableNumber,
        call_type: callType
      });
      alert(callType === 'waiter' ? t('order_call_waiter_success') : t('order_call_bill_success'));
    } catch (error) {
      console.error('Call failed', error);
      alert(t('order_call_fail'));
    }
  };

  const handleReorder = (order: any) => {
    if (!confirm(t('order_reorder_confirm'))) return;
    
    clearCart();
    
    // Simulate adding items back to cart
    // Since order.items only have name/price, ideally they should have product_id.
    // For now we just alert that in a real app, this would use the cartStore
    alert(t('order_reorder_success'));
    router.push(`/m/${resolvedParams.slug}/checkout`);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder) return;
    setIsReviewLoading(true);
    try {
      const res = await api.post('http://localhost:8000/api/public/review/', {
        order_id: reviewOrder.id,
        rating: rating,
        comment: comment
      }, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      alert(res.data.message);
      setIsReviewModalOpen(false);
      setReviewOrder(null);
      setRating(5);
      setComment('');
    } catch (err: any) {
      alert(err.response?.data?.error || t('order_review_fail'));
    } finally {
      setIsReviewLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) return null;

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; bg: string }> = {
      'NEW': { label: t('order_status_new'), color: 'text-blue-600', bg: 'bg-blue-50' },
      'ACCEPTED': { label: t('order_status_accepted'), color: 'text-blue-600', bg: 'bg-blue-50' },
      'PREPARING': { label: t('order_status_preparing'), color: 'text-orange-600', bg: 'bg-orange-50' },
      'READY': { label: t('order_status_ready'), color: 'text-emerald-600', bg: 'bg-emerald-50' },
      'SERVED': { label: t('order_status_served'), color: 'text-zinc-500', bg: 'bg-zinc-100' },
      'COMPLETED': { label: t('order_status_completed'), color: 'text-zinc-500', bg: 'bg-zinc-100' },
      'CANCELLED': { label: t('order_status_cancelled'), color: 'text-red-600', bg: 'bg-red-50' },
    };
    return statusMap[status] || { label: status, color: 'text-zinc-600', bg: 'bg-zinc-100' };
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', { 
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    }).format(d);
  };

  // Aktif sekmeye göre siparişleri filtrele
  const filteredOrders = orders.filter(o => {
    if (activeTab === 'DINE_IN') return o.order_type === 'DINE_IN';
    return o.order_type === 'TAKEAWAY' || o.order_type === 'PRE_ORDER';
  });

  const activeStatuses = ['NEW', 'ACCEPTED', 'PREPARING', 'READY'];
  const activeOrders = filteredOrders.filter(o => activeStatuses.includes(o.status));
  const pastOrders = filteredOrders.filter(o => !activeStatuses.includes(o.status));

  const getOrderStep = (status: string) => {
    if (status === 'NEW' || status === 'ACCEPTED') return 0;
    if (status === 'PREPARING') return 1;
    if (status === 'READY') return 2;
    return 3;
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA] flex flex-col font-sans text-zinc-900 pb-20 selection:bg-zinc-200">
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-[#FAFAFA]/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="px-5 py-4 flex items-center justify-between">
           <button onClick={() => router.push(`/m/${resolvedParams.slug}`)} className="w-10 h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-900 shadow-sm active:scale-95 transition-transform">
             <ChevronLeft size={20} strokeWidth={2.5}/>
           </button>
           <h1 className="font-bold text-[15px] tracking-tight">{t('order_title')}</h1>
           <div className="w-10 h-10"></div>
        </div>

        {/* TABS (Masa / Eve) */}
        <div className="px-5 pb-3">
          <div className="flex bg-zinc-200/60 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('DINE_IN')}
              className={`flex-1 py-2 flex items-center justify-center gap-2 text-[13px] font-bold rounded-lg transition-all ${
                activeTab === 'DINE_IN' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
              }`}
            >
              <Utensils size={14} />
              {t('order_tab_dine_in')}
            </button>
            <button
              onClick={() => setActiveTab('TAKEAWAY')}
              className={`flex-1 py-2 flex items-center justify-center gap-2 text-[13px] font-bold rounded-lg transition-all ${
                activeTab === 'TAKEAWAY' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
              }`}
            >
              <Package size={14} />
              {t('order_tab_takeaway')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto w-full px-5 pt-6">
        
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-sm font-medium">{t('order_loading')}</p>
          </div>
        ) : (
          <>
            {/* LIVE ACTIVE ORDERS */}
            {activeOrders.length > 0 && (
              <div className="mb-10 space-y-4">
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2 mb-4">
                   <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  {t('order_live_tracking')}
                </h3>
                
                {activeOrders.map((order) => {
                  const step = getOrderStep(order.status);
                  const status = getStatusDisplay(order.status);
                  
                  return (
                    <div key={order.id} className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-xl shadow-zinc-200/40 relative overflow-hidden">
                      {/* Decorative top bar */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 ${status.bg.replace('bg-', 'bg-').replace('50', '400')}`}></div>
                      
                      <div className="flex justify-between items-center mb-6 pt-2">
                        <div>
                           <h4 className="font-bold text-zinc-900 text-lg mb-1">{order.restaurant_name}</h4>
                           <span className="text-xs font-bold text-zinc-400 tracking-wider">#{order.tracking_code || `ORD-${order.id}`}</span>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${status.bg} ${status.color}`}>
                          {status.label}
                        </div>
                      </div>

                      {/* Progress Tracker */}
                      <div className="relative mb-8 mt-4">
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-100 -translate-y-1/2 rounded-full"></div>
                        <div 
                          className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 rounded-full transition-all duration-500"
                          style={{ width: `${(step / 2) * 100}%` }}
                        ></div>
                        
                        <div className="relative flex justify-between">
                          {/* Step 1 */}
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-colors ${step >= 0 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-zinc-100 text-zinc-400 border border-zinc-200'}`}>
                              <CheckCircle2 size={16} strokeWidth={3} />
                            </div>
                            <span className={`text-[10px] font-bold ${step >= 0 ? 'text-zinc-900' : 'text-zinc-400'}`}>{t('order_step_received')}</span>
                          </div>
                          
                          {/* Step 2 */}
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-colors ${step >= 1 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-zinc-100 text-zinc-400 border border-zinc-200'}`}>
                              <ChefHat size={16} strokeWidth={2.5} />
                            </div>
                            <span className={`text-[10px] font-bold ${step >= 1 ? 'text-zinc-900' : 'text-zinc-400'}`}>{t('order_step_preparing')}</span>
                          </div>
                          
                          {/* Step 3 */}
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-colors ${step >= 2 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-zinc-100 text-zinc-400 border border-zinc-200'}`}>
                              <Package size={16} strokeWidth={2.5} />
                            </div>
                            <span className={`text-[10px] font-bold ${step >= 2 ? 'text-zinc-900' : 'text-zinc-400'}`}>{t('order_step_ready')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Order Items Brief */}
                      <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                        {order.items.slice(0, 2).map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-sm mb-2 last:mb-0">
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500 font-bold text-xs">{item.quantity}x</span>
                              <span className="font-medium text-zinc-700 truncate max-w-[150px]">{item.product_name}</span>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-xs font-semibold text-zinc-400 mt-2">
                            {t('order_more_items').replace('{count}', (order.items.length - 2).toString())}
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-4 mt-4 border-t border-zinc-100 flex justify-between items-end">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t('order_total')}</span>
                        <span className="text-xl font-black text-zinc-900">{Number(order.total_amount).toFixed(2)} ₺</span>
                      </div>
                      
                      {/* GARSON ÇAĞIR & HESAP İSTE */}
                      {activeTab === 'DINE_IN' && order.note?.includes('Masa:') && (
                        <div className="flex gap-3 pt-4 mt-4 border-t border-zinc-100">
                           <button 
                             onClick={() => handleWaiterCall(order.note.split('Masa:')[1].split('|')[0].trim(), 'waiter')}
                             className="flex-1 py-3 bg-zinc-100 text-zinc-800 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:bg-zinc-200 transition-colors"
                           >
                             <BellRing size={16} /> {t('order_call_waiter')}
                           </button>
                           <button 
                             onClick={() => handleWaiterCall(order.note.split('Masa:')[1].split('|')[0].trim(), 'bill')}
                             className="flex-1 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:bg-zinc-800 transition-colors"
                           >
                             <ReceiptText size={16} /> {t('order_ask_bill')}
                           </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* PAST ORDERS */}
            {pastOrders.length > 0 && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                   <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                      <Clock size={20} className="text-zinc-400" />
                      {t('order_past_orders')}
                   </h3>
                   <span className="bg-zinc-100 text-zinc-600 text-xs font-bold px-2.5 py-1 rounded-full">{pastOrders.length}</span>
                </div>

                <div className="space-y-4">
                  {pastOrders.map((order) => {
                    const status = getStatusDisplay(order.status);
                    return (
                      <div key={order.id} className="bg-white rounded-3xl border border-zinc-100 p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-4 pb-4 border-b border-zinc-100">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <MapPin size={14} className="text-zinc-400" />
                              <span className="text-sm font-bold text-zinc-900">{order.restaurant_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                              <span>{formatDate(order.created_at)}</span>
                              <span className="mx-1">•</span>
                              <span>#{order.tracking_code || `ORD-${order.id}`}</span>
                            </div>
                          </div>
                          <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.color}`}>
                            {status.label}
                          </div>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded bg-zinc-50 flex items-center justify-center text-zinc-500 font-semibold text-xs border border-zinc-100">
                                  {item.quantity}
                                </span>
                                <span className="font-medium text-zinc-700">{item.product_name}</span>
                              </div>
                              <span className="font-semibold text-zinc-900">{Number(item.total_price).toFixed(2)} ₺</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="pt-4 border-t border-zinc-100 flex justify-between items-end">
                          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t('order_total')}</span>
                          <span className="text-lg font-bold text-zinc-900">{Number(order.total_amount).toFixed(2)} ₺</span>
                        </div>
                        
                        <div className="pt-4 mt-4 border-t border-zinc-100 flex gap-2">
                          {status.label === t('order_status_completed') && (
                            <button 
                              onClick={() => { setReviewOrder(order); setIsReviewModalOpen(true); }}
                              className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:bg-emerald-100 transition-colors"
                            >
                              <Star size={16} className="fill-emerald-600" /> {t('order_review_btn')}
                            </button>
                          )}
                          <button 
                            onClick={() => handleReorder(order)}
                            className="flex-1 py-3 border border-zinc-200 text-zinc-800 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:bg-zinc-50 transition-colors"
                          >
                            <RefreshCw size={16} /> {t('order_reorder_btn')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredOrders.length === 0 && (
              <div className="bg-white rounded-3xl border border-zinc-100 p-10 text-center shadow-sm flex flex-col items-center mt-4">
                 <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-4">
                   {activeTab === 'DINE_IN' ? <Utensils size={32} strokeWidth={1.5} /> : <Package size={32} strokeWidth={1.5} />}
                 </div>
                 <h4 className="text-zinc-900 font-bold mb-2">
                   {activeTab === 'DINE_IN' ? t('order_empty_dine_in') : t('order_empty_takeaway')}
                 </h4>
                 <p className="text-zinc-500 text-sm font-medium mb-6">{t('order_empty_desc')}</p>
                 <Link href={`/m/${resolvedParams.slug}`} className="bg-zinc-900 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-sm active:scale-95 transition-transform">
                   {t('order_menu_explore')}
                 </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* REVIEW MODAL */}
      {isReviewModalOpen && reviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 text-center border-b border-zinc-100">
              <h3 className="text-xl font-bold text-zinc-900 mb-1">{t('order_review_modal_title')}</h3>
              <p className="text-sm text-zinc-500 font-medium">{reviewOrder.restaurant_name} {t('order_review_modal_desc')}</p>
            </div>
            <form onSubmit={submitReview} className="p-6">
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="active:scale-90 transition-transform"
                  >
                    <Star size={32} className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-200'} transition-colors`} />
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('order_review_ph')}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors min-h-[100px] mb-4"
              ></textarea>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsReviewModalOpen(false)} className="flex-1 py-3.5 bg-zinc-100 text-zinc-700 font-bold rounded-xl active:scale-95 transition-transform">{t('order_review_cancel')}</button>
                <button type="submit" disabled={isReviewLoading} className="flex-1 py-3.5 bg-emerald-500 text-white font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50 flex justify-center">
                  {isReviewLoading ? <Loader2 size={20} className="animate-spin" /> : t('order_review_submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
