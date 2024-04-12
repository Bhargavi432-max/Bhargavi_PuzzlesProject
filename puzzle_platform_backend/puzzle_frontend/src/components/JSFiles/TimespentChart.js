import React from "react";
import { Doughnut } from "react-chartjs-2";
import "../CSSFiles/TimespentChart.css";
import watchIcon from "../Images/stopwatch.png";

const RingPieChart = ({ totalTimeSpent }) => {
  // Extract hours, minutes, and seconds from totalTimeSpent
  const { hours, minutes, seconds } = totalTimeSpent;

  // Convert total time spent to seconds
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  // Calculate percentage of time spent in seconds
  const timePercentage = (totalSeconds / (24 * 3600)) * 100; // Assuming total time is within 24 hours

  // Format time spent as "hh:mm"
  const timeSpentFormatted = `${hours}h ${minutes}m`;

  // Chart data
  const data = {
    labels: ["Time Spent", "Remaining"],
    datasets: [
      {
        data: [timePercentage, 100 - timePercentage],
        backgroundColor: ["#776BFF", "#E5E5EF"], // Purple for time spent, Gray for remaining
        borderWidth: 0,
      },
    ],
  };

  // Chart options
  const options = {
    cutin: 40,
    cutout: 20, // Inner radius for the ring effect
    plugins: {
      legend: {
        display: false, // Hide legend
      },
      tooltip: {
        enabled: false, // Disable tooltip
      },
    },
  };

  return (
    <div className="time-container">
         <div className="watch-container">
            <div className="watch">
            <img src={watchIcon} alt="watch" className="watch-image" />
            </div>
         </div>
        <div className="watch-text">Time Duration</div>
        <div className="timechart-container">
          <Doughnut data={data} options={options} />
          <div className="time-spent">{timeSpentFormatted}</div>
        </div>
    </div>
  );
};

export default RingPieChart;
