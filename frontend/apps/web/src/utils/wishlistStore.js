import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';

/**
 * Wishlist Store
 * Handles frontend state and API interactions for user wishlist
 */
const useWishlistStore = create(
    persist(
        (set, get) => ({
            items: [],
            isLoading: false,
            error: null,

            // Fetch user's wishlist from backend
            fetchWishlist: async () => {
                set({ isLoading: true });
                try {
                    const data = await apiRequest('/api/wishlist');
                    set({ items: data, isLoading: false, error: null });
                } catch (error) {
                    console.error('Error fetching wishlist:', error);
                    set({ isLoading: false, error: error.message });
                    // Don't toast on fetch error to avoid spamming user on load
                }
            },

            // Add item to wishlist
            addToWishlist: async (product) => {
                // Optimistic update
                const currentItems = get().items;
                if (currentItems.some(item => item.id === product.id)) {
                    toast.info('Item already in wishlist');
                    return;
                }

                const optimisticItem = { ...product, added_at: new Date().toISOString() };
                set({ items: [optimisticItem, ...currentItems] });
                toast.success('Added to wishlist');

                try {
                    await apiRequest('/api/wishlist', {
                        method: 'POST',
                        body: JSON.stringify({ productId: product.id }),
                    });
                } catch (error) {
                    console.error('Failed to add to wishlist:', error);
                    // Revert on failure
                    set({ items: currentItems });
                    toast.error('Failed to add to wishlist');
                }
            },

            // Remove item from wishlist
            removeFromWishlist: async (productId) => {
                // Optimistic update
                const currentItems = get().items;
                const newItems = currentItems.filter((item) => item.id !== productId);
                set({ items: newItems });
                toast.success('Removed from wishlist');

                try {
                    await apiRequest(`/api/wishlist/${productId}`, {
                        method: 'DELETE',
                    });
                } catch (error) {
                    console.error('Failed to remove from wishlist:', error);
                    // Revert on failure
                    set({ items: currentItems });
                    toast.error('Failed to remove from wishlist');
                }
            },

            // Check if item is in wishlist
            isInWishlist: (productId) => {
                return get().items.some((item) => item.id === productId);
            },

            // Sort/Reorder items (Client-side only preference for now)
            reorderWishlist: (newOrder) => {
                set({ items: newOrder });
            },

            clearWishlist: async () => {
                const currentItems = get().items;
                set({ items: [] }); // Optimistic clear
                toast.success('Wishlist cleared');

                try {
                    await apiRequest('/api/wishlist/clear', {
                        method: 'DELETE',
                    });
                } catch (error) {
                    console.error('Failed to clear wishlist:', error);
                    set({ items: currentItems }); // Revert on failure
                    toast.error('Failed to clear wishlist');
                }
            }
        }),
        {
            name: 'wishlist-storage', // unique name
            partialize: (state) => ({ items: state.items }), // persist items
        }
    )
);

export default useWishlistStore;
