import { Line } from "react-chartjs-2";
import "./TaskDataChart.css"; // Import the CSS file

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function TaskDataChart() {
  const data = {
    labels: [
      "Task 1",
      "Task 2",
      "Task 3",
      "Task3",
      "Task4",
      "Task5",
      "Task6",
      "Task 7",
      "Task8",
      "Task9",
      "Task10",
      "Task11",
    ],
    datasets: [
      {
        label: "no of questions completed",
        data: [5, 2, 5, 10, 4, 8, 5, 10, 4, 8, 5],
        backgroundColor: "transparent",
        borderColor: "#336699", // Change line color to a specific shade
        pointBackgroundColor: "#FFF", // Set point fill color to white
        pointBorderColor: "#336699", // Set point stroke color to #336699
        pointBorderWidth: 1, // Set point stroke width
        pointRadius: 7, // Set point radius
        pointHoverRadius: 10, // Set point hover radius
        fill: true,
        tension: 0,
      },
    ],
  };

  const options = {
    plugins: {
      legend: true,
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Hide vertical grid lines
        },
        ticks: {
          font: {
            size: 14 // Increase x-axis label font size
          }
        },
        maxBarThickness: 20 // Set maximum thickness of each bar (label spacing)
      },
      y: {
        grid: {
          display: true, // Display horizontal grid lines
        },
        ticks: {
          font: {
            size: 14 // Increase y-axis label font size
          }
        }
      },
    },
    layout: {
      padding: {
        left: 20, // Adjust left padding to fit labels properly
        right: 40, // Adjust right padding to fit labels properly
        top: 0,
        bottom: 0
      }
    }
  };

  return (
    <div className="Main-box">
      <div className="box-statis">Statistics</div>
      <div className="chart-heading">Task Improvement</div>
      <div className="graph-box">
        <div className="chart-container" style={{ width: "950px", height: "225px" }}>
          <Line 
            data={data} 
            options={options} 
            style={{ width: "100%", height: "100%" }} // Set width and height here
          />
        </div>
      </div>
    </div>
  );
}

export default TaskDataChart;
