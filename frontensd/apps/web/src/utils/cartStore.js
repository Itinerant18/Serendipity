import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],

            // Actions
            addToCart: (product) => {
                const items = get().items;
                const existingItem = items.find((item) => item.product === product._id || item.product === product.id);

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            (item.product === product._id || item.product === product.id)
                                ? { ...item, qty: item.qty + 1 }
                                : item
                        ),
                    });
                } else {
                    set({
                        items: [...items, {
                            ...product,
                            product: product._id || product.id,
                            qty: 1
                        }],
                    });
                }
            },

            removeFromCart: (id) => {
                set({
                    items: get().items.filter((item) => item.product !== id),
                });
            },

            updateQuantity: (id, qty) => {
                set({
                    items: get().items.map((item) =>
                        item.product === id ? { ...item, qty: Number(qty) } : item
                    ),
                });
            },

            clearCart: () => set({ items: [] }),

            // Getters (Derived State)
            getCartCount: () => {
                const items = get().items;
                return items.reduce((acc, item) => acc + item.qty, 0);
            },

            getCartTotal: () => {
                const items = get().items;
                return items.reduce((acc, item) => acc + item.qty * item.price, 0);
            }
        }),
        {
            name: 'cart-storage', // name of the item in the storage (must be unique)
        }
    )
);

export default useCartStore;
