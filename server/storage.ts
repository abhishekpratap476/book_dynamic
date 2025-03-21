import { 
  Book, InsertBook, 
  CartItem, InsertCartItem, 
  Order, InsertOrder, 
  OrderItem, InsertOrderItem, 
  Analytics, InsertAnalytics,
  SalesData, InsertSalesData,
  CategoryData, InsertCategoryData
} from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  // Book Operations
  getAllBooks(): Promise<Book[]>;
  getBookById(id: number): Promise<Book | undefined>;
  getBooksByCategory(category: string): Promise<Book[]>;
  getFeaturedBooks(): Promise<Book[]>;
  getNewReleases(): Promise<Book[]>;
  getBestsellers(): Promise<Book[]>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, book: Partial<Book>): Promise<Book | undefined>;
  deleteBook(id: number): Promise<boolean>;
  
  // Cart Operations
  getCartItems(sessionId: string): Promise<CartItem[]>;
  getCartItemWithBook(sessionId: string): Promise<(CartItem & { book: Book })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;
  
  // Order Operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrdersBySessionId(sessionId: string): Promise<Order[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  getOrderItemsWithBooks(orderId: number): Promise<(OrderItem & { book: Book })[]>;
  
  // AI Analytics Operations
  getPricingAnalytics(): Promise<Analytics[]>;
  getPricingAnalyticsWithBooks(): Promise<(Analytics & { book: Book })[]>;
  createPricingAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  
  // Sales Data Operations
  getSalesData(): Promise<SalesData[]>;
  getSalesDataByCategory(): Promise<{category: string, sales: number}[]>;
  createSalesData(data: InsertSalesData): Promise<SalesData>;
  
  // Category Data Operations
  getCategoryData(): Promise<CategoryData[]>;
  createCategoryData(data: InsertCategoryData): Promise<CategoryData>;
  updateCategoryData(id: number, data: Partial<CategoryData>): Promise<CategoryData | undefined>;
}

export class MemStorage implements IStorage {
  private books: Map<number, Book>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private analyticsData: Map<number, Analytics>;
  private salesData: Map<number, SalesData>;
  private categoryData: Map<number, CategoryData>;
  private bookId: number;
  private cartItemId: number;
  private orderId: number;
  private orderItemId: number;
  private analyticsId: number;
  private salesDataId: number;
  private categoryDataId: number;

  constructor() {
    this.books = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.analyticsData = new Map();
    this.salesData = new Map();
    this.categoryData = new Map();
    this.bookId = 1;
    this.cartItemId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.analyticsId = 1;
    this.salesDataId = 1;
    this.categoryDataId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample book data
    const sampleBooks: InsertBook[] = [
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        description: "A classic novel about the American Dream set in the 1920s",
        price: 17.99,
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        category: "Fiction",
        format: "Hardcover",
        stock: 45,
        rating: 4.5,
        reviewCount: 86,
        isNewRelease: false,
        isBestseller: false,
        isFeatured: true
      },
      {
        title: "1984",
        author: "George Orwell",
        description: "A dystopian novel about totalitarianism and surveillance",
        price: 14.99,
        discountedPrice: 24.99,
        coverImage: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        category: "Fiction",
        format: "Paperback",
        stock: 78,
        rating: 5.0,
        reviewCount: 209,
        isNewRelease: false,
        isBestseller: true,
        isFeatured: true
      },
      {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        description: "A classic novel about racial injustice in the American South",
        price: 15.99,
        coverImage: "https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        category: "Fiction",
        format: "Paperback",
        stock: 56,
        rating: 4.0,
        reviewCount: 64,
        isNewRelease: false,
        isBestseller: false,
        isFeatured: true
      },
      {
        title: "Atomic Habits",
        author: "James Clear",
        description: "A guide to building good habits and breaking bad ones",
        price: 22.99,
        coverImage: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        category: "Non-Fiction",
        format: "Hardcover",
        stock: 34,
        rating: 3.5,
        reviewCount: 42,
        isNewRelease: true,
        isBestseller: false,
        isFeatured: true
      },
      {
        title: "The Psychology of Money",
        author: "Morgan Housel",
        description: "Timeless lessons on wealth, greed, and happiness",
        price: 18.99,
        coverImage: "https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        category: "Non-Fiction",
        format: "Hardcover",
        stock: 42,
        rating: 4.0,
        reviewCount: 78,
        isNewRelease: false,
        isBestseller: false,
        isFeatured: true
      },
      {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        description: "A classic romance novel about manners and misunderstandings",
        price: 12.99,
        coverImage: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        category: "Fiction",
        format: "Paperback",
        stock: 67,
        rating: 4.5,
        reviewCount: 112,
        isNewRelease: false,
        isBestseller: false,
        isFeatured: true
      },
      {
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        description: "A fantasy novel about the adventures of Bilbo Baggins",
        price: 19.99,
        coverImage: "https://images.unsplash.com/photo-1603871165957-8fac048427f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        category: "Fiction",
        format: "Hardcover",
        stock: 28,
        rating: 4.0,
        reviewCount: 54,
        isNewRelease: false,
        isBestseller: false,
        isFeatured: true
      },
      {
        title: "Sapiens",
        author: "Yuval Noah Harari",
        description: "A brief history of humankind from the stone age to the 21st century",
        price: 16.99,
        discountedPrice: 26.99,
        coverImage: "https://images.unsplash.com/photo-1581252164848-8bbdf61b3ca7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        category: "Non-Fiction",
        format: "Paperback",
        stock: 53,
        rating: 5.0,
        reviewCount: 97,
        isNewRelease: false,
        isBestseller: true,
        isFeatured: true
      }
    ];

