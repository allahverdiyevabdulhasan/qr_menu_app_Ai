import { create } from 'zustand';

export type OrderType = 'TABLE' | 'DELIVERY' | 'TAKEAWAY' | 'NONE';

export interface CartItemOption {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  cartItemId: string; // Unique ID for the cart item (since same product can have different options)
  productId: string;
  name: string;
  price: number;
  quantity: number;
  options: CartItemOption[];
  notes?: string;
}

interface CartState {
  orderType: OrderType;
  tableId: string | null;
  items: CartItem[];
  
  // Actions
  setOrderContext: (type: OrderType, tableId?: string | null) => void;
  addItem: (item: Omit<CartItem, 'cartItemId'>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Computed
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  orderType: 'NONE',
  tableId: null,
  items: [],
  
  setOrderContext: (type, tableId = null) => set({ orderType: type, tableId }),
  
  addItem: (newItem) => {
    // Generate a pseudo-random ID for the cart item
    const cartItemId = Math.random().toString(36).substring(2, 9);
    set((state) => {
      // Check if exact same item with same options exists
      const existingItemIndex = state.items.findIndex(
        (item) => 
          item.productId === newItem.productId && 
          JSON.stringify(item.options) === JSON.stringify(newItem.options) &&
          item.notes === newItem.notes
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return { items: updatedItems };
      }

      return { items: [...state.items, { ...newItem, cartItemId }] };
    });
  },
  
  removeItem: (cartItemId) => 
    set((state) => ({ items: state.items.filter((i) => i.cartItemId !== cartItemId) })),
    
  updateQuantity: (cartItemId, quantity) => 
    set((state) => ({
      items: state.items.map((i) => 
        i.cartItemId === cartItemId ? { ...i, quantity: Math.max(1, quantity) } : i
      )
    })),
    
  clearCart: () => set({ items: [] }),
  
  getTotalPrice: () => {
    const { items } = get();
    return items.reduce((total, item) => {
      const optionsTotal = item.options.reduce((sum, opt) => sum + opt.price, 0);
      return total + (item.price + optionsTotal) * item.quantity;
    }, 0);
  },
  
  getTotalItems: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.quantity, 0);
  }
}));
