import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Computed values
  getCartTotal: () => number;
  getCartItemsCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      isOpen: false,

      addItem: (item) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(
          (cartItem) => cartItem.productId === item.productId
        );

        let newItems: CartItem[];
        
        if (existingItemIndex >= 0) {
          // Update existing item quantity
          newItems = items.map((cartItem, index) =>
            index === existingItemIndex
              ? { ...cartItem, quantity: Math.min(cartItem.quantity + item.quantity, item.stock) }
              : cartItem
          );
        } else {
          // Add new item
          newItems = [...items, { ...item, id: Date.now().toString() }];
        }

        const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        set({ items: newItems, totalItems, totalPrice });
      },

      removeItem: (productId) => {
        const { items } = get();
        const newItems = items.filter(item => item.productId !== productId);
        const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        set({ items: newItems, totalItems, totalPrice });
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get();
        const newItems = items.map(item =>
          item.productId === productId
            ? { ...item, quantity: Math.min(Math.max(1, quantity), item.stock) }
            : item
        );
        const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        set({ items: newItems, totalItems, totalPrice });
      },

      clearCart: () => {
        set({ items: [], totalItems: 0, totalPrice: 0 });
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getCartTotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getCartItemsCount: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items, totalItems: state.totalItems, totalPrice: state.totalPrice }),
    }
  )
);