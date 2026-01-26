import { create } from 'zustand';
import { Product } from '../services/api';

interface ProductState {
  products: Product[];
  categories: string[];
  searchQuery: string;
  selectedCategory: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  totalPages: number;
  isLoading: boolean;
  
  // Actions
  setProducts: (products: Product[]) => void;
  setCategories: (categories: string[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  setTotalPages: (totalPages: number) => void;
  setLoading: (loading: boolean) => void;
  resetFilters: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  categories: [],
  searchQuery: '',
  selectedCategory: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
  page: 1,
  totalPages: 1,
  isLoading: false,

  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setSearchQuery: (searchQuery) => set({ searchQuery, page: 1 }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory, page: 1 }),
  setSortBy: (sortBy) => set({ sortBy, page: 1 }),
  setSortOrder: (sortOrder) => set({ sortOrder, page: 1 }),
  setPage: (page) => set({ page }),
  setTotalPages: (totalPages) => set({ totalPages }),
  setLoading: (isLoading) => set({ isLoading }),
  resetFilters: () => set({
    searchQuery: '',
    selectedCategory: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: 1,
  }),
}));