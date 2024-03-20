import React from 'react';
import { Pie } from 'react-chartjs-2';

function SinglePercentagePieChart({ easyPercentage, mediumPercentage, hardPercentage }) {
  // Calculate the remaining percentages
  const remainingEasyPercentage = 20;
  const remainingMediumPercentage = 70;
  const remainingHardPercentage = 10;

  // Define data for the outer pie chart
  const data = {
    labels: ["Completed", "Remaining"],
    datasets: [
      {
        data: [easyPercentage, remainingEasyPercentage],
        backgroundColor: ["#39BC90", "#E5E5EF"], // Green for completed, Gray for remaining
        borderRadius: 10,
      },
      {
        data: [mediumPercentage, remainingMediumPercentage],
        backgroundColor: ["#3366CC", "#E5E5EF"], // Blue for completed, Gray for remaining
        borderRadius: 10,
      },
      {
        data: [hardPercentage, remainingHardPercentage],
        backgroundColor: ["#FFC83A", "#E5E5EF"], // Yellow for completed, Gray for remaining
        borderRadius: 10,
      }
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
      <div className="pie-chart-container">
        <div className="names">
          <div className="subtext-pie">Statistics</div>
          <h2 className="main-pie">Overall</h2>
        </div>

        <div style={{ width: "200px", height: "200px", position: "relative" }}>
          <Pie data={data} options={options} />
        </div>
        
        {/* Color indication dots and percentage indicators */}
        <div className="indicator-container">
          <div className="indicator">
            <ColorDot color="#39BC90" />
            <PercentageIndicator percentage={easyPercentage} />
            <span className="label">Easy Completed</span>
          </div>
          <div className="indicator">
            <ColorDot color="#3366CC" />
            <PercentageIndicator percentage={mediumPercentage} />
            <span className="label">Medium Completed</span>
          </div>
          <div className="indicator">
            <ColorDot color="#FFC83A" />
            <PercentageIndicator percentage={hardPercentage} />
            <span className="label">Hard Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SinglePercentagePieChart;
