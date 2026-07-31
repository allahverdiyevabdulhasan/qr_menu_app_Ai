'use client';

import Image from 'next/image';
import { Plus } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
}

interface Props {
  product: Product;
  onClick: (product: Product) => void;
  currency?: string;
}

export default function ProductCard({ product, onClick, currency = '₺' }: Props) {
  return (
    <div 
      className="flex bg-white p-4 border-b hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onClick(product)}
    >
      <div className="flex-1 pr-4">
        <h3 className="font-semibold text-gray-900 text-base mb-1">{product.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-2 leading-relaxed">
          {product.description}
        </p>
        <div className="font-bold text-gray-900 mt-auto">
          {currency}{product.price.toFixed(2)}
        </div>
      </div>
      
      <div className="relative w-28 h-28 flex-shrink-0">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover rounded-xl"
            sizes="112px"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center">
            <span className="text-gray-400 text-xs text-center px-2">Görsel Yok</span>
          </div>
        )}
        <button 
          className="absolute -bottom-2 -right-2 bg-white shadow-md border rounded-full p-1.5 text-black hover:bg-gray-100 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClick(product);
          }}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
