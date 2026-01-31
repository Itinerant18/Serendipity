import { create } from 'zustand';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';

/**
 * Wishlist Store
 * Handles frontend state and API interactions for user wishlist
 * Uses Optimistic Updates with Undo for best UX
 */
const useWishlistStore = create((set, get) => ({
    items: [],
    isLoading: false,
    error: null,
    removingItemId: null,
    clearingWishlist: false,
    pendingOperations: new Map(), // Tracks in-flight operations
    operationCount: 0, // Total pending operations

    /**
     * Helper: Update operation count
     */
    updateOperationCount: () => {
        const count = get().pendingOperations.size;
        set({ operationCount: count });
    },

    /**
     * Fetch user's wishlist from backend
     * Merges server data with pending operations to prevent flicker
     */
    fetchWishlist: async () => {
        const { pendingOperations } = get();
        
        // Don't show loading if we have pending operations (prevents flicker)
        if (pendingOperations.size === 0) {
            set({ isLoading: true });
        }
        
        try {
            const serverData = await apiRequest('/api/wishlist');
            
            // Merge server data with pending operations
            let mergedItems = [...serverData];
            
            pendingOperations.forEach((op, productId) => {
                if (op.type === 'remove') {
                    // Filter out items that are being removed
                    mergedItems = mergedItems.filter(item => 
                        String(item.id) !== productId
                    );
                } else if (op.type === 'add') {
                    // Add pending items if not already in merged data
                    const exists = mergedItems.some(item => String(item.id) === productId);
                    if (!exists && op.item) {
                        mergedItems = [op.item, ...mergedItems];
                    }
                }
            });
            
            set({ 
                items: mergedItems, 
                isLoading: false, 
                error: null 
            });
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            set({ isLoading: false, error: error.message });
        }
    },

    /**
     * Add item to wishlist
     * Optimistic update with rollback on failure
     */
    addToWishlist: async (product) => {
        const normalizedProductId = String(product.id).trim();
        const currentItems = get().items;
        
        // Check if already in wishlist
        if (currentItems.some(item => String(item.id) === normalizedProductId)) {
            toast.info('Item already in wishlist');
            return;
        }

        // Check if already pending
        if (get().pendingOperations.has(normalizedProductId)) {
            toast.info('Already processing this item...');
            return;
        }

        // Create optimistic item
        const optimisticItem = { 
            ...product, 
            id: normalizedProductId,
            added_at: new Date().toISOString() 
        };

        // Optimistic update
        const newItems = [optimisticItem, ...currentItems];
        const newPendingOps = new Map(get().pendingOperations).set(normalizedProductId, {
            type: 'add',
            item: optimisticItem,
            timestamp: Date.now()
        });
        
        set({ 
            items: newItems,
            pendingOperations: newPendingOps
        });
        get().updateOperationCount();

        // Show undo toast
        const undoToast = toast.success('Added to wishlist', {
            action: {
                label: 'Undo',
                onClick: () => {
                    // Remove the item immediately
                    const updatedItems = get().items.filter(item => 
                        String(item.id) !== normalizedProductId
                    );
                    const cleanedOps = new Map([...get().pendingOperations].filter(
                        ([id]) => id !== normalizedProductId
                    ));
                    
                    set({ 
                        items: updatedItems,
                        pendingOperations: cleanedOps
                    });
                    get().updateOperationCount();
                    toast.info('Add operation cancelled');
                }
            },
            duration: 3000
        });

        try {
            await apiRequest('/api/wishlist', {
                method: 'POST',
                body: JSON.stringify({ productId: normalizedProductId }),
            });

            // Success - dismiss undo toast
            toast.dismiss(undoToast);
            
            // Keep in pending for a grace period (prevents race conditions)
            setTimeout(() => {
                const cleanedOps = new Map([...get().pendingOperations].filter(
                    ([id]) => id !== normalizedProductId
                ));
                set({ pendingOperations: cleanedOps });
                get().updateOperationCount();
            }, 1000);
            
        } catch (error) {
            console.error('Failed to add to wishlist:', error);
            
            // Revert on failure
            const cleanedOps = new Map([...get().pendingOperations].filter(
                ([id]) => id !== normalizedProductId
            ));
            
            set({ 
                items: currentItems,
                pendingOperations: cleanedOps,
                error: error.message
            });
            get().updateOperationCount();
            
            toast.dismiss(undoToast);
            toast.error('Failed to add to wishlist - item removed');
        }
    },

    /**
     * Remove item from wishlist
     * Optimistic update with undo and rollback
     */
    removeFromWishlist: async (productId) => {
        const normalizedProductId = String(productId).trim();
        const currentItems = get().items;
        
        // Check if already pending
        if (get().pendingOperations.has(normalizedProductId)) {
            toast.info('Already removing this item...');
            return;
        }

        // Find the item to remove
        const itemToRemove = currentItems.find(item => 
            String(item.id) === normalizedProductId
        );
        
        if (!itemToRemove) {
            toast.error('Item not found in wishlist');
            return;
        }

        // Optimistic removal
        const newItems = currentItems.filter(item => 
            String(item.id) !== normalizedProductId
        );
        const newPendingOps = new Map(get().pendingOperations).set(normalizedProductId, {
            type: 'remove',
            item: itemToRemove,
            timestamp: Date.now()
        });
        
        set({ 
            items: newItems,
            removingItemId: normalizedProductId,
            pendingOperations: newPendingOps,
            error: null
        });
        get().updateOperationCount();

        // Show undo toast
        const undoToast = toast.success('Item removed', {
            action: {
                label: 'Undo',
                onClick: () => {
                    // Restore the item
                    const restoredItems = [...get().items, itemToRemove].sort((a, b) => 
                        new Date(b.added_at || 0) - new Date(a.added_at || 0)
                    );
                    const cleanedOps = new Map([...get().pendingOperations].filter(
                        ([id]) => id !== normalizedProductId
                    ));
                    
                    set({ 
                        items: restoredItems,
                        removingItemId: null,
                        pendingOperations: cleanedOps
                    });
                    get().updateOperationCount();
                    toast.info('Item restored');
                }
            },
            duration: 3000
        });

        try {
            await apiRequest(`/api/wishlist/${normalizedProductId}`, {
                method: 'DELETE',
            });

            // Success - dismiss undo toast
            toast.dismiss(undoToast);
            
            // Clear removing state after grace period
            setTimeout(() => {
                const cleanedOps = new Map([...get().pendingOperations].filter(
                    ([id]) => id !== normalizedProductId
                ));
                set({ 
                    removingItemId: null,
                    pendingOperations: cleanedOps
                });
                get().updateOperationCount();
            }, 1000);
            
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
            
            // Restore on failure
            const cleanedOps = new Map([...get().pendingOperations].filter(
                ([id]) => id !== normalizedProductId
            ));
            
            set({ 
                items: currentItems,
                removingItemId: null,
                pendingOperations: cleanedOps,
                error: error.message
            });
            get().updateOperationCount();
            
            toast.dismiss(undoToast);
            toast.error('Failed to remove item - restored to wishlist');
        }
    },

    /**
     * Check if item is in wishlist (including pending adds)
     */
    isInWishlist: (productId) => {
        const normalizedId = String(productId).trim();
        const { items, pendingOperations } = get();
        
        // Check if item exists in current items
        const inItems = items.some(item => String(item.id) === normalizedId);
        
        // Check pending operations
        const pendingOp = pendingOperations.get(normalizedId);
        if (pendingOp) {
            return pendingOp.type === 'add';
        }
        
        return inItems;
    },

    /**
     * Sort/Reorder items (Client-side only)
     */
    reorderWishlist: (newOrder) => {
        set({ items: newOrder });
    },

    /**
     * Clear entire wishlist
     * Stores backup for potential restore
     */
    clearWishlist: async () => {
        const currentItems = get().items;
        
        if (currentItems.length === 0) {
            toast.info('Wishlist is already empty');
            return;
        }

        // Check if clear is already in progress
        if (get().clearingWishlist) {
            toast.info('Already clearing wishlist...');
            return;
        }

        // Store backup
        const backupItems = [...currentItems];

        // Optimistic clear
        set({ 
            items: [],
            clearingWishlist: true,
            error: null
        });

        // Show undo toast
        const undoToast = toast.success('Wishlist cleared', {
            action: {
                label: 'Undo',
                onClick: () => {
                    // Restore all items
                    set({ 
                        items: backupItems,
                        clearingWishlist: false
                    });
                    toast.info('Wishlist restored');
                }
            },
            duration: 5000 // Longer for clear all
        });

        try {
            await apiRequest('/api/wishlist/clear', {
                method: 'DELETE',
            });

            // Success - dismiss undo toast
            toast.dismiss(undoToast);
            toast.success('Wishlist permanently cleared');
            
        } catch (error) {
            console.error('Failed to clear wishlist:', error);
            
            // Restore on failure
            set({ 
                items: backupItems,
                clearingWishlist: false,
                error: error.message
            });
            
            toast.dismiss(undoToast);
            toast.error('Failed to clear wishlist - items restored');
        }
    },

    /**
     * Get count of items (excluding pending removals)
     */
    getWishlistCount: () => {
        const { items, pendingOperations } = get();
        let count = items.length;
        
        pendingOperations.forEach((op) => {
            if (op.type === 'add') count++;
            if (op.type === 'remove') count--;
        });
        
        return Math.max(0, count);
    }
}));

export default useWishlistStore;
