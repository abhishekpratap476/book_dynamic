import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface InventoryChartProps {
  data: any[] | undefined;
  loading: boolean;
}

const InventoryChart = ({ data, loading }: InventoryChartProps) => {
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
        <p className="text-neutral-500 text-sm">No inventory data available</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        data: data.map(item => item.totalSales),
        backgroundColor: [
          'hsl(144, 70%, 60%)',   // Light green
          'hsl(144, 70%, 40%)',   // Medium green
          'hsl(144, 70%, 20%)',   // Dark green
          'hsl(36, 70%, 60%)',    // Light tan
          'hsl(36, 70%, 40%)',    // Medium tan
        ],
        borderColor: [
          'hsl(144, 70%, 50%)',   // Green border
          'hsl(144, 70%, 30%)',   // Green border
          'hsl(144, 70%, 10%)',   // Green border
          'hsl(36, 70%, 50%)',    // Tan border
          'hsl(36, 70%, 30%)',    // Tan border
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return <Pie data={chartData} options={options} />;
};

export default InventoryChart;
