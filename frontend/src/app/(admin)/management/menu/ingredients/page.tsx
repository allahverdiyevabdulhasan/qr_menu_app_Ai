"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2, Plus, ChefHat, Search, UtensilsCrossed, Settings2, X, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from '@/components/LanguageProvider';

interface ProductIngredient {
  id: number;
  product: number;
  inventory_item: number;
  quantity_used: string;
}

export default function RecipesPage() {
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState<ProductIngredient[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
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
      toast.error(t('ingredients_error_fetch'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        quantity_used: formData.quantity_used ? String(formData.quantity_used).replace(',', '.') : '0'
      };

      if (editingId) {
        await api.put(`/inventory/productingredient/${editingId}/`, payload);
        toast.success(t('ingredients_success_update'));
      } else {
        await api.post('/inventory/productingredient/', payload);
        toast.success(t('ingredients_success_add'));
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        product: '',
        inventory_item: '',
        quantity_used: '0'
      });
      fetchData();
    } catch (err: any) {
      let errMsg = t('ingredients_error_generic');
      if (err.response?.data) {
        const data = err.response.data;
        const messages = Object.values(data).flat().join(', ');
        errMsg = messages || errMsg;
      }
      toast.error(errMsg);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('ingredients_confirm_delete'))) return;
    try {
      await api.delete(`/inventory/productingredient/${id}/`);
      toast.success(t('ingredients_success_delete'));
      fetchData();
    } catch (err) {
      toast.error(t('ingredients_error_delete'));
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
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('ingredients_title')}</h1>
            <p className="text-gray-500 font-medium text-sm mt-0.5">{t('ingredients_desc')}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('ingredients_search_placeholder')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => { setEditingId(null); setFormData({ product: '', inventory_item: '', quantity_used: '0' }); setIsModalOpen(true); }}
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('ingredients_btn_new')}
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('ingredients_empty_title')}</h2>
          <p className="text-gray-500 max-w-sm">{t('ingredients_empty_desc')}</p>
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
                      <p className="text-xs font-medium text-amber-600">{t('ingredients_count', { count: productIngredients.length })}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingId(null);
                      setFormData({ ...formData, product: product.id.toString(), inventory_item: '', quantity_used: '0' });
                      setIsModalOpen(true);
                    }}
                    title={t('ingredients_tooltip_add')}
                    className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-amber-600 hover:border-amber-200 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />
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
                              {invItem ? invItem.name : t('ingredients_unknown_stock')}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-sm bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm text-gray-600">
                                {ing.quantity_used} {invItem?.unit || ''}
                              </span>
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => {
                                    setEditingId(ing.id);
                                    setFormData({
                                      product: ing.product.toString(),
                                      inventory_item: ing.inventory_item.toString(),
                                      quantity_used: ing.quantity_used.toString()
                                    });
                                    setIsModalOpen(true);
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                                >
                                  <Settings2 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDelete(ing.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-6">
                      <p className="text-sm font-medium text-gray-400 mb-2">{t('ingredients_empty_product')}</p>
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
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <ChefHat className="text-amber-500" />
                {editingId ? t('ingredients_modal_title_update') : t('ingredients_modal_title_new')}
              </h2>
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitRecipe} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">{t('ingredients_label_product')} <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={formData.product}
                  onChange={(e) => setFormData({...formData, product: e.target.value})}
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all bg-white font-medium text-gray-700"
                >
                  <option value="" disabled>{t('ingredients_select_product')}</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">{t('ingredients_label_stock')} <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={formData.inventory_item}
                  onChange={(e) => setFormData({...formData, inventory_item: e.target.value})}
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all bg-white font-medium text-gray-700"
                >
                  <option value="" disabled>{t('ingredients_select_stock')}</option>
                  {inventoryItems.map(i => (
                    <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">{t('ingredients_label_quantity')} <span className="text-red-500">*</span></label>
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
                  {t('ingredients_btn_cancel')}
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? t('ingredients_btn_save') : t('ingredients_btn_add'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
