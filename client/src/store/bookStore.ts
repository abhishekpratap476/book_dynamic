import { create } from 'zustand';
import { Book } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface BookFilters {
  categories: string[];
  minPrice: number;
  maxPrice: number;
  author: string;
  formats: string[];
  minRating: number;
}

interface BookState {
  books: Book[];
  featuredBooks: Book[];
  newReleases: Book[];
  bestsellers: Book[];
  booksByCategory: Record<string, Book[]>;
  currentBook: Book | null;
  filters: BookFilters;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchAllBooks: () => Promise<void>;
  fetchFeaturedBooks: () => Promise<void>;
  fetchNewReleases: () => Promise<void>;
  fetchBestsellers: () => Promise<void>;
  fetchBooksByCategory: (category: string) => Promise<void>;
  fetchBookById: (id: number) => Promise<void>;
  setFilters: (filters: Partial<BookFilters>) => void;
  resetFilters: () => void;
  
  // Filter functions
  getFilteredBooks: () => Book[];
}

const defaultFilters: BookFilters = {
  categories: [],
  minPrice: 0,
  maxPrice: 100,
  author: '',
  formats: [],
  minRating: 0,
};

export const useBookStore = create<BookState>()((set, get) => ({
  books: [],
  featuredBooks: [],
  newReleases: [],
  bestsellers: [],
  booksByCategory: {},
  currentBook: null,
  filters: defaultFilters,
  isLoading: false,
  error: null,
  
  fetchAllBooks: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/books', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      
      const data = await response.json();
      set({ books: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  fetchFeaturedBooks: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/books/featured', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch featured books');
      }
      
      const data = await response.json();
      set({ featuredBooks: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  fetchNewReleases: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/books/new-releases', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch new releases');
      }
      
      const data = await response.json();
      set({ newReleases: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  fetchBestsellers: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/books/bestsellers', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch bestsellers');
      }
      
      const data = await response.json();
      set({ bestsellers: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  fetchBooksByCategory: async (category) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`/api/books/category/${category}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch books in category: ${category}`);
      }
      
      const data = await response.json();
      set(state => ({ 
        booksByCategory: { 
          ...state.booksByCategory, 
          [category]: data 
        },
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  fetchBookById: async (id) => {
    try {
      set({ isLoading: true, error: null, currentBook: null });
      const response = await fetch(`/api/books/${id}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch book with ID: ${id}`);
      }
      
      const data = await response.json();
      set({ currentBook: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  setFilters: (filters) => {
    set(state => ({
      filters: {
        ...state.filters,
        ...filters
      }
    }));
  },
  
  resetFilters: () => {
    set({ filters: defaultFilters });
  },
  
  getFilteredBooks: () => {
    const { books, filters } = get();
    
    return books.filter(book => {
      // Apply category filter
      if (filters.categories.length > 0 && !filters.categories.includes(book.category)) {
        return false;
      }
      
      // Apply price filter
      const price = book.discountedPrice || book.price;
      if (price < filters.minPrice || price > filters.maxPrice) {
        return false;
      }
      
      // Apply author filter
      if (filters.author && !book.author.toLowerCase().includes(filters.author.toLowerCase())) {
        return false;
      }
      
      // Apply format filter
      if (filters.formats.length > 0 && !filters.formats.includes(book.format)) {
        return false;
      }
      
      // Apply rating filter
      if (book.rating < filters.minRating) {
        return false;
      }
      
      return true;
    });
  },
}));
