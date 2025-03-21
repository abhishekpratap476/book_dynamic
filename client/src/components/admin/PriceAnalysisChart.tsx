import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Analytics, Book } from '@shared/schema';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PriceAnalysisChartProps {
  data: (Analytics & { book: Book })[] | undefined;
  loading: boolean;
}

// Simulated data for the chart
const generatePriceSensitivityData = (books: (Analytics & { book: Book })[] | undefined) => {
  if (!books || books.length === 0) return { prices: [], sales: [] };

  // Generate data points for price-sales curve
  const samplePrices: number[] = [];
  const projectedSales: number[] = [];
  
  // Get average price from books
  const avgPrice = books.reduce((sum, item) => sum + item.currentPrice, 0) / books.length;
  
  // Generate price points from 50% to 150% of average price
  const minPrice = avgPrice * 0.5;
  const maxPrice = avgPrice * 1.5;
  const step = (maxPrice - minPrice) / 10;
  
  for (let price = minPrice; price <= maxPrice; price += step) {
    samplePrices.push(parseFloat(price.toFixed(2)));
    
    // Sales curve (higher at lower prices, lower at higher prices)
    const normalizedPrice = (price - minPrice) / (maxPrice - minPrice); // 0 to 1
    const salesFactor = 1 - Math.pow(normalizedPrice, 1.5); // Non-linear decreasing curve
    
    // Baseline is 100 sales, varying from 20 to 100 based on price
    const sales = Math.round(20 + salesFactor * 80);
    projectedSales.push(sales);
  }
  
  return {
    prices: samplePrices,
    sales: projectedSales
  };
};

const PriceAnalysisChart = ({ data, loading }: PriceAnalysisChartProps) => {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-neutral-200 border-t-[#1a4d2e] animate-spin rounded-full"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-neutral-500 text-sm">No price analysis data available</p>
      </div>
    );
  }

  // Generate simulated data
  const { prices, sales } = generatePriceSensitivityData(data);
  
  // Mark optimal prices from recommendations
  const optimalPrices = data.map(item => item.recommendedPrice);
  const optimalSalesPoints = optimalPrices.map(price => {
    // Find closest price in our simulation
    const closestPriceIndex = prices.reduce((closest, p, index) => 
      Math.abs(p - price) < Math.abs(prices[closest] - price) ? index : closest, 0);
    return sales[closestPriceIndex];
  });

  const chartData = {
    labels: prices,
    datasets: [
      {
        label: 'Projected Sales',
        data: sales,
        borderColor: 'hsl(144, 60%, 40%)',
        backgroundColor: 'rgba(26, 77, 46, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Optimal Price Points',
        data: optimalPrices.map((price, i) => ({
          x: price,
          y: optimalSalesPoints[i]
        })),
        backgroundColor: 'hsl(36, 100%, 50%)',
        borderColor: 'hsl(36, 100%, 40%)',
        pointRadius: 6,
        pointHoverRadius: 8,
        showLine: false,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            if (context.dataset.label === 'Projected Sales') {
              return `Price: $${context.label}, Sales: ${context.raw} units`;
            } else {
              return `Optimal Price: $${context.parsed.x.toFixed(2)}, Projected Sales: ${context.parsed.y}`;
            }
          }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Sales Volume (units)',
        },
        min: 0,
      },
      x: {
        title: {
          display: true,
          text: 'Price ($)',
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default PriceAnalysisChart;
