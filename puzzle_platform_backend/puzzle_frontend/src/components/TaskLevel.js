import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2"; // Import Doughnut from react-chartjs-2
import "./TaskLevel.css"; // Import CSS file
import TimeTakenChart from "./AreaChart";
import TaskDataChart from "./TaskDataChart";

function TaskLevel() {
  const [responseData, setResponseData] = useState(null);
  const [activeButton, setActiveButton] = useState(null);
  const email = localStorage.getItem("email");

  const handleClick = async (taskId, index) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/get_user_taskwise_statistics/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            task_id: taskId,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setResponseData(data);
        setActiveButton(index);
      } else {
        console.error("Error fetching data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const renderLegend = () => {
    return (
      <div className="legend">
        <div className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: "#AAF77B" }}
          ></span>
          <span>Easy</span>
        </div>
        <div className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: "#962DFF" }}
          ></span>
          <span>Medium</span>
        </div>
        <div className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: "#FFB5B0" }}
          ></span>
          <span>Hard</span>
        </div>
      </div>
    );
  };

  return (
    <div className="task-level-container">
      <div className="button-container">
        {[...Array(25)].map((_, index) => (
          <button
            className={`button-level${activeButton === index ? " active" : ""}`} // Apply 'active' class if the button is active
            key={index}
            onClick={() => handleClick(index + 1, index)}
          >
            Task {index + 1}
          </button>
        ))}
      </div>
      <div className="chart-container">
        {responseData ? (
          <div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <div className="chart-details">
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <div className="chart-levels">{renderLegend()}</div>

                  <Doughnut
                    data={{
                      labels: ["Easy", "Medium", "Hard"],
                      datasets: [
                        {
                          data: [
                            responseData.user_statistics
                              .completed_puzzles_by_level.EASY,
                            responseData.user_statistics
                              .completed_puzzles_by_level.MEDIUM,
                            responseData.user_statistics
                              .completed_puzzles_by_level.HARD,
                          ],
                          backgroundColor: ["#AAF77B", "#962DFF", "#FFB5B0"],
                          borderColor: ["#AAF77B", "#962DFF", "#FFB5B0"],
                          borderWidth: 1,
                          borderRadius: 6,
                        },
                      ],
                    }}
                    options={{
                      cutoutPercentage: 50,
                      cutout: 70,
                      radius: 100,
                      plugins: {
                        legend: {
                          display: false, // Hide legend
                        },
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              var label = context.label || "";
                              if (label) {
                                label += ": ";
                              }
                              label += context.raw;
                              return label;
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
              <div className="timetakenchart">
                <TimeTakenChart
                  timeTakenData={
                    responseData.user_statistics.time_taken
                  }
                />
              </div>
            </div>
            <div className="linechart">
              <TaskDataChart
                completedPuzzlesByDate={
                  responseData.user_statistics.completed_puzzles_by_date
                }
              />
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}

export default TaskLevel;
