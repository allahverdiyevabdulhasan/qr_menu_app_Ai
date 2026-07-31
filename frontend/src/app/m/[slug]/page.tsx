"use client";
import React, { useState, useEffect, use } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, ShoppingBag, Plus, Minus, ChevronLeft, Search, Star, 
  Flame, Utensils, X, BellRing, Receipt, 
  CheckCircle2, Wallet, Bot, Sparkles, MessageCircle, Info, ListOrdered, Clock, Package, User, Calendar, ChevronRight, Trash2
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Cookies from 'js-cookie';
import { useTranslation } from '@/components/LanguageProvider';

interface Category { id: number; name: string; }
interface Option { id: number; name: string; option_type: 'single' | 'multiple'; price: string; }
interface Modifier { id: number; name: string; price: string; }
interface ModifierGroup { id: number; name: string; is_required: boolean; min_choices: number; max_choices: number; modifiers: Modifier[]; }
interface Ingredient { id: number; name: string; is_removable: boolean; }

interface Product {
  id: number; name: string; price: string; original_price?: string; is_happy_hour?: boolean; category: number; display_image: string | null;
  description: string; kcal?: number; protein?: string; carbs?: string; fat?: string;
  is_popular?: boolean; is_vegetarian?: boolean; is_vegan?: boolean; is_diet?: boolean;
  spicy_level?: number; options: Option[]; modifier_groups: ModifierGroup[]; ingredients: Ingredient[];
}

interface Restaurant { id: number; name: string; slug: string; logo: string | null; description?: string; active_campaign?: string | null; currency?: string; }
interface RestaurantSettings { 
  hasTableOrder: boolean; 
  hasOnlineOrder: boolean; 
  hasReservation: boolean; 
  enable_orders: boolean;
}
interface SelectedOptionsState { options: Record<number, boolean>; modifiers: Record<number, Record<number, boolean>>; removed_ingredients: Record<number, boolean>; }
interface CartItem { product: Product; quantity: number; selected_options: any; options_price_total: number; selections_text: string[]; note?: string; }

