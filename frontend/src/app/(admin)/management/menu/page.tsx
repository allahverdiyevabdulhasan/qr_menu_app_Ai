"use client";
import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Plus, Search, Edit, Trash2, X, Loader2, Image as ImageIcon, Settings, Eye, Upload, Save } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  is_active?: boolean;
}

interface Product {
  id: number;
  name: string;
  price: string;
  category: number;
  display_image: string;
  is_active: boolean;
  stock_status: string;
  description: string;
  calories: number | null;
  preparation_time: number | null;
  is_popular: boolean;
  is_featured: boolean;
}

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurantSlug, setRestaurantSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  
  // Product Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    price: '', 
    category: '', 
    description: '',
    calories: '',
    preparation_time: '',
    stock_status: 'in_stock',
    is_active: true,
    is_popular: false,
    is_featured: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category Manage Modal states
  const [isCategoryManageOpen, setIsCategoryManageOpen] = useState(false);
  const [catFormData, setCatFormData] = useState({ name: '', is_active: true });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes, restRes] = await Promise.all([
        api.get('/menu/product/'),
        api.get('/menu/category/'),
        api.get('/restaurants/restaurant/')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      if (restRes.data.length > 0) {
        setRestaurantSlug(restRes.data[0].slug);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Product Functions ---
  const handleDelete = async (id: number) => {
    if (!confirm('Bu məhsulu silmək istədiyinizə əminsiniz?')) return;
    try {
      await api.delete(`/menu/product/${id}/`);
      fetchData();
    } catch (err) {
      alert("Xəta baş verdi");
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        price: product.price ? product.price.toString() : '',
        category: product.category ? product.category.toString() : '',
        description: product.description || '',
        calories: product.calories ? product.calories.toString() : '',
        preparation_time: product.preparation_time ? product.preparation_time.toString() : '',
        stock_status: product.stock_status || 'in_stock',
        is_active: product.is_active !== false,
        is_popular: product.is_popular === true,
        is_featured: product.is_featured === true
      });
      if (product.display_image && !product.display_image.includes('unsplash.com')) {
        setPreviewImage(product.display_image);
      } else {
        setPreviewImage(null);
      }
    } else {
      setEditingProduct(null);
      setFormData({ 
        name: '', price: '', category: categories.length > 0 ? categories[0].id.toString() : '', 
        description: '', calories: '', preparation_time: '', stock_status: 'in_stock',
        is_active: true, is_popular: false, is_featured: false
      });
      setPreviewImage(null);
    }
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('price', formData.price);
      payload.append('category', formData.category);
      payload.append('description', formData.description);
      if (formData.calories) payload.append('calories', formData.calories);
      if (formData.preparation_time) payload.append('preparation_time', formData.preparation_time);
      payload.append('stock_status', formData.stock_status);
      payload.append('is_active', formData.is_active ? 'true' : 'false');
      payload.append('is_popular', formData.is_popular ? 'true' : 'false');
      payload.append('is_featured', formData.is_featured ? 'true' : 'false');
      
      if (selectedImage) {
        payload.append('image', selectedImage);
      }
      
      if (editingProduct) {
        await api.patch(`/menu/product/${editingProduct.id}/`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/menu/product/', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      closeModal();
      fetchData();
    } catch (err) {
      alert("Xəta baş verdi");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Category Functions ---
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingCategory) {
        await api.patch(`/menu/category/${editingCategory.id}/`, catFormData);
      } else {
        await api.post('/menu/category/', catFormData);
      }
      setCatFormData({ name: '', is_active: true });
      setEditingCategory(null);
      fetchData();
    } catch (err) {
      alert("Xəta baş verdi");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryDelete = async (id: number) => {
    if (!confirm('Bu kateqoriyanı silmək istədiyinizə əminsiniz? İçindəki məhsullar kateqoriyasız qalacaq.')) return;
    try {
      await api.delete(`/menu/category/${id}/`);
      if (activeCategory === id) setActiveCategory('all');
      fetchData();
    } catch (err) {
      alert("Xəta baş verdi");
    }
  };

  const editCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatFormData({ name: cat.name, is_active: cat.is_active !== false });
  };

  const cancelCategoryEdit = () => {
    setEditingCategory(null);
    setCatFormData({ name: '', is_active: true });
  };

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Menyu İdarəetməsi</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Məhsulların siyahısı, qiymət və tənzimləmələr</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsCategoryManageOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex-1 md:flex-none shadow-sm"
          >
            <Settings size={18} />
            Kateqoriyalar
          </button>
          <button 
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-lg shadow-gray-900/20 flex-1 md:flex-none"
          >
            <Plus size={18} />
            Yeni Məhsul
          </button>
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
            activeCategory === 'all' 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Hamısı
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeCategory === cat.id 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            } ${cat.is_active === false ? 'opacity-50 line-through decoration-red-500' : ''}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-[20px] border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 group flex flex-col">
            <div className="aspect-[4/3] bg-gray-100 rounded-xl relative overflow-hidden group-hover:bg-gray-200 transition-colors">
              {product.display_image && !product.display_image.includes('unsplash.com') ? (
                <img src={product.display_image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                  <ImageIcon size={32} />
                </div>
              )}
              
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                <button onClick={() => openModal(product)} className="p-2 bg-white/90 backdrop-blur-sm text-indigo-600 rounded-lg shadow-sm hover:bg-white hover:scale-110 transition-all">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(product.id)} className="p-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-lg shadow-sm hover:bg-white hover:scale-110 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 mt-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-gray-900 leading-tight">{product.name}</h3>
                <span className="font-black text-indigo-600 text-lg">₼{Number(product.price).toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500 font-medium mb-4 line-clamp-1">
                {product.description || (categories.find(c => c.id === product.category)?.name || 'Kategoriyasız')}
              </p>
            </div>
            
            <div className="flex justify-between items-center border-t border-gray-100 pt-3">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                product.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {product.is_active ? 'Aktiv' : 'Deaktiv'}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                product.stock_status === 'in_stock' ? 'bg-blue-100 text-blue-700' : 
                product.stock_status === 'low_stock' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
              }`}>
                {product.stock_status === 'in_stock' ? 'Stokta Var' : 
                 product.stock_status === 'low_stock' ? 'Az Kaldı' : 'Tükendi'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Category Management Modal */}
      {isCategoryManageOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-black text-gray-900">Kateqoriya İdarəetməsi</h2>
              <button onClick={() => { setIsCategoryManageOpen(false); cancelCategoryEdit(); }} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleCategorySubmit} className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3">
                  {editingCategory ? 'Kateqoriyaya Düzəliş Et' : 'Yeni Kateqoriya'}
                </h3>
                <div className="flex flex-col gap-3">
                  <input 
                    type="text" 
                    required
                    value={catFormData.name}
                    onChange={e => setCatFormData({...catFormData, name: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Məs: İsti İçkilər"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={catFormData.is_active}
                        onChange={e => setCatFormData({...catFormData, is_active: e.target.checked})}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="text-sm font-bold text-gray-700">Aktivdir</span>
                    </label>
                    <div className="flex gap-2">
                      {editingCategory && (
                        <button type="button" onClick={cancelCategoryEdit} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-lg">
                          Ləğv Et
                        </button>
                      )}
                      <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-2">
                        {isSaving && <Loader2 size={14} className="animate-spin" />}
                        {editingCategory ? 'Yenilə' : 'Əlavə Et'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-500 mb-3">Mövcud Kateqoriyalar</h3>
                {categories.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Heç bir kateqoriya tapılmadı.</p>
                )}
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${cat.is_active !== false ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      <span className={`font-bold text-sm ${cat.is_active !== false ? 'text-gray-900' : 'text-gray-400 line-through'}`}>{cat.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => editCategory(cat)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleCategoryDelete(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CRUD Side Drawer for Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={closeModal}
          ></div>
          
          {/* Yan Panel (Drawer) */}
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white shrink-0">
              <h2 className="text-xl font-black text-gray-900">{editingProduct ? 'Məhsula Düzəliş Et' : 'Yeni Məhsul'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
              <form id="productForm" onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                {/* MEDYA */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Medya</h3>
                  <div 
                    className="w-full h-48 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 text-gray-300 mb-2" />
                        <span className="text-sm font-medium text-gray-500">Görsel Yüklemek için Tıklayın</span>
                      </>
                    )}
                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                </div>

                {/* İÇERİK */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Ürün İçeriği</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Ürün Adı</label>
                      <input 
                        type="text" required value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Məs: Tavuk Kanat Kg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Açıklama</label>
                      <textarea 
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                        placeholder="Salata, ekmek, meze ile servis ediliyor..."
                      />
                    </div>
                  </div>
                </div>

                {/* KATEGORİ & FİYAT */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Kategori & Fiyat</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Fiyat (₼)</label>
                      <input 
                        type="number" step="0.01" required value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Kategori</label>
                      <select 
                        required value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      >
                        <option value="" disabled>Seçin...</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* BESİN DEĞERLERİ */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Besin Değerleri</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Kalori (kcal)</label>
                      <input 
                        type="number" value={formData.calories}
                        onChange={e => setFormData({...formData, calories: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Örn: 450"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Hazırlama Süresi (dk)</label>
                      <input 
                        type="number" value={formData.preparation_time}
                        onChange={e => setFormData({...formData, preparation_time: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Örn: 15"
                      />
                    </div>
                  </div>
                </div>

                {/* GÖRÜNÜRLÜK VE STOK */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Görünürlük ve Stok</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Stok Durumu</label>
                      <select 
                        value={formData.stock_status}
                        onChange={e => setFormData({...formData, stock_status: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      >
                        <option value="in_stock">Stokta Var</option>
                        <option value="low_stock">Az Kaldı</option>
                        <option value="out_of_stock">Tükendi</option>
                      </select>
                    </div>

                    <div className="pt-2 space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" checked={formData.is_active}
                          onChange={e => setFormData({...formData, is_active: e.target.checked})}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-sm font-bold text-gray-700">Aktif Ürün</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" checked={formData.is_popular}
                          onChange={e => setFormData({...formData, is_popular: e.target.checked})}
                          className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 border-gray-300"
                        />
                        <span className="text-sm font-bold text-gray-700">Popüler Ürün</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" checked={formData.is_featured}
                          onChange={e => setFormData({...formData, is_featured: e.target.checked})}
                          className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500 border-gray-300"
                        />
                        <span className="text-sm font-bold text-gray-700">Vitrin Ürünü</span>
                      </label>
                    </div>
                  </div>
                </div>

              </form>
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-gray-100 bg-white shrink-0 flex gap-4">
              <button 
                type="button" onClick={closeModal}
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button 
                type="submit" form="productForm" disabled={isSaving}
                className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex justify-center items-center gap-2"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {editingProduct ? 'Değişiklikleri Kaydet' : 'Yeni Ürünü Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
