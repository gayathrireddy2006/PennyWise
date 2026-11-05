import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpenseChart({ expenses }) {
  // 1. Calculate totals per category
  const categoryTotals = {};
  
  expenses.forEach((exp) => {
    if (categoryTotals[exp.category]) {
      categoryTotals[exp.category] += exp.amount;
    } else {
      categoryTotals[exp.category] = exp.amount;
    }
  });

  const labels = Object.keys(categoryTotals);
  const dataValues = Object.values(categoryTotals);

  // If no expenses, don't show the chart
  if (labels.length === 0) {
    return null;
  }

  // 2. Configure the Chart Data
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Amount (₹)',
        data: dataValues,
        backgroundColor: [
          '#ef4444', // Food (Red)
          '#3b82f6', // Transport (Blue)
          '#f59e0b', // Shopping (Yellow)
          '#8b5cf6', // Bills (Purple)
          '#10b981', // Other (Green)
        ],
        borderColor: '#1e293b',
        borderWidth: 2,
      },
    ],
  };

  // 3. Configure Chart Options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#e2e8f0', // Light text for dark theme
          font: { family: 'Inter', size: 14 }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return ` ₹${context.raw.toLocaleString('en-IN')}`;
          }
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <h3>Spending by Category</h3>
      <div style={{ maxWidth: '300px', margin: '0 auto' }}>
        <Pie data={data} options={options} />
      </div>
    </div>
  );
}