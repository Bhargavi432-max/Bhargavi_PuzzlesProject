import React from "react";
import "./OverallPie.css";
import { Pie } from "react-chartjs-2";

function TimePieChart({ percentage }) {
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
    <div className="TimePieChart">
      <div style={{ width: "120px", height: "120px", position: "relative" }}>
        <Pie data={data} options={options} />
      </div>
    </div>
  );
}

const TaskLevelPage = () => {
  return (
    <div className="container">
      <div className="container-box">
        <div className="text-pie">High Score</div>
        <div className="big-text">Difficulty Level</div>
        <div className="circle" id="greenCircle">
          <TimePieChart percentage={60} /> {/* Render TimePieChart with 60% */}
        </div>
        <div className="circle" id="yellowCircle">
          <TimePieChart percentage={30} /> {/* Render TimePieChart with 30% */}
        </div>
        <div className="circle" id="purpleCircle">
          <TimePieChart percentage={80} /> {/* Render TimePieChart with 80% */}
        </div>
      </div>
    </div>
  );
};

export default TaskLevelPage;
