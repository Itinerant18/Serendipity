import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useAuthStore from './authStore';
import { API_URL } from '@/lib/api';

const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],

            addToCart: (product) => {
                const { isAuthenticated } = useAuthStore.getState();
                if (!isAuthenticated) {
                    window.location.href = '/account/signin';
                    return;
                }

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

            getCartCount: () => {
                const items = get().items;
                return items.reduce((acc, item) => acc + item.qty, 0);
            },

            getCartTotal: () => {
                const items = get().items;
                return items.reduce((acc, item) => acc + item.qty * item.price, 0);
            },

            /**
             * Sync current cart items to server (saved_carts table).
             * Call this BEFORE logout to preserve cart across sessions.
             */
            syncToServer: async () => {
                const items = get().items;
                const authState = useAuthStore.getState();
                const token = authState.token;

                if (!token || items.length === 0) return;

                try {
                    await fetch(`${API_URL}/api/cart/sync`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            items: items.map(item => ({
                                product_id: item.product,
                                title: item.name || item.title || 'Product',
                                price: item.price,
                                image: item.image || item.images?.[0] || '',
                                quantity: item.qty || 1,
                            })),
                        }),
                    });
                } catch (err) {
                    console.error('Cart sync to server failed:', err);
                }
            },

            /**
             * Restore cart from server (saved_carts table).
             * Call this AFTER login to recover cart from previous session.
             */
            restoreFromServer: async (token) => {
                if (!token) return;

                try {
                    const response = await fetch(`${API_URL}/api/cart`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (!response.ok) return;

                    const data = await response.json();

                    if (data.items && data.items.length > 0) {
                        const currentItems = get().items;
                        // Merge: server items that aren't already in local cart
                        const currentIds = new Set(currentItems.map(i => i.product));
                        const newItems = data.items
                            .filter(item => !currentIds.has(item.product_id))
                            .map(item => ({
                                product: item.product_id,
                                name: item.title,
                                title: item.title,
                                price: item.price,
                                image: item.image,
                                qty: item.quantity || 1,
                            }));

                        if (newItems.length > 0) {
                            set({ items: [...currentItems, ...newItems] });
                        }
                    }
                } catch (err) {
                    console.error('Cart restore from server failed:', err);
                }
            },
        }),
        {
            name: 'cart-storage',
        }
    )
);

export default useCartStore;
