import * as brain from "brain.js";

// Define types for our AI analytics
export interface BookData {
  id: number;
  price: number;
  stockQuantity: number;
  rating: number;
  salesHistory: number[];
}

export interface PriceSuggestion {
  bookId: number;
  currentPrice: number;
  suggestedPrice: number;
  percentChange: number;
  demandTrend: "rising" | "stable" | "falling";
}

// Function to predict optimal pricing
export function predictOptimalPrice(bookData: BookData): PriceSuggestion {
  // Create a simple neural network
  const net = new brain.NeuralNetwork({
    hiddenLayers: [3]
  });

  // Normalize sales history data
  const maxSale = Math.max(...bookData.salesHistory);
  const normalizedSales = bookData.salesHistory.map(sale => sale / maxSale);
  
  // Calculate trend
  const recentSales = normalizedSales.slice(-3);
  let trend: "rising" | "stable" | "falling" = "stable";
  if (recentSales.length >= 2) {
    const avgChange = (recentSales[recentSales.length - 1] - recentSales[0]) / recentSales.length;
    if (avgChange > 0.05) trend = "rising";
    else if (avgChange < -0.05) trend = "falling";
  }

  // Train with simplified data
  // In a real application, we'd use more sophisticated training data
  net.train([
    { input: { stock: 0.1, rating: 0.9, salesTrend: 0.8 }, output: { priceMultiplier: 1.2 } },
    { input: { stock: 0.5, rating: 0.5, salesTrend: 0.5 }, output: { priceMultiplier: 1.0 } },
    { input: { stock: 0.9, rating: 0.2, salesTrend: 0.2 }, output: { priceMultiplier: 0.8 } },
  ]);

  // Normalize input for our prediction
  const normalizedStockLevel = 1 - (bookData.stockQuantity / 100); // assuming 100 is max stock
  const normalizedRating = bookData.rating / 5;
  const normalizedTrend = trend === "rising" ? 0.8 : trend === "stable" ? 0.5 : 0.2;

  // Make prediction
  const result = net.run({
    stock: normalizedStockLevel,
    rating: normalizedRating,
    salesTrend: normalizedTrend
  }) as { priceMultiplier: number };

  // Calculate suggested price
  const suggestedPrice = bookData.price * result.priceMultiplier;
  const percentChange = ((suggestedPrice - bookData.price) / bookData.price) * 100;

  return {
    bookId: bookData.id,
    currentPrice: bookData.price,
    suggestedPrice: Math.round(suggestedPrice * 100) / 100, // round to 2 decimal places
    percentChange: Math.round(percentChange * 10) / 10, // round to 1 decimal place
    demandTrend: trend
  };
}

// Function to calculate demand score (0-10)
export function calculateDemandScore(bookData: BookData): number {
  const recentSales = bookData.salesHistory.slice(-5);
  const totalRecentSales = recentSales.reduce((sum, sale) => sum + sale, 0);
  
  // Calculate weighted score based on sales, ratings, and stock levels
  const salesScore = Math.min(10, totalRecentSales / 5);
  const ratingScore = (bookData.rating / 5) * 10;
  const stockScore = 10 - Math.min(10, bookData.stockQuantity / 10);
  
  // Weighted average
  const demandScore = (salesScore * 0.5) + (ratingScore * 0.3) + (stockScore * 0.2);
  
  return Math.round(demandScore * 10) / 10; // round to 1 decimal place
}

// Function to analyze category distribution
export function analyzeCategoryDistribution(books: any[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  books.forEach(book => {
    const genre = book.genre;
    distribution[genre] = (distribution[genre] || 0) + 1;
  });
  
  // Convert to percentages
  const total = books.length;
  Object.keys(distribution).forEach(genre => {
    distribution[genre] = Math.round((distribution[genre] / total) * 100);
  });
  
  return distribution;
}
