import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { nanoid } from "nanoid";
import { insertBookSchema, insertCartItemSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { brain } from "brain.js";

const network = new brain.recurrent.LSTM();

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper middleware to ensure session ID exists
  const ensureSessionId = (req: any, res: any, next: any) => {
    if (!req.headers["x-session-id"]) {
      req.headers["x-session-id"] = nanoid();
    }
    next();
  };

  app.use(ensureSessionId);

  // Book Routes
  app.get("/api/books", async (req, res) => {
    try {
      const books = await storage.getAllBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch books" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const book = await storage.getBookById(parseInt(req.params.id));
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch book" });
    }
  });

  app.get("/api/books/category/:category", async (req, res) => {
    try {
      const books = await storage.getBooksByCategory(req.params.category);
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch books by category" });
    }
  });

  app.get("/api/books/featured", async (req, res) => {
    try {
      const books = await storage.getFeaturedBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured books" });
    }
  });

  app.get("/api/books/new-releases", async (req, res) => {
    try {
      const books = await storage.getNewReleases();
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch new releases" });
    }
  });

  app.get("/api/books/bestsellers", async (req, res) => {
    try {
      const books = await storage.getBestsellers();
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bestsellers" });
    }
  });

  app.post("/api/books", async (req, res) => {
    try {
      const bookData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create book" });
    }
  });

  app.put("/api/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bookData = insertBookSchema.partial().parse(req.body);
      const updatedBook = await storage.updateBook(id, bookData);
      if (!updatedBook) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.json(updatedBook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update book" });
    }
  });

  app.delete("/api/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBook(id);
      if (!deleted) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete book" });
    }
  });

  // Cart Routes
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = req.headers["x-session-id"] as string;
      const cartWithBooks = await storage.getCartItemWithBook(sessionId);
      
      // Calculate total
      const total = cartWithBooks.reduce((sum, item) => {
        const price = item.book.discountedPrice || item.book.price;
        return sum + price * item.quantity;
      }, 0);
      
      res.json({
        items: cartWithBooks,
        total: parseFloat(total.toFixed(2))
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = req.headers["x-session-id"] as string;
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        sessionId
      });
      
      const cartItem = await storage.addToCart(cartItemData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ error: "Quantity must be a positive number" });
      }
      
      const updatedItem = await storage.updateCartItem(id, quantity);
      if (!updatedItem) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.removeFromCart(id);
      if (!deleted) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove item from cart" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = req.headers["x-session-id"] as string;
      await storage.clearCart(sessionId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  // Order Routes
  app.post("/api/orders", async (req, res) => {
    try {
      const sessionId = req.headers["x-session-id"] as string;
      
      // Get cart items
      const cartItems = await storage.getCartItemWithBook(sessionId);
      if (cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }
      
      // Calculate total
      const total = cartItems.reduce((sum, item) => {
        const price = item.book.discountedPrice || item.book.price;
        return sum + price * item.quantity;
      }, 0);
      
      // Create order
      const orderData = insertOrderSchema.parse({
        ...req.body,
        sessionId,
        total: parseFloat(total.toFixed(2))
      });
      
      const order = await storage.createOrder(orderData);
      
      // Create order items
      for (const item of cartItems) {
        const price = item.book.discountedPrice || item.book.price;
        await storage.createOrderItem({
          orderId: order.id,
          bookId: item.bookId,
          quantity: item.quantity,
          price
        });
        
        // Update book stock
        const book = await storage.getBookById(item.bookId);
        if (book) {
          await storage.updateBook(book.id, {
            stock: book.stock - item.quantity
          });
          
          // Add to sales data for analytics
          await storage.createSalesData({
            bookId: book.id,
            quantity: item.quantity,
            date: new Date()
          });
        }
      }
      
      // Clear cart
      await storage.clearCart(sessionId);
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      const items = await storage.getOrderItemsWithBooks(order.id);
      res.json({ ...order, items });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const sessionId = req.headers["x-session-id"] as string;
      const orders = await storage.getOrdersBySessionId(sessionId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Analytics Routes
  app.get("/api/analytics/pricing", async (req, res) => {
    try {
      const analytics = await storage.getPricingAnalyticsWithBooks();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pricing analytics" });
    }
  });

  app.get("/api/analytics/categories", async (req, res) => {
    try {
      const categoryData = await storage.getCategoryData();
      res.json(categoryData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category analytics" });
    }
  });

  app.get("/api/analytics/sales", async (req, res) => {
    try {
      const salesByCategory = await storage.getSalesDataByCategory();
      res.json(salesByCategory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales analytics" });
    }
  });
  
  // Dashboard summary statistics
  app.get("/api/analytics/summary", async (req, res) => {
    try {
      // Get all sales data
      const salesData = await storage.getSalesData();
      const orders = Array.from((await storage.getAllBooks()).values());
      
      // Calculate total revenue
      let totalRevenue = 0;
      let totalUnitsSold = 0;
      
      for (const sale of salesData) {
        const book = await storage.getBookById(sale.bookId);
        if (book) {
          const price = book.discountedPrice || book.price;
          totalRevenue += price * sale.quantity;
          totalUnitsSold += sale.quantity;
        }
      }
      
      // Calculate average order value
      const avgOrderValue = totalUnitsSold > 0 ? (totalRevenue / totalUnitsSold) : 0;
      
      // Count low stock items
      const lowStockItems = orders.filter(book => book.stock < 15).length;
      
      res.json({
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalUnitsSold,
        avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
        lowStockItems
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics summary" });
    }
  });

  // AI Price Recommendation
  app.post("/api/analytics/recommend-price", async (req, res) => {
    try {
      const { bookId } = req.body;
      if (!bookId) {
        return res.status(400).json({ error: "Book ID is required" });
      }
      
      const book = await storage.getBookById(bookId);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      
      // Get existing analytics if available
      const allAnalytics = await storage.getPricingAnalytics();
      const existingAnalytics = allAnalytics.find(a => a.bookId === bookId);
      
      if (existingAnalytics) {
        return res.json(existingAnalytics);
      }
      
      // Perform simple price recommendation based on category averages and rating
      const books = await storage.getAllBooks();
      const categoryBooks = books.filter(b => b.category === book.category && b.id !== book.id);
      
      if (categoryBooks.length === 0) {
        return res.status(400).json({ error: "Not enough data for recommendations" });
      }
      
      const avgPrice = categoryBooks.reduce((sum, b) => sum + b.price, 0) / categoryBooks.length;
      const ratingFactor = book.rating / 5.0;
      
      // Higher rating = higher price recommendation, lower rating = lower price
      let recommendedPrice;
      let potentialImpact = 0;
      let confidence = 0;
      
      if (book.rating > 4.0) {
        // For high-rated books, recommend slight price increase if current price is below average
        recommendedPrice = book.price < avgPrice ? book.price * 1.1 : book.price;
        potentialImpact = Math.round((recommendedPrice - book.price) * book.reviewCount);
        confidence = 0.75 + (book.rating - 4) * 0.1; // Higher confidence for higher ratings
      } else {
        // For lower-rated books, recommend price decrease if above average
        recommendedPrice = book.price > avgPrice ? book.price * 0.9 : book.price;
        potentialImpact = Math.round((avgPrice - recommendedPrice) * book.reviewCount * 1.5);
        confidence = 0.6 + (book.rating - 3) * 0.1;
      }
      
      // Round price to 2 decimal places
      recommendedPrice = parseFloat(recommendedPrice.toFixed(2));
      confidence = parseFloat(confidence.toFixed(2));
      
      // Save the recommendation
      const newAnalytics = await storage.createPricingAnalytics({
        bookId: book.id,
        currentPrice: book.price,
        recommendedPrice,
        potentialImpact,
        confidence
      });
      
      res.json(newAnalytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate price recommendation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
