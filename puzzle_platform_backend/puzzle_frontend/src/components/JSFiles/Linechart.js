import React from "react";
import { Bar } from "react-chartjs-2";
import "../CSSFiles/Linechart.css"; // Import the CSS file

function LineChart({ userStatistics }) {
  if (!userStatistics || !userStatistics.completed_each_task) {
    return null; // Return null or a loading indicator if data is not available yet
  }

  const completedEachTask = userStatistics.completed_each_task;

  // Extracting task numbers and data
  const taskNumbers = Object.keys(completedEachTask);
  const totalQuestionsData = taskNumbers.map(task => completedEachTask[task].total_puzzles);
  const completedQuestionsData = taskNumbers.map(task => completedEachTask[task].completed_puzzles);

  const data = {
    labels: taskNumbers.map(task => `Task ${task}`),
    datasets: [
      {
        label: "Total questions",
        data: totalQuestionsData,
        backgroundColor: "#5F84E3",
        borderColor: "#5F84E3",
        borderWidth: 1,
      },
      {
        label: "Number of questions completed",
        data: completedQuestionsData,
        backgroundColor: "#BBCAF1",
        borderColor: "#BBCAF1",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: true,
      },
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
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="Main">
      <div className="statis">Statistics</div>
      <div className="heading-chart">Task Improvement</div>
      <div className="graph" style={{ width: "450px", height: "400px" }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

export default LineChart;
