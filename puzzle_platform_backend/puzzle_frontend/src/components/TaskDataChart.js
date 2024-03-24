import { Line } from "react-chartjs-2";
import "./TaskDataChart.css"; // Import the CSS file

function TaskDataChart({ completedPuzzlesByDate }) {
  // Check if completedPuzzlesByDate is undefined or null
  if (!completedPuzzlesByDate) {
    return <p>No data available</p>; // Return a message or render a placeholder if data is not available
  }

  // Convert completedPuzzlesByDate object into arrays for labels and data
  const labels = Object.keys(completedPuzzlesByDate);
  const dataValues = Object.values(completedPuzzlesByDate);

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Number of questions completed",
        data: dataValues,
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
    // Your options configuration here...
    maintainAspectRatio: false,
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
