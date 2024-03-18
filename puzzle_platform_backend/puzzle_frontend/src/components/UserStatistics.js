import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement } from "chart.js";
import "./UserStatistics.css"; // Import the CSS file

ChartJS.register(ArcElement);

// Color indication dot component with label
function ColorDot({ color, label }) {
  return (
    <div className="color-dot" style={{ backgroundColor: color }}>
      {label}
    </div>
  );
}

// Percentage indication component
function PercentageIndicator({ percentage }) {
  return <div className="percentage-indicator">{percentage}%</div>;
}

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
      <div style={{ width: "120px", height: "120px", position: "relative" }}>
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
      <div style={{ width: "160px", height: "160px", position: "relative" }}>
        <Pie data={data} options={options} />
        <SubInnerPieChart percentage={30} /> {/* Include another sub inner pie chart */}
      </div>
    </div>
  );
}

function SinglePercentagePieChart({ percentage }) {
  // Calculate the remaining percentage (to fill the pie chart)
  const remainingPercentage = 100 - percentage;
  const skippedPercentage = 100 - (percentage + 30); // Assuming the skipped percentage is the remainder

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
      
      <div className="pie-chart-container"><div className="names">
        <div className="subtext-pie">Statistics</div>
      <h2 className="main-pie">Overall</h2>
      </div>

      <div style={{ width: "200px", height: "200px", position: "relative" }}>
        <Pie data={data} options={options} />
        <InnerPieChart percentage={percentage} />
      </div>
      {/* Color indication dots and percentage indicators */}
      <div className="indicator-container">
        <div className="indicator">
          <ColorDot color="#39BC90" />
          <PercentageIndicator percentage={percentage} />
          <span className="label">Completed</span>
        </div>
        <div className="indicator">
          <ColorDot color="#3366CC" />
          <PercentageIndicator percentage={remainingPercentage} />
          <span className="label">Incomplete</span>
        </div>
        <div className="indicator">
          <ColorDot color="#FFC83A" />
          <PercentageIndicator percentage={skippedPercentage} />
          <span className="label">Skipped</span>
        </div>
      </div>
      </div>
    </div>
  );
}

export default SinglePercentagePieChart;
