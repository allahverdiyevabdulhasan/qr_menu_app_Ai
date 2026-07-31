"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2, Plus, ChefHat, Search, UtensilsCrossed, Settings2, X, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductIngredient {
  id: number;
  product: number;
  inventory_item: number;
  quantity_used: string;
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<ProductIngredient[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    product: '',
    inventory_item: '',
    quantity_used: '0'
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [recipesRes, productsRes, inventoryRes] = await Promise.all([
        api.get('/inventory/productingredient/'),
        api.get('/menu/product/'),
        api.get('/inventory/inventoryitem/')
      ]);
      setRecipes(recipesRes.data);
      setProducts(productsRes.data);
      setInventoryItems(inventoryRes.data);
    } catch (err: any) {
      toast.error('Məlumatları yükləmək mümkün olmadı.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/inventory/productingredient/', formData);
      toast.success('Resept (İnqrediyent) uğurla əlavə edildi!');
      setIsModalOpen(false);
      setFormData({
        product: '',
        inventory_item: '',
        quantity_used: '0'
      });
      fetchData();
    } catch (err: any) {
      toast.error('Əlavə edilərkən xəta baş verdi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group ingredients by product
  const groupedRecipes: { [key: number]: ProductIngredient[] } = {};
  recipes.forEach(r => {
    if (!groupedRecipes[r.product]) {
      groupedRecipes[r.product] = [];
    }
    groupedRecipes[r.product].push(r);
  });

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 shadow-sm">
            <ChefHat className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Reçeteler & İçerikler</h1>
            <p className="text-gray-500 font-medium text-sm mt-0.5">Məhsulların inqrediyentlərini idarə edin</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Məhsul axtar..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Yeni İnqrediyent
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4 bg-white rounded-[24px] border border-gray-100 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <p className="text-gray-500 font-medium">Məlumatlar yüklənir...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-white rounded-[24px] border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
            <UtensilsCrossed className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Məlumat Tapılmadı</h2>
          <p className="text-gray-500 max-w-sm">Axtarışa uyğun məhsul yoxdur.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProducts.map(product => {
            const productIngredients = groupedRecipes[product.id] || [];
            if (productIngredients.length === 0 && searchQuery) return null; // Hide empty products when searching
            
            return (
              <div key={product.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                        <FileText className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900">{product.name}</h3>
                      <p className="text-xs font-medium text-amber-600">{productIngredients.length} İnqrediyent</p>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-amber-600 hover:border-amber-200 transition-colors shadow-sm">
                    <Settings2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="p-5 flex-grow">
                  {productIngredients.length > 0 ? (
                    <div className="space-y-3">
                      {productIngredients.map(ing => {
                        const invItem = inventoryItems.find(i => i.id === ing.inventory_item);
                        return (
                          <div key={ing.id} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-amber-100 transition-colors">
                            <span className="font-medium text-sm text-gray-700 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                              {invItem ? invItem.name : 'Bilinməyən Stok'}
                            </span>
                            <span className="font-bold text-sm bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm text-gray-600">
                              {ing.quantity_used} {invItem?.unit || ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-6">
                      <p className="text-sm font-medium text-gray-400 mb-2">Bu məhsul üçün heç bir inqrediyent əlavə edilməyib.</p>
                      <button 
                        onClick={() => {
                          setFormData({ ...formData, product: product.id.toString() });
                          setIsModalOpen(true);
                        }}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        + İlk İnqrediyenti Əlavə Et
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Recipe/Ingredient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-600" />
                Yeni İnqrediyent
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-200 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateRecipe} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Məhsul (Yemək/İçki) <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={formData.product}
                  onChange={(e) => setFormData({...formData, product: e.target.value})}
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all bg-white font-medium text-gray-700"
                >
                  <option value="" disabled>Məhsul seçin</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">İstifadə Olunacaq Stok (İnqrediyent) <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={formData.inventory_item}
                  onChange={(e) => setFormData({...formData, inventory_item: e.target.value})}
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all bg-white font-medium text-gray-700"
                >
                  <option value="" disabled>Stok seçin</option>
                  {inventoryItems.map(i => (
                    <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">İstifadə Miqdarı <span className="text-red-500">*</span></label>
                <input 
                  type="number"
                  step="0.01" 
                  required
                  value={formData.quantity_used}
                  onChange={(e) => setFormData({...formData, quantity_used: e.target.value})}
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  Ləğv Et
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yadda Saxla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
