import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SalesChartProps {
  data: any[] | undefined;
  loading: boolean;
}

const SalesChart = ({ data, loading }: SalesChartProps) => {
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
        <p className="text-neutral-500 text-sm">No sales data available</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        label: 'Sales Volume',
        data: data.map(item => item.sales),
        backgroundColor: 'hsl(144, 60%, 30%)',
        borderColor: 'hsl(144, 60%, 20%)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
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
        beginAtZero: true,
        title: {
          display: true,
          text: 'Units Sold',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Book Category',
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default SalesChart;
