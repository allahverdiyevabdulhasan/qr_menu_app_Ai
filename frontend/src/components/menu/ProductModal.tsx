'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Minus, Plus } from 'lucide-react';
import { Product } from './ProductCard';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  currency?: string;
}

export default function ProductModal({ product, isOpen, onClose, currency = '₺' }: Props) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const orderType = useCartStore((state) => state.orderType);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    // In a real app, you would handle options (modifiers) here
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      options: [], // Options not implemented in this MVP demo
      notes: '',
    });
    toast.success(`${quantity}x ${product.name} sepete eklendi`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        {/* Header Image */}
        <div className="relative w-full h-56 bg-gray-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Görsel Yok
            </div>
          )}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full text-black hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            <span className="text-xl font-bold text-gray-900 ml-4">
              {currency}{product.price.toFixed(2)}
            </span>
          </div>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {product.description}
          </p>

          {/* Options / Modifiers would go here */}
          
        </div>

        {/* Footer / Add to Cart */}
        {orderType !== 'NONE' ? (
          <div className="p-5 border-t bg-gray-50 flex items-center gap-4">
            <div className="flex items-center bg-white border rounded-xl overflow-hidden h-12 shadow-sm">
              <button 
                className="w-12 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-semibold text-lg">{quantity}</span>
              <button 
                className="w-12 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-black text-white h-12 rounded-xl font-medium shadow-md hover:bg-gray-800 transition-colors active:scale-95"
            >
              Sepete Ekle • {currency}{(product.price * quantity).toFixed(2)}
            </button>
          </div>
        ) : (
          <div className="p-5 border-t bg-gray-50 text-center text-gray-500 text-sm">
            Menü görüntüleme modundasınız, sipariş verilemez.
          </div>
        )}
      </div>
    </div>
  );
}
