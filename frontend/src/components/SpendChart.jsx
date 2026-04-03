import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const SpendChart = ({ items }) => {
  // Grouping data for the chart
  const categories = {};
  items.forEach(item => {
    const cat = item.category || 'General';
    categories[cat] = (categories[cat] || 0) + item.amount;
  });

  const data = {
    labels: Object.keys(categories),
    datasets: [{
      data: Object.values(categories),
      backgroundColor: ['#6366f1', '#a855f7', '#ec4899', '#22d3ee', '#10b981'],
      hoverOffset: 15,
      borderWidth: 0,
    }],
  };

  const options = {
    cutout: '75%',
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Poppins' } } },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ height: '250px', position: 'relative' }}>
      <Doughnut data={data} options={options} />
      <div className="chart-center">
        <p>Expenses</p>
      </div>
    </div>
  );
};

export default SpendChart;