    // Add sample books to storage
    sampleBooks.forEach(book => this.createBook(book));

    // Add sample category data
    const sampleCategoryData: InsertCategoryData[] = [
      { category: "Fiction", totalSales: 1250, stockLevel: 0.68 },
      { category: "Non-Fiction", totalSales: 980, stockLevel: 0.82 },
      { category: "Children's", totalSales: 320, stockLevel: 0.45 },
      { category: "Science Fiction", totalSales: 560, stockLevel: 0.23 },
      { category: "Mystery & Thriller", totalSales: 890, stockLevel: 0.76 }
    ];

    sampleCategoryData.forEach(data => this.createCategoryData(data));

    // Add sample analytics data
    const sampleAnalytics: InsertAnalytics[] = [
      { bookId: 1, currentPrice: 17.99, recommendedPrice: 19.99, potentialImpact: 240, confidence: 0.85 },
      { bookId: 7, currentPrice: 19.99, recommendedPrice: 17.99, potentialImpact: 420, confidence: 0.92 },
      { bookId: 6, currentPrice: 12.99, recommendedPrice: 14.99, potentialImpact: 180, confidence: 0.64 }
    ];

    sampleAnalytics.forEach(data => this.createPricingAnalytics(data));
  }

  // Book Operations
  async getAllBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  async getBookById(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async getBooksByCategory(category: string): Promise<Book[]> {
    return Array.from(this.books.values()).filter(book => book.category === category);
  }

  async getFeaturedBooks(): Promise<Book[]> {
    return Array.from(this.books.values()).filter(book => book.isFeatured);
  }

  async getNewReleases(): Promise<Book[]> {
    return Array.from(this.books.values()).filter(book => book.isNewRelease);
  }

  async getBestsellers(): Promise<Book[]> {
    return Array.from(this.books.values()).filter(book => book.isBestseller);
  }

  async createBook(book: InsertBook): Promise<Book> {
    const id = this.bookId++;
    const now = new Date();
    const newBook: Book = { ...book, id, createdAt: now };
    this.books.set(id, newBook);
    return newBook;
  }

  async updateBook(id: number, updates: Partial<Book>): Promise<Book | undefined> {
    const book = this.books.get(id);
    if (!book) return undefined;
    
    const updatedBook = { ...book, ...updates };
    this.books.set(id, updatedBook);
    return updatedBook;
  }

  async deleteBook(id: number): Promise<boolean> {
    return this.books.delete(id);
  }

  // Cart Operations
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.sessionId === sessionId);
  }

  async getCartItemWithBook(sessionId: string): Promise<(CartItem & { book: Book })[]> {
    const cartItems = await this.getCartItems(sessionId);
    return cartItems.map(item => {
      const book = this.books.get(item.bookId);
      if (!book) throw new Error(`Book not found for cart item ${item.id}`);
      return { ...item, book };
    });
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if this book already exists in cart for this session
    const existingCartItems = await this.getCartItems(cartItem.sessionId);
    const existingItem = existingCartItems.find(item => item.bookId === cartItem.bookId);
    
    if (existingItem) {
      // Update quantity of existing item
      return this.updateCartItem(existingItem.id, existingItem.quantity + cartItem.quantity) as Promise<CartItem>;
    }
    
    // Add new cart item
    const id = this.cartItemId++;
    const now = new Date();
    const newCartItem: CartItem = { ...cartItem, id, createdAt: now };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedCartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }

  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const cartItems = await this.getCartItems(sessionId);
    cartItems.forEach(item => this.cartItems.delete(item.id));
    return true;
  }

  // Order Operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const now = new Date();
    const newOrder: Order = { ...order, id, createdAt: now };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersBySessionId(sessionId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.sessionId === sessionId);
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const now = new Date();
    const newOrderItem: OrderItem = { ...orderItem, id, createdAt: now };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async getOrderItemsWithBooks(orderId: number): Promise<(OrderItem & { book: Book })[]> {
    const orderItems = await this.getOrderItems(orderId);
    return orderItems.map(item => {
      const book = this.books.get(item.bookId);
      if (!book) throw new Error(`Book not found for order item ${item.id}`);
      return { ...item, book };
    });
  }

  // AI Analytics Operations
  async getPricingAnalytics(): Promise<Analytics[]> {
    return Array.from(this.analyticsData.values());
  }

  async getPricingAnalyticsWithBooks(): Promise<(Analytics & { book: Book })[]> {
    const analytics = await this.getPricingAnalytics();
    return analytics.map(item => {
      const book = this.books.get(item.bookId);
      if (!book) throw new Error(`Book not found for analytics item ${item.id}`);
      return { ...item, book };
    });
  }

  async createPricingAnalytics(analytics: InsertAnalytics): Promise<Analytics> {
    const id = this.analyticsId++;
    const now = new Date();
    const newAnalytics: Analytics = { ...analytics, id, createdAt: now };
    this.analyticsData.set(id, newAnalytics);
    return newAnalytics;
  }

  // Sales Data Operations
  async getSalesData(): Promise<SalesData[]> {
    return Array.from(this.salesData.values());
  }

  async getSalesDataByCategory(): Promise<{category: string, sales: number}[]> {
    const books = await this.getAllBooks();
    const salesData = await this.getSalesData();
    
    // Group sales by book category
    const categorySales = new Map<string, number>();
    
    salesData.forEach(sale => {
      const book = books.find(b => b.id === sale.bookId);
      if (book) {
        const currentSales = categorySales.get(book.category) || 0;
        categorySales.set(book.category, currentSales + sale.quantity);
      }
    });
    
    // Convert map to array
    return Array.from(categorySales.entries()).map(([category, sales]) => ({ category, sales }));
  }

  async createSalesData(data: InsertSalesData): Promise<SalesData> {
    const id = this.salesDataId++;
    const now = new Date();
    const newSalesData: SalesData = { ...data, id, createdAt: now };
    this.salesData.set(id, newSalesData);
    return newSalesData;
  }

  // Category Data Operations
  async getCategoryData(): Promise<CategoryData[]> {
    return Array.from(this.categoryData.values());
  }

  async createCategoryData(data: InsertCategoryData): Promise<CategoryData> {
    const id = this.categoryDataId++;
    const now = new Date();
    const newCategoryData: CategoryData = { ...data, id, createdAt: now };
    this.categoryData.set(id, newCategoryData);
    return newCategoryData;
  }

  async updateCategoryData(id: number, updates: Partial<CategoryData>): Promise<CategoryData | undefined> {
    const data = this.categoryData.get(id);
    if (!data) return undefined;
    
    const updatedData = { ...data, ...updates };
    this.categoryData.set(id, updatedData);
    return updatedData;
  }
}

export const storage = new MemStorage();
