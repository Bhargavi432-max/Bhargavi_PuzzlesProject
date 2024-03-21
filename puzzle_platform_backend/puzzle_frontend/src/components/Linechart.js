import React from "react";
import { Line } from "react-chartjs-2";
import "./Linechart.css"; // Import the CSS file

function LineChart({ userStatistics }) {
  if (!userStatistics || !userStatistics.completed_each_task) {
    return null; // Return null or a loading indicator if data is not available yet
  }

  const completedEachTask = userStatistics.completed_each_task;

  const data = {
    labels: Object.keys(completedEachTask).map(task => `Task ${task}`),
    datasets: [
      {
        label: "Number of questions completed",
        data: Object.values(completedEachTask),
        backgroundColor: "transparent",
        borderColor: "#336699",
        pointBackgroundColor: "#FFF",
        pointBorderColor: "#336699",
        pointBorderWidth: 1,
        pointRadius: 7,
        pointHoverRadius: 10,
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
          display: false,
        },
      },
      y: {
        grid: {
          display: true,
        },
      },
    },
  };

  return (
    <div className="Main">
      <div className="statis">Statistics</div>
      <div className="heading-chart">Task Improvement</div>
      <div className="graph" style={{ width: "450px", height: "400px" }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

export default LineChart;
