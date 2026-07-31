"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, DollarSign, CreditCard, Banknote, Globe, Wallet, CheckCircle2, XCircle, Search, X, Gift, Percent, Plus, ShoppingBag, Store, Printer } from 'lucide-react';
import { Suspense } from 'react';
import { useTranslation } from '@/components/LanguageProvider';

function CashierContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectOrderId = searchParams?.get('order_id');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'cancelled'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment Modal State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Discount & Gift State inside Modal
  const [giftItems, setGiftItems] = useState<Set<number>>(new Set());
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [discountValue, setDiscountValue] = useState<string>('0');
  
  // Payment Type State
  const [paymentMode, setPaymentMode] = useState<'single' | 'partial'>('single');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'ONLINE' | 'MEAL_CARD'>('CASH');

  // NEW: KDV & Partial Payment States
  const [isVatApplied, setIsVatApplied] = useState(true);
  const [partialPayments, setPartialPayments] = useState<{ method: string, amount: number }[]>([]);
  const [partialAmountInput, setPartialAmountInput] = useState<string>('');

  // List Filter State
  const [orderTypeFilter, setOrderTypeFilter] = useState<'ALL' | 'DINE_IN' | 'TAKEAWAY'>('ALL');

  // Add Order Modal State - Removed (Routing to custom page)
  
  // Partial Payment Item Selection
  const [selectedItemsForPayment, setSelectedItemsForPayment] = useState<Set<number>>(new Set());

  // Batch Payment State
  const [selectedBatchOrders, setSelectedBatchOrders] = useState<Set<number>>(new Set());

  // Z Report States
  const [isZReportModalOpen, setIsZReportModalOpen] = useState(false);
  const [zReportStartDate, setZReportStartDate] = useState(() => {
    const d = new Date();
    d.setHours(8, 0, 0, 0); // Varsayılan: Sabah 08:00
    // YYYY-MM-DDThh:mm format required for datetime-local
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [zReportEndDate, setZReportEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(3, 0, 0, 0); // Varsayılan: Ertesi gece 03:00
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [zReportData, setZReportData] = useState<any>(null);
  const [isZReportLoading, setIsZReportLoading] = useState(false);

  // Stats
  const activeOrders = orders.filter(o => {
    const s = o.status?.toUpperCase();
    return s !== 'COMPLETED' && s !== 'CANCELLED';
  });
  const completedOrders = orders.filter(o => {
    const s = o.status?.toUpperCase();
    return s === 'COMPLETED';
  });
  const cancelledOrders = orders.filter(o => o.status?.toUpperCase() === 'CANCELLED');
  
  const totalCancelledAmount = cancelledOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  const totalCashInRegister = completedOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  const [enableTaxFeature, setEnableTaxFeature] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/orders/order/?hide_z_reported=true');
      setOrders(response.data);
      
      const restResponse = await api.get('/restaurants/restaurant/');
      if (restResponse.data && restResponse.data.length > 0) {
        setEnableTaxFeature(restResponse.data[0].settings?.enable_tax_feature ?? true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Live refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  const openPaymentModal = (order: any) => {
    setSelectedOrder(order);
    setGiftItems(new Set());
    setDiscountType('percent');
    setDiscountValue('0');
    setPaymentMode('single');
    setPaymentMethod('CASH');
    setIsVatApplied(true);
    setPartialPayments([]);
    setPartialAmountInput('');
    setSelectedItemsForPayment(new Set());
  };

  useEffect(() => {
    if (preselectOrderId && orders.length > 0 && !hasAutoSelected) {
      const orderToSelect = orders.find(o => o.id === parseInt(preselectOrderId));
      if (orderToSelect) {
        openPaymentModal(orderToSelect);
        setHasAutoSelected(true);
      }
    }
  }, [preselectOrderId, orders, hasAutoSelected]);

  // openPaymentModal was moved up

  // Calculations
  let subtotal = 0;
  let giftDiscount = 0;
  let generalDiscount = 0;
  
  if (selectedOrder) {
    subtotal = selectedOrder.items?.reduce((sum: number, item: any) => sum + Number(item.total_price), 0) || 0;
    
    // Calculate Gifts
    selectedOrder.items?.forEach((item: any) => {
      if (giftItems.has(item.id)) {
        giftDiscount += Number(item.total_price);
      }
    });

    const amountAfterGift = Math.max(0, subtotal - giftDiscount);
    
    // Calculate General Discount
    const discVal = parseFloat(discountValue) || 0;
    if (discountType === 'percent') {
      generalDiscount = amountAfterGift * (discVal / 100);
    } else {
      generalDiscount = discVal;
    }

    if (generalDiscount > amountAfterGift) generalDiscount = amountAfterGift;
  }

  const finalTotal = Math.max(0, subtotal - giftDiscount - generalDiscount);
  const taxAmount = (enableTaxFeature && isVatApplied) ? finalTotal * 0.08 : 0;
  
  const existingPaid = selectedOrder?.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
  const currentPaid = existingPaid + partialPayments.reduce((sum, p) => sum + p.amount, 0);
  const remainingBalance = Math.max(0, finalTotal - currentPaid);

  const toggleGift = (itemId: number) => {
    const newGifts = new Set(giftItems);
    if (newGifts.has(itemId)) newGifts.delete(itemId);
    else newGifts.add(itemId);
    setGiftItems(newGifts);
  };

  const toggleItemForPayment = (item: any) => {
    const newSet = new Set(selectedItemsForPayment);
    if (newSet.has(item.id)) newSet.delete(item.id);
    else newSet.add(item.id);
    setSelectedItemsForPayment(newSet);

    let newSum = 0;
    selectedOrder?.items?.forEach((i: any) => {
      if (newSet.has(i.id)) newSum += Number(i.total_price);
    });

    if (newSum > 0) {
      setPaymentMode('partial');
      setPartialAmountInput(newSum.toFixed(2));
    } else {
      setPartialAmountInput('');
    }
  };

  const handleAddPartialPayment = () => {
    const amount = parseFloat(partialAmountInput);
    if (isNaN(amount) || amount <= 0) return;
    const amountToAdd = Math.min(amount, remainingBalance);
    setPartialPayments([...partialPayments, { method: paymentMethod, amount: amountToAdd }]);
    setPartialAmountInput('');
  };

  const handleRemovePartialPayment = (index: number) => {
    setPartialPayments(partialPayments.filter((_, i) => i !== index));
  };

  const handleOpenBatchPaymentModal = () => {
    if (selectedBatchOrders.size === 0) return;
    const batchOrdersList = activeOrders.filter(o => selectedBatchOrders.has(o.id));
    const combinedTotal = batchOrdersList.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const combinedItems = batchOrdersList.flatMap(o => o.items || []);
    
    const virtualOrder = {
      id: 'batch',
      tracking_code: 'TOPLU ÖDEME',
      table: `${batchOrdersList.length} Seçili Masa`,
      items: combinedItems,
      total_amount: combinedTotal,
      batch_ids: batchOrdersList.map(o => o.id)
    };
    
    setPaymentMode('single');
    setSelectedOrder(virtualOrder);
  };

  const handleCheckout = async () => {
    if (!selectedOrder) return;

    setIsSubmitting(true);
    
    try {
      if (selectedOrder.id === 'batch') {
        // Batch checkout - single payment across all orders proportionally or just full payment
        // We will just do full payment for each order
        const promises = selectedOrder.batch_ids.map((id: number) => {
          const order = activeOrders.find(o => o.id === id);
          if (!order) return Promise.resolve();
          return api.post(`/orders/order/${id}/checkout/`, {
            gift_discount: 0,
            general_discount: 0,
            payments: [{ method: paymentMethod, amount: Number(order.total_amount) }],
            close_order: true
          });
        });
        
        await Promise.all(promises);
        setSelectedBatchOrders(new Set());
      } else {
        // Single order checkout
        const isOrderFullyPaid = paymentMode === 'single' || remainingBalance <= 0;
        const paymentsToSend = paymentMode === 'partial' 
          ? partialPayments 
          : [{ method: paymentMethod, amount: finalTotal }];

        if (paymentMode === 'partial' && paymentsToSend.length === 0 && remainingBalance > 0) {
          alert(t('cashier_error_enter_amount'));
          setIsSubmitting(false);
          return;
        }

        await api.post(`/orders/order/${selectedOrder.id}/checkout/`, {
          gift_discount: giftDiscount,
          general_discount: generalDiscount,
          payments: paymentsToSend,
          close_order: isOrderFullyPaid
        });
      }
      
      setSelectedOrder(null);
      fetchOrders();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || t('cashier_error_payment_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateZReport = async () => {
    setIsZReportLoading(true);
    try {
      const start = new Date(zReportStartDate).toISOString();
      const end = new Date(zReportEndDate).toISOString();
      const res = await api.get(`/orders/order/?start_date=${start}&end_date=${end}`);
      const fetchedOrders = res.data;
      
      const completed = fetchedOrders.filter((o: any) => o.status === 'COMPLETED');
      const cancelled = fetchedOrders.filter((o: any) => o.status === 'CANCELLED');
      
      let cash = 0, card = 0, meal = 0, online = 0;
      completed.forEach((o: any) => {
        o.payments?.forEach((p: any) => {
          const amt = Number(p.amount) || 0;
          if (p.method === 'CASH') cash += amt;
          else if (p.method === 'CARD') card += amt;
          else if (p.method === 'MEAL_CARD') meal += amt;
          else if (p.method === 'ONLINE') online += amt;
        });
      });
      
      setZReportData({
        totalRevenue: cash + card + meal + online,
        cash, card, meal, online,
        completedCount: completed.length,
        cancelledCount: cancelled.length,
        totalCancelled: cancelled.reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0)
      });
      
    } catch (e) {
      console.error("Z Report fetch error", e);
      alert(t('cashier_error_zreport_failed'));
    } finally {
      setIsZReportLoading(false);
    }
  };

  const handleTakeZReportAndClose = async () => {
    try {
      setIsZReportLoading(true);
      const start = new Date(zReportStartDate).toISOString();
      const end = new Date(zReportEndDate).toISOString();
      
      await api.post('/payments/zreport/generate_z_report/', {
        start_time: start,
        end_time: end
      });
      
      alert(t('cashier_zreport_success'));
      setIsZReportModalOpen(false);
      setZReportData(null);
      fetchOrders();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.error || t('cashier_error_zreport_failed'));
    } finally {
      setIsZReportLoading(false);
    }
  };

  const displayedOrders = activeTab === 'active' ? activeOrders : activeTab === 'completed' ? completedOrders : cancelledOrders;
  const filteredOrders = displayedOrders.filter(o => 
    (o.tracking_code?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     o.table?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     (!o.table && searchQuery.toLowerCase() === 'paket')) &&
    (orderTypeFilter === 'ALL' || o.order_type === orderTypeFilter)
  );

  let totalCash = 0;
  let totalCard = 0;
  let totalMealCard = 0;
  let totalOnline = 0;

  completedOrders.forEach(order => {
    order.payments?.forEach((p: any) => {
      const amt = Number(p.amount) || 0;
      if (p.method === 'CASH') totalCash += amt;
      else if (p.method === 'CARD') totalCard += amt;
      else if (p.method === 'MEAL_CARD') totalMealCard += amt;
      else if (p.method === 'ONLINE') totalOnline += amt;
    });
  });

  const totalPayments = totalCash + totalCard + totalMealCard + totalOnline;

  const getPercent = (val: number) => {
    if (totalPayments === 0) return '0,0';
    return ((val / totalPayments) * 100).toFixed(1).replace('.', ',');
  }

  if (isLoading && orders.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-[#121621] rounded-[20px] p-6 flex justify-between items-center relative overflow-hidden shadow-lg shadow-gray-900/5 mb-5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-xl font-black text-white tracking-tight mb-1">
            {t('cashier_title')} 💸
          </h1>
          <p className="text-gray-400 font-medium text-xs">{t('cashier_desc')}</p>
        </div>
        <div className="relative z-10 flex gap-3">
          <button 
            onClick={() => router.push('/operations/orders/create?source=cashier')}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-600 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> {t('cashier_btn_new_order')}
          </button>
          <button 
            onClick={() => setIsZReportModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg text-sm font-bold shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            {t('cashier_btn_zreport')}
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Card 1: Active Orders */}
        <div className="bg-gradient-to-br from-[#7A5CFF] to-[#6044E6] rounded-[20px] p-6 text-white relative overflow-hidden shadow-md shadow-indigo-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-32 flex flex-col justify-between group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-white/90 tracking-wider uppercase mb-1">Aktif Siparişler</p>
              <h2 className="text-4xl font-black">{activeOrders.length}</h2>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold border border-white/10">
              <div className="w-1.5 h-1.5 bg-[#00FF00] rounded-full animate-pulse"></div> Canlı
            </div>
          </div>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="bg-gradient-to-br from-[#00C48C] to-[#00A374] rounded-[20px] p-6 text-white relative overflow-hidden shadow-md shadow-emerald-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-32 flex flex-col justify-between group">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none group-hover:scale-110 transition-all duration-700">
            <DollarSign className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-white/90 tracking-wider uppercase mb-1">Toplam Kasa Değeri</p>
              <h2 className="text-4xl font-black tracking-tight">₼{totalPayments.toFixed(2)}</h2>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold border border-white/10">
              <CheckCircle2 className="w-3 h-3" /> Güncel
            </div>
          </div>
        </div>

        {/* Card 3: Cancelled Amount */}
        <div className="bg-gradient-to-br from-[#FF3366] to-[#E62E5C] rounded-[20px] p-6 text-white relative overflow-hidden shadow-md shadow-rose-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-32 flex flex-col justify-between group">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none group-hover:scale-110 transition-all duration-700">
            <XCircle className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-white/90 tracking-wider uppercase mb-1">İptal Edilen Tutar</p>
              <h2 className="text-4xl font-black tracking-tight">₼{totalCancelledAmount.toFixed(2)}</h2>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold border border-white/10">
              {cancelledOrders.length} Sipariş
            </div>
          </div>
        </div>
      </div>

      {/* Payment Distribution */}
      <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-gray-900 flex items-center gap-2 text-base">
            <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center">
              <div className="flex gap-0.5">
                <div className="w-1 h-3 bg-[#FF8100] rounded-full"></div>
                <div className="w-1 h-3 bg-[#3B82F6] rounded-full"></div>
                <div className="w-1 h-3 bg-[#FF3366] rounded-full"></div>
              </div>
            </div>
            Bugünkü Ödeme Tipi Dağılımı
          </h3>
          <button className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
            Detaylı Rapor
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border border-gray-100 rounded-[16px] p-4 relative overflow-hidden group hover:border-[#FF8100]/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute inset-y-0 left-0 w-1 bg-[#FF8100]"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#FF8100]/10 flex items-center justify-center text-[#FF8100] group-hover:scale-110 transition-transform"><Banknote className="w-4 h-4"/></div>
              <span className="text-[10px] font-black text-[#FF8100] bg-[#FF8100]/10 px-2 py-0.5 rounded">%{getPercent(totalCash)}</span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Nakit</p>
            <p className="text-xl font-black text-gray-900 tracking-tight">₼{totalCash.toFixed(2)}</p>
          </div>
          {/* Card 2 */}
          <div className="border border-gray-100 rounded-[16px] p-4 relative overflow-hidden group hover:border-[#3B82F6]/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute inset-y-0 left-0 w-1 bg-[#3B82F6]"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] group-hover:scale-110 transition-transform"><CreditCard className="w-4 h-4"/></div>
              <span className="text-[10px] font-black text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-0.5 rounded">%{getPercent(totalCard)}</span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Kredi / Banka Kartı</p>
            <p className="text-xl font-black text-gray-900 tracking-tight">₼{totalCard.toFixed(2)}</p>
          </div>
          {/* Card 3 */}
          <div className="border border-gray-100 rounded-[16px] p-4 relative overflow-hidden group hover:border-[#FF3366]/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute inset-y-0 left-0 w-1 bg-[#FF3366]"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#FF3366]/10 flex items-center justify-center text-[#FF3366] group-hover:scale-110 transition-transform"><Wallet className="w-4 h-4"/></div>
              <span className="text-[10px] font-black text-[#FF3366] bg-[#FF3366]/10 px-2 py-0.5 rounded">%{getPercent(totalMealCard)}</span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Yemek Kartı</p>
            <p className="text-xl font-black text-gray-900 tracking-tight">₼{totalMealCard.toFixed(2)}</p>
          </div>
          {/* Card 4 */}
          <div className="border border-gray-100 rounded-[16px] p-4 relative overflow-hidden group hover:border-[#00C48C]/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute inset-y-0 left-0 w-1 bg-[#00C48C]"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#00C48C]/10 flex items-center justify-center text-[#00C48C] group-hover:scale-110 transition-transform"><Globe className="w-4 h-4"/></div>
              <span className="text-[10px] font-black text-[#00C48C] bg-[#00C48C]/10 px-2 py-0.5 rounded">%{getPercent(totalOnline)}</span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Online Ödeme</p>
            <p className="text-xl font-black text-gray-900 tracking-tight">₼{totalOnline.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Main Tabs and Search */}
      <div className="flex flex-col mb-8 gap-4">
        {/* Top level Filter (All, Dine In, Takeaway) */}
        <div className="flex gap-2">
          <button onClick={() => setOrderTypeFilter('ALL')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${orderTypeFilter === 'ALL' ? 'bg-indigo-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Tümü</button>
          <button onClick={() => setOrderTypeFilter('DINE_IN')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${orderTypeFilter === 'DINE_IN' ? 'bg-indigo-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Masalar</button>
          <button onClick={() => setOrderTypeFilter('TAKEAWAY')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${orderTypeFilter === 'TAKEAWAY' ? 'bg-indigo-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Paket Servis</button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="bg-gray-100/80 p-1.5 rounded-[16px] inline-flex gap-1 shadow-inner">
            <button 
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'active' ? 'bg-white text-indigo-600 shadow-[0_2px_10px_rgb(0,0,0,0.06)]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ⏳ Aktif Siparişler
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'completed' ? 'bg-white text-emerald-600 shadow-[0_2px_10px_rgb(0,0,0,0.06)]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ✅ Tamamlananlar
          </button>
          <button 
            onClick={() => setActiveTab('cancelled')}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'cancelled' ? 'bg-white text-rose-600 shadow-[0_2px_10px_rgb(0,0,0,0.06)]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ❌ İptal Edilenler
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-auto md:min-w-[300px]">
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Masa Adı veya Sipariş No Ara..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-[16px] pl-12 pr-4 py-3 text-sm font-bold text-gray-700 placeholder:text-gray-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
          />
        </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-indigo-100 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-300"></div>
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-black text-gray-900 text-xl tracking-tight">{order.table || 'Ayaqüstü'}</h3>
                  <p className="text-xs text-gray-400 font-bold mt-0.5">{order.tracking_code}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {activeTab === 'active' && (
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      checked={selectedBatchOrders.has(order.id)}
                      onChange={(e) => {
                        const newSet = new Set(selectedBatchOrders);
                        if (e.target.checked) newSet.add(order.id);
                        else newSet.delete(order.id);
                        setSelectedBatchOrders(newSet);
                      }}
                    />
                  )}
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                    order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    order.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    order.status === 'SERVED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    order.status === 'READY' ? 'bg-teal-50 text-teal-600 border-teal-100' :
                    'bg-orange-50 text-orange-600 border-orange-100 animate-pulse'
                  }`}>
                    {order.status === 'COMPLETED' ? 'Tamamlandı' : 
                     order.status === 'CANCELLED' ? 'İptal' : 
                     order.status === 'SERVED' ? 'Servis Edildi' :
                     order.status === 'READY' ? 'Hazır' :
                     'Hazırlanıyor'}
                  </span>
                </div>
              </div>
              <div className="space-y-2 mb-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100 max-h-32 overflow-y-auto custom-scrollbar">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{Number(item.quantity)}x</span>
                      <span className="text-gray-700 font-medium truncate" title={item.product_name_snapshot}>{item.product_name_snapshot}</span>
                    </div>
                    <span className="font-bold text-gray-900 shrink-0">₼{Number(item.total_price).toFixed(2)}</span>
                  </div>
                ))}
                {(!order.items || order.items.length === 0) && (
                  <div className="text-xs text-gray-400 text-center py-2">Ürün yok</div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col">
                <p className="font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 text-xl">
                  ₼{Math.max(0, Number(order.total_amount) - (order.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0)).toFixed(2)}
                </p>
                {(order.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0) > 0 && (
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1 self-start">
                    - {order.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0).toFixed(2)} ₼ Ödendi
                  </span>
                )}
              </div>
              {activeTab === 'active' && (
                <div className="flex gap-2 w-[60%]">
                  <button
                    onClick={() => {
                      router.push(`/operations/orders/create?order_id=${order.id}&source=cashier`);
                    }}
                    className="flex-1 py-2 px-1 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl text-[11px] font-black transition-colors duration-300 flex items-center justify-center gap-1 whitespace-nowrap"
                  >
                    <Plus size={14} /> Ekle
                  </button>
                  <button 
                    onClick={() => openPaymentModal(order)}
                    className="flex-1 py-2 px-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl text-[11px] font-black transition-colors duration-300 flex items-center justify-center whitespace-nowrap"
                  >
                    Ödeme Al
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400 font-medium bg-gray-50/50 rounded-[24px] border border-dashed border-gray-200">
            Kayıt bulunamadı.
          </div>
        )}
      </div>

      {/* Floating Action Bar for Batch Payment */}
      {selectedBatchOrders.size > 1 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-full shadow-2xl z-40 flex items-center gap-6 border border-gray-800 animate-in slide-in-from-bottom-10">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
              {selectedBatchOrders.size}
            </div>
            <span className="font-medium text-sm">Sipariş Seçildi</span>
          </div>
          <div className="h-6 w-px bg-gray-700"></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Toplam</span>
            <span className="font-black text-lg">
              ₼{activeOrders.filter(o => selectedBatchOrders.has(o.id)).reduce((sum, o) => sum + Number(o.total_amount), 0).toFixed(2)}
            </span>
          </div>
          <button 
            onClick={handleOpenBatchPaymentModal}
            className="ml-2 bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-colors shadow-lg shadow-indigo-500/20"
          >
            Toplu Ödeme Al
          </button>
        </div>
      )}

      {/* 🚀 Advanced Payment Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-emerald-500 p-6 flex justify-between items-start text-white">
              <div>
                <p className="text-sm font-bold text-white/80 uppercase tracking-wider">Toplu Ödeme: {selectedOrder.tracking_code} ({selectedOrder.table || 'Ayaqüstü'})</p>
                <h2 className="text-4xl font-black mt-1">₼{finalTotal.toFixed(2)}</h2>
                <p className="text-sm font-medium mt-1">İndirim uygulayın, ödeme yöntemini veya parçalı ödemeyi seçip siparişi kapatın.</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Left Side: Items & Financials */}
              <div className="w-full md:w-1/2 border-r border-gray-100 flex flex-col bg-gray-50/30">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase flex items-center gap-2">
                    Adisyon Kalemleri
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedOrder.items?.map((item: any) => {
                    const isGift = giftItems.has(item.id);
                    const isSelectedForPay = selectedItemsForPayment.has(item.id);
                    return (
                      <div key={item.id} className={`flex flex-col gap-2 p-3 border rounded-xl transition-colors ${isGift ? 'border-rose-200 bg-rose-50/50' : isSelectedForPay ? 'border-indigo-400 bg-indigo-50/50' : 'border-gray-200 bg-white'}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-gray-800">{item.product_name_snapshot} (x{Number(item.quantity)})</span>
                          <span className="font-black text-gray-900">₼{Number(item.total_price).toFixed(2)}</span>
                        </div>
                        {selectedOrder.id !== 'batch' && (
                          <div className="flex items-center gap-4 mt-2 border-t border-gray-100 pt-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded text-indigo-500"
                                checked={isSelectedForPay}
                                onChange={() => toggleItemForPayment(item)}
                                disabled={isGift}
                              />
                              Ödeme İçin Seç
                            </label>
                            <label className="flex items-center gap-2 text-xs font-bold text-rose-500 cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded text-rose-500"
                                checked={isGift}
                                onChange={() => {
                                  toggleGift(item.id);
                                  if (isSelectedForPay) toggleItemForPayment(item);
                                }}
                              />
                              İkram Yap
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Financial Breakdown */}
                <div className="p-6 bg-white border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Ara Toplam:</span>
                    <span className="text-gray-900 font-bold">₼{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-rose-500 font-medium">İkram İndirimi:</span>
                    <span className="text-rose-600 font-bold">-₼{giftDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-rose-500 font-medium">Genel İskonto:</span>
                    <span className="text-rose-600 font-bold">-₼{generalDiscount.toFixed(2)}</span>
                  </div>
                  <div className={`flex justify-between text-sm ${!enableTaxFeature ? 'pb-2' : ''} border-b border-gray-100`}>
                    <span className="text-gray-500 font-medium pb-2">Hizmet Bedeli:</span>
                    <span className="text-gray-900 font-bold pb-2">₼0.00</span>
                  </div>
                  {enableTaxFeature && (
                    <div className="flex justify-between text-sm border-b border-gray-100 pb-2 pt-2">
                      <span className="text-gray-500 font-medium flex items-center gap-2">
                        KDV:
                        <button 
                          onClick={() => setIsVatApplied(!isVatApplied)}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-colors ${isVatApplied ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}
                        >
                          {isVatApplied ? 'Açık' : 'Kapalı'}
                        </button>
                      </span>
                      <span className={`font-bold ${isVatApplied ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                        ₼{isVatApplied ? taxAmount.toFixed(2) : '0.00'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2">
                    <span className="text-gray-900 font-black text-lg">Genel Toplam:</span>
                    <span className="text-gray-900 font-black text-lg">₼{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Payment Methods & Actions */}
              <div className="w-full md:w-1/2 bg-white p-6 flex flex-col overflow-y-auto">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-500 tracking-wider uppercase">İskonto Tipi ve Değeri</label>
                    <div className="flex bg-gray-100 rounded-lg p-0.5">
                      <button 
                        onClick={() => { setDiscountType('percent'); setDiscountValue('0'); }}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${discountType === 'percent' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                      >
                        % Yüzde
                      </button>
                      <button 
                        onClick={() => { setDiscountType('amount'); setDiscountValue('0'); }}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${discountType === 'amount' ? 'bg-emerald-500 shadow text-white' : 'text-gray-500'}`}
                      >
                        ₼ Tutar
                      </button>
                    </div>
                  </div>
                  <input 
                    type="number" 
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xl font-black text-right focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                  />
                </div>

                {selectedOrder.id !== 'batch' && (
                  <div className="mb-6">
                    <label className="text-xs font-bold text-gray-500 tracking-wider uppercase block mb-2">Ödeme Tipi</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setPaymentMode('single')}
                        className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${paymentMode === 'single' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                      >
                        Tek Çekim
                      </button>
                      <button 
                        onClick={() => setPaymentMode('partial')}
                        className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${paymentMode === 'partial' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                      >
                        Parçalı Ödeme
                      </button>
                    </div>
                  </div>
                )}

                <div className="mb-auto">
                  <label className="text-xs font-bold text-gray-500 tracking-wider uppercase block mb-2">Ödeme Yöntemi</label>
                  
                  {existingPaid > 0 && (
                    <div className="mb-4 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                      <div className="text-xs font-bold text-emerald-600 mb-2 uppercase">Önceden Ödenen (Kayıtlı)</div>
                      <div className="space-y-2">
                        {selectedOrder?.payments?.map((p: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="font-bold text-emerald-700">{p.method}</span>
                            <span className="font-black text-emerald-900">₼{Number(p.amount).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {paymentMode === 'partial' && (
                    <div className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          value={partialAmountInput}
                          onChange={(e) => setPartialAmountInput(e.target.value)}
                          placeholder={`Kalan: ₼${remainingBalance.toFixed(2)}`}
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button 
                          onClick={handleAddPartialPayment}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                        >
                          Ekle
                        </button>
                      </div>
                      {partialPayments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {partialPayments.map((p, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-white rounded-lg text-sm border border-gray-200 shadow-sm">
                              <span className="font-bold text-gray-700">{p.method}</span>
                              <div className="flex items-center gap-3">
                                <span className="font-black text-gray-900">₼{p.amount.toFixed(2)}</span>
                                <button onClick={() => handleRemovePartialPayment(idx)} className="text-rose-500 hover:text-rose-700"><X size={14} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'CASH', icon: <Banknote className="w-6 h-6"/>, label: 'Nakit' },
                      { id: 'CARD', icon: <CreditCard className="w-6 h-6"/>, label: 'Kart' },
                      { id: 'ONLINE', icon: <Globe className="w-6 h-6"/>, label: 'Online' },
                      { id: 'MEAL_CARD', icon: <Wallet className="w-6 h-6"/>, label: 'Yemek K.' },
                    ].map(method => (
                      <button 
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === method.id ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                      >
                        {method.icon}
                        <span className="text-[10px] font-bold uppercase mt-2">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <button 
                    onClick={handleCheckout}
                    disabled={isSubmitting || (paymentMode === 'partial' && partialPayments.length === 0 && remainingBalance > 0)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    {(paymentMode === 'partial' && remainingBalance > 0) 
                      ? 'Ödemeyi Kaydet (Kalanı Açık Bırak)' 
                      : 'Ödemeyi Onayla & Kapat'}
                  </button>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    disabled={isSubmitting}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl text-lg transition-all"
                  >
                    Vazgeç
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}


      {/* Z Raporu Modal */}
      {isZReportModalOpen && (
        <>
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #z-report-printable, #z-report-printable * {
                visibility: visible;
              }
              #z-report-printable {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 20px;
              }
            }
          `}</style>
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 print:bg-white print:p-0">
            <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:w-full print:max-w-full">
              <div className="bg-gradient-to-r from-orange-500 to-rose-500 p-6 flex justify-between items-start text-white print:hidden">
                <div>
                  <p className="text-sm font-bold text-white/80 uppercase tracking-wider">Gün Sonu</p>
                  <h2 className="text-2xl font-black mt-1">Z Raporu Al</h2>
                </div>
                <button onClick={() => { setIsZReportModalOpen(false); setZReportData(null); }} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="space-y-4 mb-6 print:hidden">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">Başlangıç Zamanı</label>
                      <input 
                        type="datetime-local" 
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
                        value={zReportStartDate}
                        onChange={(e) => setZReportStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">Bitiş Zamanı</label>
                      <input 
                        type="datetime-local" 
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
                        value={zReportEndDate}
                        onChange={(e) => setZReportEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleGenerateZReport}
                    disabled={isZReportLoading}
                    className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2"
                  >
                    {isZReportLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Raporu Hesapla"}
                  </button>
                </div>

                {zReportData && (
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 print:bg-white print:border-none print:p-0" id="z-report-printable">
                    <div className="text-center border-b border-dashed border-gray-300 pb-4 mb-4">
                      <h3 className="font-black text-2xl text-gray-900">GÜN SONU (Z) RAPORU</h3>
                      <p className="text-sm text-gray-500 mt-1">{new Date(zReportStartDate).toLocaleString('tr-TR')} - {new Date(zReportEndDate).toLocaleString('tr-TR')}</p>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Tamamlanan Sipariş:</span>
                        <span className="font-bold text-gray-900">{zReportData.completedCount} Adet</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">İptal Edilen Sipariş:</span>
                        <span className="font-bold text-gray-900">{zReportData.cancelledCount} Adet</span>
                      </div>
                      
                      <div className="border-t border-dashed border-gray-300 my-4 pt-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600 font-medium">Nakit:</span>
                          <span className="font-bold text-gray-900">₼{zReportData.cash.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600 font-medium">Kredi/Banka Kartı:</span>
                          <span className="font-bold text-gray-900">₼{zReportData.card.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600 font-medium">Yemek Kartı:</span>
                          <span className="font-bold text-gray-900">₼{zReportData.meal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Online Ödeme:</span>
                          <span className="font-bold text-gray-900">₼{zReportData.online.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="border-t border-solid border-gray-900 my-4 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-900 font-black text-lg">TOPLAM CİRO:</span>
                          <span className="font-black text-2xl text-gray-900">₼{zReportData.totalRevenue.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {zReportData.totalCancelled > 0 && (
                        <div className="flex justify-between text-rose-500 mt-2">
                          <span className="font-medium">İptal Tutarı:</span>
                          <span className="font-bold">₼{zReportData.totalCancelled.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {zReportData && (
                <div className="p-4 bg-gray-50 border-t border-gray-100 print:hidden flex flex-col md:flex-row gap-3">
                  <button 
                    onClick={handleTakeZReportAndClose}
                    disabled={isZReportLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {isZReportLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kapatılmamış Vardiyayı Sıfırla (Gerçek Z Raporu)"}
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Printer className="w-5 h-5" /> Yazdır / PDF İndir
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
}

export default function CashierPOSPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" /></div>}>
      <CashierContent />
    </Suspense>
  );
}
