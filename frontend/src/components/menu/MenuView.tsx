'use client';

import { useState, useEffect } from 'react';
import CategorySelector from './CategorySelector';
import ProductCard, { Product } from './ProductCard';
import ProductModal from './ProductModal';
import BottomCartBar from './BottomCartBar';
import { useRestaurantStore } from '@/store/restaurantStore';

export default function MenuView({ restaurantSlug }: { restaurantSlug: string }) {
  const { info, categories, products } = useRestaurantStore();
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const currency = info?.currency || '₺';

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  // Filter products by active category
  const filteredProducts = products.filter(p => p.categoryId === activeCategory);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">
      {/* Header Info */}
      <div className="p-4 bg-gray-50 border-b flex items-center gap-3">
        {info?.logoUrl && (
          <img src={info.logoUrl} alt={info.name} className="w-12 h-12 object-contain rounded-md" />
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{info?.name || 'Restoran'}</h1>
          <p className="text-sm text-gray-500 mt-1">Dijital Menü</p>
        </div>
      </div>

      {categories.length > 0 && (
        <CategorySelector 
          categories={categories}
          activeCategoryId={activeCategory}
          onSelectCategory={setActiveCategory}
        />
      )}

      <div className="flex-1 overflow-y-auto">
        {categories.length > 0 && (
          <div className="p-4 bg-gray-50 font-semibold text-gray-700">
            {categories.find(c => c.id === activeCategory)?.name}
          </div>
        )}
        
        {filteredProducts.map(product => (
          <ProductCard 
            key={product.id}
            product={product}
            onClick={setSelectedProduct}
            currency={currency}
          />
        ))}

        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Bu kategoride henüz ürün bulunmuyor.
          </div>
        )}
      </div>

      <BottomCartBar restaurantSlug={restaurantSlug} />

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          isOpen={true}
          onClose={() => setSelectedProduct(null)}
          currency={currency}
        />
      )}
    </div>
  );
}