export default function PublicMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  
  useEffect(() => {
    const tableParam = searchParams.get('table');
    if (tableParam) {
      localStorage.setItem(`table_${resolvedParams.slug}`, tableParam);
    }
  }, [searchParams, resolvedParams.slug]);
  
  const { isAuthenticated, user } = useAuthStore();
  const accessToken = Cookies.get('access_token');
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<{number: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [activeFilter, setActiveFilter] = useState<'all'|'popular'|'vegan'|'spicy'|'diet'>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');

  const [activeOrders, setActiveOrders] = useState<number[]>([]);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [orderStatuses, setOrderStatuses] = useState<any[]>([]);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableModalInput, setTableModalInput] = useState('');
  const [pendingAction, setPendingAction] = useState<'WAITER' | 'BILL' | 'ORDER' | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [resData, setResData] = useState({ date: '', time: '', guest_count: 2, customer_name: '', customer_phone: '', note: '' });
  const [resLoading, setResLoading] = useState(false);
  
  const [toastMessage, setToastMessage] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const [productQuantity, setProductQuantity] = useState<number | string>(1);
  const [productSelections, setProductSelections] = useState<SelectedOptionsState>({
    options: {}, modifiers: {}, removed_ingredients: {}
  });

  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysisText, setAiAnalysisText] = useState('');

  const [userName, setUserName] = useState('');
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [peopleCount, setPeopleCount] = useState(1);
  const [aiChatMessage, setAiChatMessage] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<{role: 'user'|'assistant', text: string}[]>([]);
  const [aiRecommendedProductIds, setAiRecommendedProductIds] = useState<number[]>([]);
  const [isAiMenuMode, setIsAiMenuMode] = useState(false);

  const { t, locale } = useTranslation();

  useEffect(() => {
    const fetchMenu = async () => {
      // 1. Öncekten önbelleğe (cache) alınmış veri varsa hemen göster (Bekleme ekranını atla)
      const cachedMenu = sessionStorage.getItem(`menuCache_${resolvedParams.slug}_${locale}`);
      if (cachedMenu) {
        const data = JSON.parse(cachedMenu);
        setRestaurant(data.restaurant);
        setSettings(data.settings);
        setCategories(data.categories);
        setProducts(data.products);
        if (data.tables) setTables(data.tables);
        setIsLoading(false); // Anında göster
      }

      try {
        const response = await axios.get(`http://localhost:8000/api/public/menu/${resolvedParams.slug}/`, {
          headers: { 'Accept-Language': locale }
        });
        
        // Yeni veriyi önbelleğe kaydet
        sessionStorage.setItem(`menuCache_${resolvedParams.slug}_${locale}`, JSON.stringify(response.data));

        setRestaurant(response.data.restaurant);
        setSettings(response.data.settings);
        localStorage.setItem(`settings_${resolvedParams.slug}`, JSON.stringify(response.data.settings));
        setCategories(response.data.categories);
        setProducts(response.data.products);
        
        const storedCart = localStorage.getItem(`cart_${resolvedParams.slug}`);
        if (storedCart) setCart(JSON.parse(storedCart));
        
        const storedOrders = localStorage.getItem(`activeOrders_${resolvedParams.slug}`);
        if (storedOrders) setActiveOrders(JSON.parse(storedOrders));
        if (response.data.tables) setTables(response.data.tables);
        
        const storedName = localStorage.getItem('guest_name');
        if (storedName) setUserName(storedName);
        else setUserName('Misafir');
      } catch (err: any) {
        if (err.response?.status === 404) {
          console.log("Menü bulunamadı (404) - Bu beklenen bir durumdur.");
        } else {
          console.log("Menü yüklenemedi.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, [resolvedParams.slug, locale]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(`cart_${resolvedParams.slug}`, JSON.stringify(cart));
    }
  }, [cart, isLoading, resolvedParams.slug]);

  const handleOptionToggle = (optionId: number, type: 'single' | 'multiple', productOptions: Option[]) => {
    setProductSelections(prev => {
      const newOpts = { ...prev.options };
      if (type === 'single') {
        productOptions.filter(o => o.option_type === 'single').forEach(o => { newOpts[o.id] = false; });
        newOpts[optionId] = true;
      } else {
        newOpts[optionId] = !newOpts[optionId];
      }
      return { ...prev, options: newOpts };
    });
  };

  const handleModifierToggle = (groupId: number, modifierId: number, isRadio: boolean) => {
    setProductSelections(prev => {
      const newMods = { ...prev.modifiers };
      if (!newMods[groupId]) newMods[groupId] = {};
      
      if (isRadio) {
        newMods[groupId] = { [modifierId]: true };
      } else {
        newMods[groupId][modifierId] = !newMods[groupId][modifierId];
      }
      return { ...prev, modifiers: newMods };
    });
  };

  const handleIngredientToggle = (ingredientId: number) => {
    setProductSelections(prev => ({
      ...prev, removed_ingredients: { ...prev.removed_ingredients, [ingredientId]: !prev.removed_ingredients[ingredientId] }
    }));
  };

  const calculateSelectionPrice = () => {
    if (!selectedProduct) return 0;
    let extraPrice = 0;
    selectedProduct.options?.forEach(opt => {
      if (productSelections.options[opt.id]) extraPrice += parseFloat(opt.price);
    });
    selectedProduct.modifier_groups?.forEach(group => {
      group.modifiers.forEach(mod => {
        if (productSelections.modifiers[group.id]?.[mod.id]) extraPrice += parseFloat(mod.price);
      });
    });
    return extraPrice;
  };

  const getSelectionText = () => {
    if (!selectedProduct) return [];
    const texts: string[] = [];
    selectedProduct.options?.forEach(opt => { if (productSelections.options[opt.id]) texts.push(opt.name); });
    selectedProduct.modifier_groups?.forEach(group => {
      group.modifiers.forEach(mod => { if (productSelections.modifiers[group.id]?.[mod.id]) texts.push(`+ ${mod.name}`); });
    });
    selectedProduct.ingredients?.forEach(ing => {
      if (productSelections.removed_ingredients[ing.id]) texts.push(`- ${ing.name}`);
    });
    return texts;
  };

  const validateSelections = () => {
    if (!selectedProduct) return false;
    for (const group of (selectedProduct.modifier_groups || [])) {
      if (group.is_required) {
        const selectedCount = Object.values(productSelections.modifiers[group.id] || {}).filter(Boolean).length;
        if (selectedCount < group.min_choices) {
          setToastMessage({ message: t('menu_err_min_choices', { groupName: group.name, minChoices: group.min_choices }), type: 'error' });
          return false;
        }
        if (selectedCount > group.max_choices) {
          setToastMessage({ message: t('menu_err_max_choices', { groupName: group.name, maxChoices: group.max_choices }), type: 'error' });
          return false;
        }
      }
    }
    return true;
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    if (!validateSelections()) return;

    const options_price_total = calculateSelectionPrice();
    const selections_text = getSelectionText();
    
    const api_options = {
      extra_price: options_price_total,
      options: Object.keys(productSelections.options).filter(k => productSelections.options[parseInt(k)]),
      modifiers: productSelections.modifiers,
      removed_ingredients: Object.keys(productSelections.removed_ingredients).filter(k => productSelections.removed_ingredients[parseInt(k)]),
      text: selections_text.join(', ')
    };

    setCart(prev => [...prev, { 
      product: selectedProduct, quantity: Number(productQuantity) || 1, selected_options: api_options,
      options_price_total, selections_text
    }]);

    setSelectedProduct(null);
    setToastMessage({ message: 'Sepete eklendi', type: 'success' });
  };

  const updateCartItemQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const newCart = [...prev];
      newCart[index].quantity = Math.round((newCart[index].quantity + delta) * 10) / 10;
      if (newCart[index].quantity <= 0) return prev.filter((_, i) => i !== index);
      return newCart;
    });
  };

  const callService = async (type: 'WAITER' | 'BILL') => {
    if (!tableNumber) {
      setPendingAction(type);
      setIsTableModalOpen(true);
      return;
    }
    try {
      await axios.post(`http://localhost:8000/api/public/waitercall/`, {
        restaurant_slug: resolvedParams.slug, table_number: tableNumber, call_type: type
      });
      setToastMessage({ message: type === 'WAITER' ? t('order_call_waiter_success') : t('order_call_bill_success'), type: 'success' });
    } catch (err: any) {
      setToastMessage({ message: err.response?.data?.error || "Bir hata oluştu.", type: 'error' });
    }
  };

  const fetchOrderStatuses = async () => {
    if (activeOrders.length === 0) return;
    setIsTrackingLoading(true);
    try {
      const statuses = await Promise.all(
        activeOrders.map(async (id) => {
          const res = await axios.get(`http://localhost:8000/api/public/order_status/${id}/`);
          return res.data;
        })
      );
      setOrderStatuses(statuses.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err) {
      console.error(err);
    } finally {
      setIsTrackingLoading(false);
    }
  };

  useEffect(() => {
    if (isTrackingModalOpen) {
      fetchOrderStatuses();
      const interval = setInterval(fetchOrderStatuses, 10000); // poll every 10s
      return () => clearInterval(interval);
    }
  }, [isTrackingModalOpen, activeOrders]);

  const cartTotal = cart.reduce((sum, item) => sum + ((Number(item.product.price) + item.options_price_total) * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const generateTrackingCode = () => 'TRK-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleTableSubmit = async () => {
    if (!tableModalInput) return alert(t('menu_err_no_table'));
    setTableNumber(tableModalInput);
    setIsTableModalOpen(false);
    const currentTable = tableModalInput;
    setTableModalInput('');
    
    if (pendingAction === 'WAITER' || pendingAction === 'BILL') {
      try {
        await axios.post(`http://localhost:8000/api/public/waitercall/`, {
          restaurant_slug: resolvedParams.slug, table_number: currentTable, call_type: pendingAction
        });
        setToastMessage({ message: pendingAction === 'WAITER' ? t('order_call_waiter_success') : t('order_call_bill_success'), type: 'success' });
      } catch (err: any) {
        setToastMessage({ message: pendingAction === 'WAITER' ? t('menu_err_call_waiter') : t('menu_err_call_bill'), type: 'error' });
      }
    } else if (pendingAction === 'ORDER') {
      submitOrderAPI(currentTable);
    }
    setPendingAction(null);
  };

  const submitOrderAPI = async (tableNo: string) => {
    setIsSubmitting(true);
    try {
      const headers: any = {};
      if (isAuthenticated && accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const res = await axios.post(`http://localhost:8000/api/public/order/`, {
        restaurant_slug: resolvedParams.slug,
        table_number: tableNo,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          selected_options: {
            extra_price: item.options_price_total,
            options: Object.keys(item.selected_options.options).filter(k => item.selected_options.options[parseInt(k)]),
            modifiers: item.selected_options.modifiers,
            removed_ingredients: Object.keys(item.selected_options.removed_ingredients).filter(k => item.selected_options.removed_ingredients[parseInt(k)]),
            text: item.selections_text.join(', ')
          }
        }))
      }, { headers });

      const newOrderId = res.data.order_id;
      if (newOrderId) {
        const newOrders = [...activeOrders, newOrderId];
        setActiveOrders(newOrders);
        localStorage.setItem(`activeOrders_${resolvedParams.slug}`, JSON.stringify(newOrders));
      }
      setTrackingCode(generateTrackingCode());
      setOrderSuccess(true);
      setCart([]);
      setIsCartOpen(false);
    } catch (err: any) {
      setToastMessage({ message: err.response?.data?.error || t('menu_err_order'), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitOrder = async () => {
    if (settings && settings.hasTableOrder === false) {
      setToastMessage({ message: t('menu_err_no_table_order'), type: 'error' });
      return;
    }

    if (!tableNumber) {
      setPendingAction('ORDER');
      setIsTableModalOpen(true);
      return;
    }
    submitOrderAPI(tableNumber);
  };

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setProductQuantity(1);
    setProductSelections({ options: {}, modifiers: {}, removed_ingredients: {} });
    setAiAnalysisLoading(true);
    setAiAnalysisText('');
    setTimeout(() => {
      let text = "Bu lezzet, menümüzdeki hafif içeceklerle harika bir uyum sağlar.";
      if (product.is_vegan) text = "Bitkisel bazlı bu muazzam lezzet, taze sıkılmış bir meyve suyu ile harika gider.";
      else if (product.spicy_level && product.spicy_level > 2) text = "Acı seviyesi yüksek! Yanında ferahlatıcı bir içecek öneriyoruz.";
      setAiAnalysisText(text);
      setAiAnalysisLoading(false);
    }, 1200);
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resData.date || !resData.time || !resData.customer_name || !resData.customer_phone) {
      setToastMessage({ message: t('menu_err_res_fields'), type: 'error' });
      return;
    }
    setResLoading(true);
    try {
      const res = await axios.post(`http://localhost:8000/api/public/reservation/${resolvedParams.slug}/`, resData);
      setToastMessage({ message: res.data.message, type: 'success' });
      setIsReservationModalOpen(false);
      setResData({ date: '', time: '', guest_count: 2, customer_name: '', customer_phone: '', note: '' });
    } catch (error) {
      setToastMessage({ message: t('menu_err_res_fail'), type: 'error' });
    } finally {
      setResLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#FAFAFA] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mb-4" />
        <p className="text-zinc-500 text-sm font-medium tracking-wide">{t('menu_loading')}</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="bg-[#FAFAFA] min-h-[100dvh] flex justify-center items-center p-4">
        <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-zinc-100 max-w-sm w-full">
          <Utensils className="w-12 h-12 text-zinc-200 mx-auto mb-4" strokeWidth={1} />
          <h1 className="text-xl font-semibold text-zinc-900 mb-2">{t('menu_no_restaurant_title')}</h1>
          <p className="text-zinc-500 text-sm">{t('menu_no_restaurant_desc')}</p>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-[100dvh] bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-zinc-900 text-white rounded-full flex items-center justify-center mb-8 shadow-xl">
          <CheckCircle2 size={48} strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-semibold text-zinc-900 mb-2 tracking-tight">{t('menu_order_success_title')}</h1>
        <p className="text-zinc-500 mb-10">{t('menu_order_success_desc')}</p>
        
        <div className="bg-white w-full max-w-xs rounded-2xl p-6 mb-8 border border-zinc-100 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">{t('menu_order_success_code')}</span>
          <div className="text-3xl font-semibold text-zinc-900 tracking-wider mb-2">{trackingCode}</div>
          <p className="text-xs text-zinc-400">{t('menu_order_success_code_hint')}</p>
        </div>
        
        <button onClick={() => setOrderSuccess(false)} className="w-full max-w-xs py-3.5 bg-zinc-900 text-white rounded-xl font-medium text-sm transition-transform active:scale-95">
          Menüye Dön
        </button>
      </div>
    );
  }

  const filteredProducts = products.filter(p => {
    if (isAiMenuMode && aiRecommendedProductIds.length > 0) {
      if (!aiRecommendedProductIds.includes(p.id)) return false;
    }
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#FAFAFA] min-h-[100dvh] font-sans relative pb-44 text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* 1. HERO & RESTAURANT INFO */}
      <div className="relative w-full h-[220px] bg-zinc-900 overflow-hidden">
        {restaurant.logo ? (
          <img src={restaurant.logo} className="w-full h-full object-cover opacity-50" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700"><Utensils size={48} strokeWidth={1}/></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
        
        <div className="absolute top-6 left-6 right-6 flex justify-end items-center z-10">
           {tableNumber && (
             <div className="bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-full font-medium text-xs flex items-center gap-2 border border-white/10 shadow-sm">
               {t('menu_table_indicator', { tableNumber })} <button onClick={() => setTableNumber('')} className="text-white/70 hover:text-white transition-colors"><X size={12}/></button>
             </div>
           )}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 -mt-20 relative z-20">
        {/* White Info Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100/80 backdrop-blur-xl relative animate-in slide-in-from-bottom-10 fade-in duration-700">
          <h1 className="text-2xl font-semibold text-zinc-900 mb-2 tracking-tight">{restaurant.name}</h1>
          <p className="text-zinc-500 text-sm leading-relaxed mb-6">
            {restaurant.description || t('menu_desc_default')}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-6">
             <span className="bg-zinc-50 text-zinc-600 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-zinc-100">
                <Star size={12} className="text-zinc-900 fill-zinc-900"/> 4.5
             </span>

             {restaurant.active_campaign && (
               <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-emerald-100 animate-pulse">
                  <Flame size={12} className="text-emerald-500"/> {restaurant.active_campaign}
               </span>
             )}
          </div>

          {/* AI Banner - Minimalist */}
          <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-150 fill-mode-both">
            <Link href={`/m/${resolvedParams.slug}/ai`} className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 hover:bg-indigo-50 transition-colors rounded-2xl p-4 flex items-center justify-between border border-indigo-100/50 cursor-pointer active:scale-95 group mb-6 mt-2 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0 border border-indigo-100 group-hover:scale-110 transition-transform duration-300">
                    <Bot size={18} className="text-indigo-600 animate-pulse" strokeWidth={1.5} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-zinc-900 mb-0.5 flex items-center gap-1.5">
                      {t('menu_ai_assistant', { defaultValue: 'Yapay Zeka Asistanı' })} <Sparkles size={12} className="text-indigo-500 animate-pulse" />
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium">
                      Sana özel bütçe ve menü planla
                    </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white border border-indigo-100 flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300 text-indigo-600 group-hover:translate-x-1">
                 <ChevronRight size={16} />
              </div>
            </Link>
          </div>

          {/* Table Services & Reservation */}
          <div className="flex bg-zinc-100/80 rounded-xl p-1 gap-1 mt-4">
            {settings?.hasTableOrder !== false && (
              <>
                <button onClick={() => callService('WAITER')} className="flex-1 bg-white shadow-sm py-2.5 rounded-lg text-zinc-700 font-medium text-[11px] flex justify-center items-center gap-1.5 active:scale-95 transition-transform">
                   <BellRing size={14}/> {t('waiter')}
                </button>
                <button onClick={() => callService('BILL')} className="flex-1 bg-white shadow-sm py-2.5 rounded-lg text-zinc-700 font-medium text-[11px] flex justify-center items-center gap-1.5 active:scale-95 transition-transform">
                   <Receipt size={14}/> {t('bill')}
                </button>
              </>
            )}
            <button onClick={() => setIsReservationModalOpen(true)} className="flex-1 bg-white shadow-sm py-2.5 rounded-lg text-zinc-700 font-medium text-[11px] flex justify-center items-center gap-1.5 active:scale-95 transition-transform">
               <Calendar size={14}/> {t('reservation')}
            </button>
          </div>
          
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 mt-8">
        {/* 2. SEARCH & CATEGORIES */}
        <div className="bg-white rounded-2xl p-1.5 flex items-center shadow-sm border border-zinc-100 mb-6">
          <Search className="text-zinc-400 ml-3" size={18} strokeWidth={1.5}/>
          <input 
            type="text" 
            placeholder={t('menu_search_placeholder')} 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-transparent px-3 py-2.5 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8 pb-2">
          <button onClick={() => setActiveCategory('all')} className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-medium transition-all border ${activeCategory === 'all' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-500 border-zinc-200'}`}>{t('menu_category_all')}</button>
          
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-medium transition-all border ${activeCategory === cat.id ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-500 border-zinc-200'}`}>{cat.name}</button>
          ))}
        </div>

        {/* 3. PRODUCT LIST (List View for Premium Feel) */}
        <div className="space-y-4">
          {filteredProducts.map((product, idx) => (
            <div 
              key={product.id} 
              className="bg-white rounded-2xl p-3 pr-5 flex gap-4 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-zinc-100 animate-in slide-in-from-bottom-8 fade-in fill-mode-both"
              style={{ animationDelay: `${200 + (idx * 100)}ms`, animationDuration: '600ms' }}
              onClick={() => openProductModal(product)}
            >
               <div className="w-28 h-28 bg-zinc-50 rounded-xl overflow-hidden flex-shrink-0 relative border border-zinc-100 group">
                 {product.display_image ? (
                   <img src={product.display_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-zinc-300"><Utensils size={24} strokeWidth={1}/></div>
                 )}
                 {product.is_popular && (
                   <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-md px-1.5 py-0.5 border border-zinc-100 shadow-sm animate-pulse">
                     <Flame size={12} className="text-orange-500"/>
                   </div>
                 )}
               </div>
               <div className="flex-1 py-1 flex flex-col justify-between">
                 <div>
                   <h3 className="font-semibold text-zinc-900 text-[15px] leading-tight mb-1.5">{product.name}</h3>
                   <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed">{product.description}</p>
                 </div>
                 <div className="flex items-center justify-between mt-3">
                   <div className="flex flex-col">
                     {product.is_happy_hour && (
                       <span className="text-[10px] text-zinc-400 line-through mb-0.5">{Number(product.original_price).toFixed(2)} {restaurant?.currency || '₺'}</span>
                     )}
                     <span className={`font-semibold ${product.is_happy_hour ? 'text-emerald-600' : 'text-zinc-900'}`}>{Number(product.price).toFixed(2)} {restaurant?.currency || '₺'}</span>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center shadow-sm text-white transition-transform active:scale-95 group-hover:rotate-90 duration-300">
                      <Plus size={16} />
                   </div>
                 </div>
               </div>
            </div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-24">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100 shadow-sm">
               <Search size={24} className="text-zinc-300" strokeWidth={1.5} />
             </div>
             <p className="text-zinc-500 text-sm font-medium">{t('menu_no_products')}</p>
          </div>
        )}
      </div>

      {/* PRODUCT MODAL - Minimalist Overlay */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in slide-in-from-bottom duration-300 overflow-y-auto custom-scrollbar">
          
          <div className="relative w-full h-[40vh] bg-zinc-100 flex-shrink-0">
             {selectedProduct.display_image ? (
                <img src={selectedProduct.display_image} className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-300"><Utensils size={48} strokeWidth={1}/></div>
             )}
             
             <div className="absolute top-6 left-6 z-10">
               <button onClick={() => setSelectedProduct(null)} className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-zinc-900 shadow-sm border border-black/5 active:scale-95 transition-transform">
                 <ChevronLeft size={20} strokeWidth={2} />
               </button>
             </div>
          </div>

          <div className="px-6 py-8 pb-40 max-w-xl mx-auto w-full">
             <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-semibold text-zinc-900 leading-tight pr-4">{selectedProduct.name}</h1>
                <span className="font-semibold text-xl text-zinc-900 whitespace-nowrap">{(Number(selectedProduct.price) + calculateSelectionPrice()).toFixed(2)} {restaurant?.currency || '₺'}</span>
             </div>
             <p className="text-zinc-500 text-sm leading-relaxed mb-8">{selectedProduct.description}</p>

             {/* Options */}
             {selectedProduct.options && selectedProduct.options.length > 0 && (
               <div className="mb-8">
                 <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">{t('menu_product_options')}</h3>
                 <div className="space-y-3">
                   {selectedProduct.options.map(opt => (
                     <label key={opt.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 cursor-pointer hover:border-zinc-300 transition-colors">
                       <div className="flex items-center gap-3">
                         <input 
                           type={opt.option_type === 'single' ? 'radio' : 'checkbox'} 
                           checked={!!productSelections.options[opt.id]}
                           onChange={() => handleOptionToggle(opt.id, opt.option_type, selectedProduct.options)}
                           className="w-5 h-5 accent-zinc-900"
                         />
                         <span className="text-sm font-medium text-zinc-700">{opt.name}</span>
                       </div>
                       {parseFloat(opt.price) > 0 && <span className="text-sm text-zinc-500">+{Number(opt.price).toFixed(2)} {restaurant?.currency || '₺'}</span>}
                     </label>
                   ))}
                 </div>
               </div>
             )}

             {/* Modifier Groups */}
             {selectedProduct.modifier_groups && selectedProduct.modifier_groups.length > 0 && selectedProduct.modifier_groups.map(group => (
               <div key={group.id} className="mb-8">
                 <div className="flex items-baseline justify-between mb-4">
                   <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{group.name}</h3>
                   {group.is_required && <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded uppercase tracking-wider">{t('menu_product_required')}</span>}
                 </div>
                 <div className="space-y-3">
                   {group.modifiers.map(mod => (
                     <label key={mod.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 cursor-pointer hover:border-zinc-300 transition-colors">
                       <div className="flex items-center gap-3">
                         <input 
                           type={group.max_choices === 1 ? 'radio' : 'checkbox'}
                           checked={!!productSelections.modifiers[group.id]?.[mod.id]}
                           onChange={() => handleModifierToggle(group.id, mod.id, group.max_choices === 1)}
                           className="w-5 h-5 accent-zinc-900"
                         />
                         <span className="text-sm font-medium text-zinc-700">{mod.name}</span>
                       </div>
                       {parseFloat(mod.price) > 0 && <span className="text-sm text-zinc-500">+{Number(mod.price).toFixed(2)} {restaurant?.currency || '₺'}</span>}
                     </label>
                   ))}
                 </div>
               </div>
             ))}

             {/* Ingredients */}
             {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
               <div className="mb-8">
                 <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">{t('menu_product_ingredients')}</h3>
                 <div className="flex flex-wrap gap-2">
                   {selectedProduct.ingredients.map(ing => (
                     <button
                       key={ing.id}
                       disabled={!ing.is_removable}
                       onClick={() => handleIngredientToggle(ing.id)}
                       className={`px-4 py-2 rounded-lg text-xs font-medium transition-all border ${
                         !ing.is_removable ? 'bg-zinc-100 text-zinc-400 border-zinc-100 cursor-not-allowed' :
                         productSelections.removed_ingredients[ing.id] ? 'bg-white border-zinc-300 text-zinc-400 line-through' :
                         'bg-zinc-900 text-white border-zinc-900'
                       }`}
                     >
                       {ing.name}
                     </button>
                   ))}
                 </div>
                 <p className="text-[10px] text-zinc-400 mt-2">{t('menu_product_ingredients_hint')}</p>
               </div>
             )}

             {/* AI Analysis Box - Sleek */}
             <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 mb-8">
                <h3 className="font-medium text-zinc-900 text-xs mb-3 flex items-center gap-2 uppercase tracking-widest">
                  <Bot size={14} className="text-zinc-400"/> Aşçı AI Notu
                </h3>
                {aiAnalysisLoading ? (
                  <div className="animate-pulse space-y-2"><div className="h-2 bg-zinc-200 rounded w-full"></div><div className="h-2 bg-zinc-200 rounded w-2/3"></div></div>
                ) : (
                  <p className="text-zinc-600 text-[13px] leading-relaxed">{aiAnalysisText}</p>
                )}
             </div>

          </div>

          {/* Bottom Fixed Action Bar */}
          <div className="fixed bottom-0 inset-x-0 bg-white border-t border-zinc-100 p-4 pb-8 z-50 flex justify-center">
             <div className="w-full max-w-[400px] flex gap-3 items-center">
                <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-2xl p-1 h-14">
                  <button onClick={() => setProductQuantity(q => Math.max(0.1, Math.round((Number(q) - 1) * 10) / 10))} className="w-8 h-10 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors"><Minus size={16}/></button>
                  <input type="number" step="0.5" min="0.1" value={productQuantity} onChange={e => setProductQuantity(e.target.value)} className="font-semibold text-base w-8 text-center text-zinc-900 bg-transparent outline-none focus:ring-0 p-0 m-0" />
                  <button onClick={() => setProductQuantity(q => Math.round((Number(q) + 1) * 10) / 10)} className="w-8 h-10 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors"><Plus size={16}/></button>
                </div>
                <button onClick={addToCart} className="flex-1 bg-zinc-900 text-white h-14 rounded-2xl font-medium text-sm flex items-center justify-between px-4 active:scale-95 transition-transform shadow-xl shadow-zinc-900/10 min-w-0">
                  <span className="truncate mr-2">{t('menu_add_to_cart')}</span>
                  <span className="font-bold whitespace-nowrap">{((Number(selectedProduct.price) + calculateSelectionPrice()) * Number(productQuantity)).toFixed(2)} {restaurant?.currency || '₺'}</span>
                </button>
             </div>
          </div>
        </div>
      )}



      {/* RESPONSIVE CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-full lg:w-[400px] h-full bg-[#FAFAFA] flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
            <div className="bg-white h-16 flex items-center px-6 border-b border-zinc-100 justify-between">
              <h2 className="text-base font-semibold text-zinc-900">{t('cart_title')}</h2>
              <button onClick={() => setIsCartOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-500 bg-zinc-50 hover:bg-zinc-100 transition-colors"><X size={16}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {cart.map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-zinc-100 flex flex-col gap-3 shadow-sm">
                  <div className="flex items-start gap-4">
                    {item.product.display_image ? (
                       <img src={item.product.display_image} className="w-16 h-16 rounded-xl object-cover border border-zinc-50" />
                    ) : (
                       <div className="w-16 h-16 rounded-xl bg-zinc-50 flex items-center justify-center"><Utensils size={20} className="text-zinc-300"/></div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                         <h4 className="font-semibold text-zinc-900 text-sm leading-tight pr-4">{item.product.name}</h4>
                         <span className="font-semibold text-zinc-900 text-sm whitespace-nowrap">{((Number(item.product.price) + (item.options_price_total||0)) * item.quantity).toFixed(2)} {restaurant?.currency || '₺'}</span>
                      </div>
                      {item.selections_text && item.selections_text.length > 0 && (
                         <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{item.selections_text.join(', ')}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-lg p-1 w-max">
                           <button onClick={() => updateCartItemQuantity(idx, -1)} className="w-6 h-6 rounded flex items-center justify-center text-zinc-600 bg-white shadow-sm"><Minus size={12}/></button>
                           <input type="number" step="0.5" min="0.1" value={item.quantity} onChange={e => {
                             const val = parseFloat(e.target.value);
                             if (!isNaN(val)) {
                               setCart(prev => { const nc = [...prev]; nc[idx].quantity = val; return nc; });
                             }
                           }} className="font-semibold text-xs w-10 text-center bg-transparent outline-none focus:ring-0" />
                           <button onClick={() => updateCartItemQuantity(idx, 1)} className="w-6 h-6 rounded flex items-center justify-center text-white bg-zinc-900 shadow-sm"><Plus size={12}/></button>
                        </div>
                        <button onClick={() => updateCartItemQuantity(idx, -item.quantity)} className="text-zinc-400 hover:text-red-500 p-2 active:scale-95 transition-transform">
                           <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-zinc-50 pt-3">
                    <input 
                      type="text" 
                      placeholder={t('item_note_placeholder')}
                      value={item.note || ''}
                      onChange={e => {
                        setCart(prev => {
                          const nc = [...prev];
                          nc[idx].note = e.target.value;
                          return nc;
                        });
                      }}
                      className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl px-3 py-2 text-xs font-medium text-zinc-700 outline-none focus:border-zinc-300 transition-colors placeholder:text-zinc-400"
                    />
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-24 text-zinc-400 font-medium flex flex-col items-center">
                  <ShoppingBag size={40} className="mb-4 opacity-30" strokeWidth={1} />
                  {t('cart_empty_state')}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="bg-white p-6 border-t border-zinc-100">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-zinc-500 font-medium text-sm">{t('cart_total_amount')}</span>
                  <span className="text-2xl font-semibold text-zinc-900">{cartTotal.toFixed(2)} {restaurant?.currency || '₺'}</span>
                </div>
                <button onClick={() => { setIsCartOpen(false); router.push(`/m/${resolvedParams.slug}/checkout`); }} className="w-full bg-zinc-900 text-white h-14 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-xl shadow-zinc-900/10">
                  Ödemeye Geç
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TABLE MODAL */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-5">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg text-zinc-900">{t('table_modal_title')}</h3>
              <button onClick={() => setIsTableModalOpen(false)} className="bg-zinc-50 hover:bg-zinc-100 rounded-full p-2 text-zinc-500 transition-colors"><X size={16} /></button>
            </div>
            {tables.length > 0 ? (
              <select value={tableModalInput} onChange={e => setTableModalInput(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 text-sm font-medium text-zinc-900 outline-none mb-6 focus:border-zinc-400 focus:bg-white transition-colors">
                <option value="" disabled>{t('table_modal_select')}</option>
                {tables.map(tableItem => <option key={tableItem.number} value={tableItem.number}>{tableItem.name || t('menu_table_indicator', { tableNumber: tableItem.number })}</option>)}
              </select>
            ) : (
              <input type="text" placeholder={t('table_modal_placeholder', { defaultValue: 'Örn: 12' })} value={tableModalInput} onChange={e => setTableModalInput(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 text-sm font-medium text-zinc-900 outline-none mb-6 focus:border-zinc-400 focus:bg-white transition-colors text-center"/>
            )}
            <button onClick={handleTableSubmit} disabled={!tableModalInput} className="w-full bg-zinc-900 text-white h-12 rounded-xl font-medium text-sm disabled:opacity-50 active:scale-95 transition-transform">{t('table_modal_continue')}</button>
          </div>
        </div>
      )}

      {/* AI BUDGET MODAL */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-5">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg text-zinc-900 flex items-center gap-2">
                <Wallet size={18} className="text-zinc-400"/> Bütçe Planla
              </h3>
              <button onClick={() => setIsBudgetModalOpen(false)} className="bg-zinc-50 hover:bg-zinc-100 rounded-full p-2 text-zinc-500"><X size={16} /></button>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed mb-6">{t('ai_budget_desc')}</p>
            
            <div className="mb-5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">{t('ai_budget_total')}</label>
              <input type="number" placeholder="Örn: 1500" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors"/>
            </div>
            
            <div className="mb-8">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">{t('ai_budget_people')}</label>
              <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-xl p-1 w-max">
                 <button onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))} className="w-10 h-10 bg-white border border-zinc-200 rounded-lg flex items-center justify-center text-zinc-600 active:scale-95 shadow-sm"><Minus size={14}/></button>
                 <span className="font-semibold text-base w-8 text-center">{peopleCount}</span>
                 <button onClick={() => setPeopleCount(peopleCount + 1)} className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-white active:scale-95 shadow-sm"><Plus size={14}/></button>
              </div>
            </div>
            
            <button 
              onClick={async () => {
                setAiAnalysisLoading(true);
                try {
                   const res = await axios.post(`http://localhost:8000/api/public/ai/budget/${resolvedParams.slug}/`, {
                     budget: budgetInput, people_count: peopleCount
                   });
                   if(res.data.success) {
                     setAiRecommendedProductIds(res.data.recommended_product_ids);
                     setIsAiMenuMode(true);
                     setToastMessage({ message: res.data.message, type: 'success' });
                     setIsBudgetModalOpen(false);
                   }
                } catch(e) {
                   setToastMessage({ message: t('menu_err_ai_calc'), type: 'error' });
                } finally {
                   setAiAnalysisLoading(false);
                }
              }} 
              disabled={!budgetInput || aiAnalysisLoading} 
              className="w-full bg-zinc-900 text-white h-12 rounded-xl font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform"
            >
              {aiAnalysisLoading ? <Loader2 className="animate-spin w-4 h-4" /> : t('ai_budget_submit')}
            </button>
          </div>
        </div>
      )}

      {/* AI CHAT MODAL - Minimalist & Elegant */}
      {isAiChatOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#FAFAFA] animate-in slide-in-from-bottom duration-300">
           <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-zinc-50 border border-zinc-200 rounded-full flex items-center justify-center shadow-sm">
                    <Bot size={18} className="text-zinc-900" strokeWidth={1.5} />
                 </div>
                 <div>
                    <h3 className="font-semibold text-sm text-zinc-900">{t('ai_chat_title')}</h3>
                    <div className="flex items-center gap-1.5">
                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                       <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">{t('ai_chat_online')}</p>
                    </div>
                 </div>
              </div>
              <button onClick={() => setIsAiChatOpen(false)} className="bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-full p-2 text-zinc-500 transition-colors"><X size={16} strokeWidth={2} /></button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-5 space-y-5 pb-24 custom-scrollbar">
              <div className="flex items-end gap-2">
                 <div className="w-7 h-7 rounded-full bg-zinc-100 flex-shrink-0 flex items-center justify-center border border-zinc-200 mb-1"><Bot size={14} className="text-zinc-600" /></div>
                 <div className="bg-white border border-zinc-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm text-[13px] leading-relaxed text-zinc-700 max-w-[85%]">
                    Hoş geldiniz {userName || 'Misafir'}. Menümüz hakkında sorular sorabilir, tavsiyeler isteyebilirsiniz.
                 </div>
              </div>
              
              {aiChatHistory.map((msg, idx) => (
                 <div key={idx} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.role === 'assistant' && <div className="w-7 h-7 rounded-full bg-zinc-100 flex-shrink-0 flex items-center justify-center border border-zinc-200 mb-1"><Bot size={14} className="text-zinc-600" /></div>}
                    <div className={`${msg.role === 'user' ? 'bg-zinc-900 text-white rounded-br-none' : 'bg-white border border-zinc-200 text-zinc-700 rounded-bl-none'} px-4 py-3 rounded-2xl shadow-sm text-[13px] leading-relaxed max-w-[85%]`}>
                       {msg.text}
                    </div>
                 </div>
              ))}
              
              {aiAnalysisLoading && (
                 <div className="flex items-end gap-2">
                   <div className="w-7 h-7 rounded-full bg-zinc-100 flex-shrink-0 flex items-center justify-center border border-zinc-200 mb-1"><Bot size={14} className="text-zinc-600" /></div>
                   <div className="bg-white border border-zinc-200 px-5 py-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1.5 items-center">
                     <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                     <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-75"></span>
                     <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-150"></span>
                   </div>
                 </div>
              )}
           </div>
           
           <div className="absolute bottom-0 inset-x-0 bg-white border-t border-zinc-100 p-4 pb-6">
              <form onSubmit={async (e) => {
                 e.preventDefault();
                 if(!aiChatMessage.trim()) return;
                 const userMsg = aiChatMessage;
                 setAiChatHistory(prev => [...prev, {role: 'user', text: userMsg}]);
                 setAiChatMessage('');
                 setAiAnalysisLoading(true);
                 try {
                    const res = await axios.post(`http://localhost:8000/api/public/ai/chat/${resolvedParams.slug}/`, { message: userMsg });
                    if(res.data.success) {
                       setAiChatHistory(prev => [...prev, {role: 'assistant', text: res.data.reply}]);
                       if(res.data.recommended_product_ids && res.data.recommended_product_ids.length > 0) {
                          setAiRecommendedProductIds(res.data.recommended_product_ids);
                          setIsAiMenuMode(true);
                       }
                    }
                 } catch(err) {
                    setAiChatHistory(prev => [...prev, {role: 'assistant', text: t('menu_err_ai_conn')}]);
                 } finally {
                    setAiAnalysisLoading(false);
                 }
              }} className="flex gap-3 max-w-xl mx-auto w-full">
                 <input type="text" value={aiChatMessage} onChange={e => setAiChatMessage(e.target.value)} placeholder={t('ai_chat_placeholder')} className="flex-1 bg-zinc-50 border border-zinc-200 rounded-full px-5 py-3.5 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-400 transition-colors" />
                 <button type="submit" disabled={aiAnalysisLoading || !aiChatMessage.trim()} className="bg-zinc-900 text-white w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50 active:scale-95 transition-transform shadow-sm"><Plus size={18} className="rotate-45"/></button>
              </form>
           </div>
        </div>
      )}

      {/* ORDER TRACKING MODAL */}
      {isTrackingModalOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#FAFAFA] rounded-3xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden">
            <div className="bg-white border-b border-zinc-100 p-5 flex justify-between items-center sticky top-0 z-10">
              <h3 className="font-semibold text-lg text-zinc-900">{t('tracking_title')}</h3>
              <button onClick={() => setIsTrackingModalOpen(false)} className="bg-zinc-50 hover:bg-zinc-100 rounded-full p-2 text-zinc-500 transition-colors"><X size={16} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {isTrackingLoading && orderStatuses.length === 0 ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>
              ) : orderStatuses.length > 0 ? (
                orderStatuses.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">{t('tracking_code')}</span>
                        <span className="font-semibold text-zinc-900">{order.tracking_code || `#ORD-${order.id}`}</span>
                      </div>
                      <span className="font-bold text-zinc-900">{Number(order.total_amount).toFixed(2)} {restaurant?.currency || '₺'}</span>
                    </div>
                    
                    <div className="relative mb-6">
                      <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-zinc-100 -translate-y-1/2"></div>
                      <div className="relative flex justify-between z-10">
                         {['NEW', 'PREPARING', 'READY'].map((step, idx) => {
                            const steps = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'];
                            let currentIdx = steps.indexOf(order.status);
                            if (currentIdx === 1) currentIdx = 2; // Treat ACCEPTED as PREPARING
                            
                            let stepIdx = steps.indexOf(step);
                            if (stepIdx === 1) stepIdx = 2;
                            
                            const isCompleted = currentIdx >= stepIdx;
                            const isCurrent = currentIdx === stepIdx || (step === 'READY' && currentIdx > stepIdx);
                            const stepNames = {'NEW': 'Alındı', 'PREPARING': 'Hazırlanıyor', 'READY': 'Hazır'};
                            
                            return (
                              <div key={step} className="flex flex-col items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isCompleted ? 'bg-zinc-900 text-white' : 'bg-white border-2 border-zinc-200 text-zinc-400'}`}>
                                  {isCompleted ? <CheckCircle2 size={12}/> : (idx+1)}
                                </div>
                                <span className={`text-[10px] font-semibold uppercase tracking-wider ${isCurrent ? 'text-zinc-900' : 'text-zinc-400'}`}>{stepNames[step as keyof typeof stepNames]}</span>
                              </div>
                            );
                         })}
                      </div>
                    </div>
                    
                    <div className="space-y-2 bg-zinc-50 rounded-xl p-3">
                      {order.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="text-zinc-600"><span className="font-semibold text-zinc-900">{Number(item.quantity)}x</span> {item.product_name}</span>
                          <span className="font-medium text-zinc-900">{Number(item.total_price).toFixed(2)} {restaurant?.currency || '₺'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-zinc-500 font-medium text-sm">{t('tracking_no_orders')}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RESERVATION MODAL */}
      {isReservationModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white w-full max-w-lg mx-auto rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center">
                    <Calendar size={16} className="text-zinc-700" />
                  </div>
                  <h3 className="font-semibold text-lg">{t('res_title')}</h3>
               </div>
               <button onClick={() => setIsReservationModalOpen(false)} className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 active:scale-95">
                 <X size={18} />
               </button>
            </div>
            
            <form onSubmit={handleReservationSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1.5 ml-1">{t('res_date')}</label>
                  <input type="date" value={resData.date} onChange={e => setResData({...resData, date: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1.5 ml-1">{t('res_time')}</label>
                  <input type="time" value={resData.time} onChange={e => setResData({...resData, time: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors" required />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 ml-1">{t('res_guest_count')}</label>
                <div className="flex items-center gap-3">
                   <button type="button" onClick={() => setResData({...resData, guest_count: Math.max(1, resData.guest_count - 1)})} className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-xl font-medium active:scale-95">-</button>
                   <div className="flex-1 text-center font-bold text-xl">{resData.guest_count}</div>
                   <button type="button" onClick={() => setResData({...resData, guest_count: resData.guest_count + 1})} className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-xl font-medium active:scale-95">+</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 ml-1">{t('res_name')}</label>
                <input type="text" value={resData.customer_name} onChange={e => setResData({...resData, customer_name: e.target.value})} placeholder={t('res_name')} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors" required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 ml-1">{t('res_phone')}</label>
                <input type="tel" value={resData.customer_phone} onChange={e => setResData({...resData, customer_phone: e.target.value})} placeholder="05XX XXX XX XX" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors" required />
              </div>

              <button type="submit" disabled={resLoading} className="w-full bg-zinc-900 text-white font-medium py-4 rounded-xl mt-4 active:scale-95 transition-transform flex justify-center items-center disabled:opacity-50">
                {resLoading ? <Loader2 size={20} className="animate-spin" /> : t('res_submit')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TOAST MESSAGE */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[150] px-5 py-3 rounded-full shadow-xl text-sm font-medium animate-in slide-in-from-top-4 flex items-center gap-2 border" style={{ 
            backgroundColor: toastMessage.type === 'success' ? '#18181b' : '#ef4444', 
            color: 'white',
            borderColor: toastMessage.type === 'success' ? '#27272a' : '#dc2626'
        }}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={16} /> : <X size={16} />}
          {toastMessage.message}
        </div>
      )}

      {/* STICKY BOTTOM CART BAR */}
      {!selectedProduct && cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-[68px] left-0 right-0 z-[90] bg-white/90 backdrop-blur-xl border-t border-zinc-200 p-4 pb-4 animate-in slide-in-from-bottom-10 duration-300 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-zinc-900 text-white h-14 rounded-2xl px-5 flex items-center justify-between shadow-md active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
               <div className="relative flex items-center justify-center">
                 <ShoppingBag size={20} className="text-white" strokeWidth={2} />
                 <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                   {cartCount}
                 </span>
               </div>
               <div className="h-6 w-px bg-white/20 mx-1"></div>
               <span className="font-bold text-sm tracking-wide">{cartTotal.toFixed(2)} {restaurant?.currency || '₺'}</span>
            </div>
            <div className="text-sm font-semibold flex items-center gap-1">
              {t('go_to_cart')} <ChevronRight size={16} />
            </div>
          </button>
        </div>
      )}

    </div>
  );
}
