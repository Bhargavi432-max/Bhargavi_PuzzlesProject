import React from "react";
import { Bar } from "react-chartjs-2";
import "./TaskDataChart.css"; // Import the CSS file

function TaskDataChart({ completedPuzzlesByDate }) {
  // Check if completedPuzzlesByDate is undefined or null
  if (!completedPuzzlesByDate) {
    return <p>No data available</p>; // Return a message or render a placeholder if data is not available
  }

  // Convert completedPuzzlesByDate object into arrays for labels and data
  const labels = Object.keys(completedPuzzlesByDate);
  const dataValues = Object.values(completedPuzzlesByDate);

  // Dynamically determine the background color based on the value of completed puzzles
  const backgroundColors = dataValues.map(value =>
    value <= 2 ? "#BBCAF1" : "#5F84E3"
  );

  // Dynamically determine the border color based on the value of completed puzzles
  const borderColors = dataValues.map(value =>
    value <= 2 ? "#BBCAF1" : "#5F84E3"
  );

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Number of questions completed",
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: borderColors, // Set border color
        borderWidth: 1, // Set border width
        barThickness: 10, // Set bar width
      },
    ],
  };

  const options = {
    // Your options configuration here...
    maintainAspectRatio: false,
    
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
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="Main-box">
      <div className="box-statis">Statistics</div>
      <div className="chart-heading">Task Improvement</div>
      <div className="graph-box">
        <div
          className="mychart-container"
          style={{ width: "950px", height: "225px" }}
        >
          <Bar
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
