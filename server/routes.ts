import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertBookSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const router = express.Router();

  // Book Endpoints
  router.get("/books", async (req, res) => {
    try {
      const books = await storage.getBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  router.get("/books/filter", async (req, res) => {
    try {
      const query = req.query as Record<string, string>;
      
      const filters: any = {};
      
      if (query.search) filters.search = query.search;
      if (query.minPrice) filters.minPrice = parseFloat(query.minPrice);
      if (query.maxPrice) filters.maxPrice = parseFloat(query.maxPrice);
      if (query.genres) filters.genres = query.genres.split(',');
      if (query.availability) filters.availability = query.availability.split(',');
      if (query.featured) filters.featured = query.featured === 'true';
      if (query.newRelease) filters.newRelease = query.newRelease === 'true';
      if (query.bestSeller) filters.bestSeller = query.bestSeller === 'true';
      
      const books = await storage.getBooksByFilter(filters);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to filter books" });
    }
  });

  router.get("/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.getBook(id);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  router.post("/books", async (req, res) => {
    try {
      const bookData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid book data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create book" });
    }
  });

  router.put("/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bookData = req.body;
      
      const book = await storage.updateBook(id, bookData);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Failed to update book" });
    }
  });

  router.delete("/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBook(id);
      
      if (!success) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  // Analytics Endpoints
  router.get("/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  router.get("/analytics/book/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analytics = await storage.getAnalyticsByBookId(id);
      
      if (!analytics) {
        return res.status(404).json({ message: "Analytics not found for this book" });
      }
      
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch book analytics" });
    }
  });

  // Sales Endpoints
  router.get("/sales", async (req, res) => {
    try {
      const sales = await storage.getSales();
      
      // Group sales by date for chart data
      const salesByDate = sales.reduce((acc, sale) => {
        const dateStr = sale.date.toISOString().split('T')[0];
        
        if (!acc[dateStr]) {
          acc[dateStr] = {
            date: dateStr,
            totalQuantity: 0,
            totalAmount: 0
          };
        }
        
        acc[dateStr].totalQuantity += Number(sale.quantity);
        acc[dateStr].totalAmount += Number(sale.totalAmount);
        
        return acc;
      }, {} as Record<string, { date: string, totalQuantity: number, totalAmount: number }>);
      
      const chartData = Object.values(salesByDate).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      res.json({
        sales,
        chartData
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales data" });
    }
  });

  // Category Distribution Endpoint
  router.get("/category-distribution", async (req, res) => {
    try {
      const books = await storage.getBooks();
      const sales = await storage.getSales();
      
      // Get sales by book ID
      const salesByBookId = sales.reduce((acc, sale) => {
        if (!acc[sale.bookId]) {
          acc[sale.bookId] = 0;
        }
        acc[sale.bookId] += Number(sale.quantity);
        return acc;
      }, {} as Record<number, number>);
      
      // Calculate distribution by genre
      const distribution = books.reduce((acc, book) => {
        const genre = book.genre;
        
        if (!acc[genre]) {
          acc[genre] = {
            genre,
            bookCount: 0,
            totalSales: 0
          };
        }
        
        acc[genre].bookCount += 1;
        acc[genre].totalSales += salesByBookId[book.id] || 0;
        
        return acc;
      }, {} as Record<string, { genre: string, bookCount: number, totalSales: number }>);
      
      res.json({
        bySales: Object.values(distribution).sort((a, b) => b.totalSales - a.totalSales),
        byInventory: Object.values(distribution).sort((a, b) => b.bookCount - a.bookCount)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category distribution" });
    }
  });

  // Orders and Cart Endpoints
  router.post("/orders", async (req, res) => {
    try {
      const { orderData, orderItems } = req.body;
      
      // Create the order
      const order = await storage.createOrder(orderData);
      
      // Create order items
      for (const item of orderItems) {
        await storage.createOrderItem({
          orderId: order.id,
          bookId: item.bookId,
          quantity: item.quantity,
          priceAtPurchase: item.price
        });
      }
      
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Register the router with a prefix
  app.use("/api", router);

  return httpServer;
}
