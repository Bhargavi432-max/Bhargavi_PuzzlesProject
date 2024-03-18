import { Line } from "react-chartjs-2";
import "./Linechart.css"; // Import the CSS file

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from 'chart.js';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

function LineChart() {
  const data = {
    labels: ['Task 1', 'Task 2', 'Task 3', 'Task3', 'Task4', 'Task5', 'Task6'],
    datasets: [{
      label: 'no of questions completed',
      data: [5, 2, 5, 10, 4, 8, 5],
      backgroundColor: 'aqua',
      borderColor: '#336699', // Change line color to a specific shade
      pointBackgroundColor: '#FFF', // Set point fill color to white
      pointBorderColor: '#336699', // Set point stroke color to #336699
      pointBorderWidth: 1, // Set point stroke width
      pointRadius: 7, // Set point radius
      pointHoverRadius: 10, // Set point hover radius
      fill: true,
      tension: 0
    }]
  };

  const options = {
    plugins: {
      legend: true,
      tooltip: {
        enabled: true,
      }
    },
    scales: {
      x: {
        grid: {
          display: false // Hide vertical grid lines
        }
      },
      y: {
        grid: {
          display: true // Display horizontal grid lines
        }
      }
    }
  };

  return (
    <div className="Main">
      <div className="statis">Statistics</div>
      <div className="heading-chart">Task Improvement</div>
      <div className="graph" style={{ width: '450px', height: '400px' }}>
        <Line
          data={data}
          options={options}
        />
      </div>
    </div>
  );
}

export default LineChart;
