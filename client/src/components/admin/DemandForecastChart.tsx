import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface DemandForecastChartProps {
  data: any[] | undefined;
  loading: boolean;
}

// Generate forecast data for next 12 months
const generateForecastData = (categoryData: any[] | undefined) => {
  if (!categoryData || categoryData.length === 0) return { labels: [], datasets: [] };
  
  const today = new Date();
  const labels = [];
  
  // Generate month labels for next 12 months
  for (let i = 0; i < 12; i++) {
    const month = new Date(today.getFullYear(), today.getMonth() + i, 1);
    labels.push(month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
  }
  
  // Generate forecasted data per category
  const datasets = categoryData.map((category, index) => {
    // Starting point is the current sales level
    const baseSales = category.totalSales / 6; // Divide by 6 to get a monthly estimate
    
    // Different growth patterns based on category
    let growthRate;
    let color;
    
    switch (category.category) {
      case 'Fiction':
        growthRate = 0.03; // 3% monthly growth
        color = 'hsl(144, 60%, 40%)'; // Green
        break;
      case 'Non-Fiction':
        growthRate = 0.02; // 2% monthly growth
        color = 'hsl(216, 60%, 40%)'; // Blue
        break;
      case 'Children\'s':
        growthRate = 0.01; // 1% monthly growth
        color = 'hsl(36, 60%, 60%)'; // Light tan
        break;
      case 'Science Fiction':
        growthRate = -0.005; // -0.5% monthly decline
        color = 'hsl(0, 60%, 60%)'; // Red
        break;
      case 'Mystery & Thriller':
        growthRate = 0.015; // 1.5% monthly growth
        color = 'hsl(270, 60%, 60%)'; // Purple
        break;
      default:
        growthRate = 0.01;
        color = `hsl(${index * 60}, 60%, 50%)`;
    }
    
    // Generate demand forecast with some randomness
    const forecastedSales = Array(12).fill(0).map((_, i) => {
      const trend = baseSales * Math.pow(1 + growthRate, i);
      const randomVariation = trend * (Math.random() * 0.1 - 0.05); // +/- 5% random variation
      return Math.round(trend + randomVariation);
    });
    
    // Confidence interval (upper and lower bounds)
    const upperBound = forecastedSales.map(val => Math.round(val * 1.15)); // +15%
    const lowerBound = forecastedSales.map(val => Math.round(val * 0.85)); // -15%

    return {
      label: category.category,
      data: forecastedSales,
      borderColor: color,
      backgroundColor: `${color}33`, // Add transparency for area
      tension: 0.3,
      fill: false,
      hidden: index > 1, // Only show first two categories by default to avoid clutter
    };
  });
  
  return { labels, datasets };
};

const DemandForecastChart = ({ data, loading }: DemandForecastChartProps) => {
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
        <p className="text-neutral-500 text-sm">No forecast data available</p>
      </div>
    );
  }

  const { labels, datasets } = generateForecastData(data);

  const chartData = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${value} units`;
          }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Projected Demand (units)',
        },
        beginAtZero: true,
      },
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default DemandForecastChart;
