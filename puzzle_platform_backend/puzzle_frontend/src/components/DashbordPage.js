import React, { useEffect, useState } from "react";
import SinglePercentagePieChart from "./UserStatistics";
import LineChart from "./Linechart";
import TaskLevelPage from "./OverallPie";
import "./DashbordPage.css"; // Import CSS for styling

const DashboardPage = () => {
  const [responseData, setResponseData] = useState(null); // State for response data
  const email = localStorage.getItem("email"); // Example email, replace with actual email

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/get_user_statistics/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setResponseData(data);
        } else {
          console.error("Error fetching data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [email]);
  return (
    <div className="dashboard-page">
      <div className="content">
        <div className="pie-container">
          <div className="box-structure">
            <SinglePercentagePieChart percentage={75} />
          </div>
        </div>
        <LineChart className="linechart" />
        <TaskLevelPage className="tasklevel" />
      </div>
    </div>
  );
};

export default DashboardPage;
