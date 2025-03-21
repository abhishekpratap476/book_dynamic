import { brain, INeuralNetworkOptions } from 'brain.js';
import { Book, Analytics } from '@shared/schema';

interface SalesData {
  bookId: number;
  quantity: number;
  date: Date;
}

interface PriceSensitivityData {
  price: number;
  salesVolume: number;
}

interface DemandForecast {
  bookId: number;
  category: string;
  predictedDemand: number;
  confidence: number;
}

interface CategoryForecast {
  category: string;
  projectedGrowth: number;
  stockLevel: number;
  recommendation: string;
}

// Neural network for price prediction
export class PriceOptimizer {
  private network: brain.NeuralNetwork;
  
  constructor() {
    // Configure neural network options
    const config: INeuralNetworkOptions = {
      hiddenLayers: [4],
      activation: 'sigmoid',
    };
    
    this.network = new brain.NeuralNetwork(config);
  }
  
  // Train the model with historical price and sales data
  train(data: PriceSensitivityData[]) {
    // Normalize data for neural network input
    const trainingData = data.map(item => ({
      input: { price: this.normalizePrice(item.price) },
      output: { sales: this.normalizeSales(item.salesVolume) }
    }));
    
    // Train the network
    this.network.train(trainingData);
  }
  
  // Predict optimal price for maximum sales
  predictOptimalPrice(
    currentPrice: number, 
    minPrice: number, 
    maxPrice: number, 
    priceStep: number = 0.5
  ): { optimalPrice: number, predictedSalesIncrease: number, confidence: number } {
    // Test different price points
    let maxSales = 0;
    let optimalPrice = currentPrice;
    let confidenceScore = 0;
    
    // Scan through price range
    for (let price = minPrice; price <= maxPrice; price += priceStep) {
      const normalizedPrice = this.normalizePrice(price);
      const prediction = this.network.run({ price: normalizedPrice }) as { sales: number };
      const sales = this.denormalizeSales(prediction.sales);
      
      if (sales > maxSales) {
        maxSales = sales;
        optimalPrice = price;
        // Confidence is higher closer to the current price
        const priceDifference = Math.abs(price - currentPrice) / currentPrice;
        confidenceScore = 1 - Math.min(priceDifference, 0.5) * 2; // 0.5-1.0 range
      }
    }
    
    // Calculate predicted sales increase
    const currentSalesPrediction = this.network.run({ price: this.normalizePrice(currentPrice) }) as { sales: number };
    const currentSales = this.denormalizeSales(currentSalesPrediction.sales);
    const predictedSalesIncrease = maxSales - currentSales;
    
    return {
      optimalPrice: parseFloat(optimalPrice.toFixed(2)),
      predictedSalesIncrease: Math.round(predictedSalesIncrease),
      confidence: parseFloat(confidenceScore.toFixed(2))
    };
  }
  
  // Normalize price for neural network input (0-1 range)
  private normalizePrice(price: number): number {
    // Assuming price ranges from 0-100
    return price / 100;
  }
  
  // Normalize sales for neural network input (0-1 range)
  private normalizeSales(sales: number): number {
    // Assuming sales could be up to 1000 units
    return sales / 1000;
  }
  
  // Denormalize sales back to original scale
  private denormalizeSales(normalizedSales: number): number {
    return normalizedSales * 1000;
  }
}

// Function to analyze book demand and generate recommendations
export function analyzeBookDemand(
  book: Book,
  salesHistory: SalesData[],
  categoryAverages: { [category: string]: number }
): Analytics {
  // Get sales history for this book
  const bookSales = salesHistory.filter(sale => sale.bookId === book.id);
  
  // Calculate average category price
  const categoryAverage = categoryAverages[book.category] || book.price;
  
  // Simple recommendation algorithm
  let recommendedPrice: number;
  let potentialImpact: number;
  let confidence: number;
  
  // Higher rated books can have higher prices
  const ratingFactor = book.rating / 5.0;
  
  if (book.rating > 4.0) {
    // For high-rated books, recommend slight price increase if current price is below average
    recommendedPrice = book.price < categoryAverage ? book.price * 1.1 : book.price;
    potentialImpact = Math.round((recommendedPrice - book.price) * bookSales.length * 0.8);
    confidence = 0.75 + (book.rating - 4) * 0.1; // Higher confidence for higher ratings
  } else {
    // For lower-rated books, recommend price decrease if above average
    recommendedPrice = book.price > categoryAverage ? book.price * 0.9 : book.price;
    potentialImpact = Math.round((categoryAverage - recommendedPrice) * bookSales.length * 1.2);
    confidence = 0.6 + (book.rating - 3) * 0.1;
  }
  
  // Round prices to 2 decimal places
  recommendedPrice = parseFloat(recommendedPrice.toFixed(2));
  confidence = parseFloat(confidence.toFixed(2));
  
  return {
    id: 0, // This will be assigned by the database
    bookId: book.id,
    currentPrice: book.price,
    recommendedPrice,
    potentialImpact,
    confidence,
    createdAt: new Date()
  };
}

// Function to generate category-based demand forecasts
export function generateCategoryForecasts(categoryData: {
  id: number;
  category: string;
  totalSales: number;
  stockLevel: number;
}[]): CategoryForecast[] {
  return categoryData.map(category => {
    // Generate projected growth based on category
    let projectedGrowth: number;
    
    switch (category.category) {
      case 'Fiction':
        projectedGrowth = 12;
        break;
      case 'Non-Fiction':
        projectedGrowth = 8;
        break;
      case 'Children\'s':
        projectedGrowth = 3;
        break;
      case 'Science Fiction':
        projectedGrowth = -2;
        break;
      default:
        projectedGrowth = 5;
    }
    
    // Generate recommendation based on stock level and projected growth
    let recommendation: string;
    
    if (category.stockLevel < 0.3) {
      recommendation = 'Immediate restock needed';
    } else if (category.stockLevel < 0.5) {
      recommendation = projectedGrowth > 5 ? 'Urgent restock recommended' : 'Consider restocking';
    } else {
      recommendation = 'Stock levels optimal';
    }
    
    return {
      category: category.category,
      projectedGrowth,
      stockLevel: category.stockLevel,
      recommendation
    };
  });
}
