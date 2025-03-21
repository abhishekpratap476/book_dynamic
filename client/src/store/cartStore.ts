import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiRequest } from '@/lib/queryClient';

interface CartItem {
  id: number;
  quantity: number;
  book: {
    id: number;
    title: string;
    author: string;
    price: number;
    discountedPrice?: number;
    coverImage: string;
  };
}

interface CartState {
  items: CartItem[];
  total: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (bookId: number, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      isLoading: false,
      error: null,
      
      fetchCart: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch('/api/cart', {
            credentials: 'include',
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch cart');
          }
          
          const data = await response.json();
          set({ 
            items: data.items, 
            total: data.total,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred', 
            isLoading: false 
          });
        }
      },
      
      addToCart: async (bookId, quantity) => {
        try {
          set({ isLoading: true, error: null });
          await apiRequest('POST', '/api/cart', { bookId, quantity });
          await get().fetchCart();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add item to cart', 
            isLoading: false 
          });
        }
      },
      
      updateQuantity: async (itemId, quantity) => {
        try {
          set({ isLoading: true, error: null });
          await apiRequest('PUT', `/api/cart/${itemId}`, { quantity });
          await get().fetchCart();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update quantity', 
            isLoading: false 
          });
        }
      },
      
      removeItem: async (itemId) => {
        try {
          set({ isLoading: true, error: null });
          await apiRequest('DELETE', `/api/cart/${itemId}`);
          await get().fetchCart();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to remove item', 
            isLoading: false 
          });
        }
      },
      
      clearCart: async () => {
        try {
          set({ isLoading: true, error: null });
          await apiRequest('DELETE', '/api/cart');
          set({ 
            items: [], 
            total: 0,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to clear cart', 
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'cart-storage',
      // Only persist the items and total, not the loading state or errors
      partialize: (state) => ({ items: state.items, total: state.total }),
    }
  )
);
