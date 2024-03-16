import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement } from "chart.js";
import "./UserStatistics.css"; // Import the CSS file

ChartJS.register(ArcElement);

function SubInnerPieChart({ percentage }) {
  // Calculate the remaining percentage (to fill the pie chart)
  const remainingPercentage = 100 - percentage;

  // Define data for the sub inner pie chart
  const data = {
    labels: ["Completed", "Remaining"],
    datasets: [
      {
        data: [percentage, remainingPercentage],
        backgroundColor: ["#FFC83A", "#E5E5EF"], // Orange for completed, Gray for remaining
        borderRadius: 10,
      },
    ],
  };

  // Define options for the sub inner pie chart
  const options = {
    cutout: 50, // Inner radius
    radius: 60, // Outer radius
    plugins: {
      legend: false, // Hide legend
    },
    responsive: true, // Make the chart responsive
  };

  return (
    <div className="SubInnerPieChart">
      <div style={{ width: "120px", height: "120px" }}>
        <Pie data={data} options={options} />
      </div>
    </div>
  );
}

function InnerPieChart({ percentage }) {
  // Calculate the remaining percentage (to fill the pie chart)
  const remainingPercentage = 100 - percentage;

  // Define data for the inner pie chart
  const data = {
    labels: ["Completed", "Remaining"],
    datasets: [
      {
        data: [percentage, remainingPercentage],
        backgroundColor: ["#3366CC", "#E5E5EF"], // Blue for completed, Gray for remaining
        borderRadius: 10,
      },
    ],
  };

  // Define options for the inner pie chart
  const options = {
    cutout: 70, // Inner radius
    radius: 80, // Outer radius
    plugins: {
      legend: false, // Hide legend
    },
    responsive: true, // Make the chart responsive
  };

  return (
    <div className="InnerPieChart">
      <div style={{ width: "160px", height: "160px" }}>
        <Pie data={data} options={options} />
        <SubInnerPieChart percentage={30} /> {/* Include another sub inner pie chart */}
      </div>
    </div>
  );
}

function SinglePercentagePieChart({ percentage }) {
  // Calculate the remaining percentage (to fill the pie chart)
  const remainingPercentage = 100 - percentage;

  // Define data for the outer pie chart
  const data = {
    labels: ["Completed", "Remaining"],
    datasets: [
      {
        data: [percentage, remainingPercentage],
        backgroundColor: ["#39BC90", "#E5E5EF"], // Green for completed, Gray for remaining
        borderRadius: 10,
      },
    ],
  };

  // Define options for the outer pie chart
  const options = {
    cutout: 90, // Inner radius
    radius: 100, // Outer radius
    plugins: {
      legend: false, // Hide legend
    },
    responsive: true, // Make the chart responsive
  };

  return (
    <div className="SinglePercentagePieChart">
      <h2>Progress</h2>
      <div style={{ width: "200px", height: "200px" }}>
        <Pie data={data} options={options} />
        <InnerPieChart percentage={50} />
      </div>
    </div>
  );
}

export default SinglePercentagePieChart;
