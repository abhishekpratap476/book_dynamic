import * as brain from "brain.js";

// Define types for our AI analytics
export interface BookData {
  id: number;
  price: number;
  stockQuantity: number;
  rating: number;
  salesHistory: number[];
  marketAverage?: number;
  competitorPrices?: number[];
}

export interface PriceSuggestion {
  bookId: number;
  currentPrice: number;
  suggestedPrice: number;
  percentChange: number;
  demandTrend: "rising" | "stable" | "falling";
  marketAverage?: number;
  competitivePosition?: "premium" | "average" | "discount";
  elasticityFactor?: number;
}

// Function to predict optimal pricing
export function predictOptimalPrice(bookData: BookData): PriceSuggestion {
  // Create a simple neural network
  const net = new brain.NeuralNetwork({
    hiddenLayers: [4]
  });

  // Normalize sales history data
  const maxSale = Math.max(...bookData.salesHistory, 1);
  const normalizedSales = bookData.salesHistory.map(sale => sale / maxSale);
  
  // Calculate trend
  const recentSales = normalizedSales.slice(-3);
  let trend: "rising" | "stable" | "falling" = "stable";
  if (recentSales.length >= 2) {
    const avgChange = (recentSales[recentSales.length - 1] - recentSales[0]) / recentSales.length;
    if (avgChange > 0.05) trend = "rising";
    else if (avgChange < -0.05) trend = "falling";
  }

  // Determine price elasticity factor based on demand trend and stock
  // Rising demand = less elastic (can increase price more)
  // Falling demand = more elastic (need to be price competitive)
  const elasticityFactor = trend === "rising" 
    ? 0.7 
    : trend === "falling" 
      ? 1.3 
      : 1.0;

  // Calculate competitive position relative to market
  let competitivePosition: "premium" | "average" | "discount" = "average";
  let marketFactor = 1.0;
  
  if (bookData.marketAverage) {
    // How our price compares to market average
    const priceRatio = bookData.price / bookData.marketAverage;
    
    if (priceRatio > 1.1) {
      competitivePosition = "premium";
      // Premium books adjust slower to market changes
      marketFactor = 0.9;
    } else if (priceRatio < 0.9) {
      competitivePosition = "discount";
      // Discount books adjust faster to market changes
      marketFactor = 1.1;
    }
  }

  // Train with enhanced data including market position and elasticity
  net.train([
    // High demand scenarios (stock low, rating high, trend rising)
    { input: { stock: 0.1, rating: 0.9, salesTrend: 0.8, market: 0.9 }, output: { priceMultiplier: 1.15 } },
    { input: { stock: 0.2, rating: 0.8, salesTrend: 0.7, market: 1.0 }, output: { priceMultiplier: 1.10 } },
    // Average demand scenarios
    { input: { stock: 0.5, rating: 0.5, salesTrend: 0.5, market: 1.0 }, output: { priceMultiplier: 1.0 } },
    { input: { stock: 0.4, rating: 0.6, salesTrend: 0.6, market: 1.1 }, output: { priceMultiplier: 1.05 } },
    // Low demand scenarios (high stock, low ratings, falling trend)
    { input: { stock: 0.8, rating: 0.3, salesTrend: 0.3, market: 1.1 }, output: { priceMultiplier: 0.85 } },
    { input: { stock: 0.9, rating: 0.2, salesTrend: 0.2, market: 1.0 }, output: { priceMultiplier: 0.80 } },
  ]);

  // Normalize input for our prediction
  const normalizedStockLevel = 1 - (bookData.stockQuantity / 100); // assuming 100 is max stock
  const normalizedRating = bookData.rating / 5;
  const normalizedTrend = trend === "rising" ? 0.8 : trend === "stable" ? 0.5 : 0.2;

  // Make prediction using our neural network
  const result = net.run({
    stock: normalizedStockLevel,
    rating: normalizedRating,
    salesTrend: normalizedTrend,
    market: marketFactor
  }) as { priceMultiplier: number };

  // Calculate suggested price with elasticity adjustments
  let suggestedPrice = bookData.price * result.priceMultiplier;
  
  // If we have market average data, use it to refine our prediction
  if (bookData.marketAverage) {
    // Blend our neural network suggestion with market data
    // For premium books, we rely less on market average
    // For discount books, we rely more on market average
    const marketWeight = competitivePosition === "premium" ? 0.3 : 
                         competitivePosition === "discount" ? 0.7 : 0.5;
    
    // Calculate market-adjusted price
    const marketAdjustedPrice = (bookData.marketAverage * marketWeight) + 
                               (suggestedPrice * (1 - marketWeight));
    
    // Apply elasticity factor - less elastic products can deviate more from market
    suggestedPrice = ((marketAdjustedPrice * elasticityFactor) + suggestedPrice) / 2;
  }
  
  const percentChange = ((suggestedPrice - bookData.price) / bookData.price) * 100;

  return {
    bookId: bookData.id,
    currentPrice: bookData.price,
    suggestedPrice: Math.round(suggestedPrice * 100) / 100, // round to 2 decimal places
    percentChange: Math.round(percentChange * 10) / 10, // round to 1 decimal place
    demandTrend: trend,
    marketAverage: bookData.marketAverage,
    competitivePosition,
    elasticityFactor
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
